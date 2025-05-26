import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFirebase } from '../firebase';
import Alert from './Alert';
import PlaylistFormHeader from './PlaylistFormHeader';
import GeminiSuggestionsDisplay from './GeminiSuggestionsDisplay';
import CurrentMixtapeDisplay from './CurrentMixtapeDisplay';
import { Loader2, Image as ImageIcon, Sparkles, LogIn, ChevronLeft, Save, Lightbulb } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const formatDuration = (totalMilliseconds) => {
    if (isNaN(totalMilliseconds) || totalMilliseconds < 0) { return '00:00'; }
    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const paddedSeconds = seconds.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    if (hours > 0) { return `${hours}:${paddedMinutes}:${paddedSeconds}`; }
    return `${paddedMinutes}:${paddedSeconds}`;
};

const PlaylistCreator = ({ existingPlaylist, onSaveSuccess }) => {
    const { db, currentUser, appId, isLoadingAuth } = useFirebase();

    const [theme, setTheme] = useState('');
    const [originalThemePrompt, setOriginalThemePrompt] = useState('');
    const [songs, setSongs] = useState([]);
    const [linerNotes, setLinerNotes] = useState('');
    const [coverArtUrl, setCoverArtUrl] = useState('');
    const [tags, setTags] = useState([]);
    const [currentTagInput, setCurrentTagInput] = useState('');
    const [seedSongInputs, setSeedSongInputs] = useState([]);
    const [currentSeedSong, setCurrentSeedSong] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [startYear, setStartYear] = useState('');
    const [endYear, setEndYear] = useState('');
    const [preferHiddenGems, setPreferHiddenGems] = useState(false);
    const [languagePreferences, setLanguagePreferences] = useState('');
    const [excludeKeywords, setExcludeKeywords] = useState('');
    const [instrumentalVocalRatio, setInstrumentalVocalRatio] = useState('balanced');
    const [fusionGenres, setFusionGenres] = useState([]);
    const [currentFusionGenreInput, setCurrentFusionGenreInput] = useState('');
    const [storyNarrative, setStoryNarrative] = useState('');
    const [vibeArcDescription, setVibeArcDescription] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isLoadingLinerNotes, setIsLoadingLinerNotes] = useState(false);
    const [isLoadingTitle, setIsLoadingTitle] = useState(false);
    const [suggestedTitles, setSuggestedTitles] = useState([]);
    const [isLoadingFutureIdeas, setIsLoadingFutureIdeas] = useState(false);
    const [futurePlaylistIdeas, setFuturePlaylistIdeas] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [editingNoteForSongId, setEditingNoteForSongId] = useState(null);
    const [currentSongNote, setCurrentSongNote] = useState('');

    const dragSongItem = useRef(null);
    const dragOverSongItem = useRef(null);
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

    useEffect(() => {
        if (isLoadingAuth) return;
        if (!currentUser) {
            if (onSaveSuccess) onSaveSuccess(); // Navigate away if user gets signed out
            return;
        }
        if (existingPlaylist) {
            setTheme(existingPlaylist.theme || '');
            setOriginalThemePrompt(existingPlaylist.originalThemePrompt || existingPlaylist.theme || '');
            setSongs(existingPlaylist.songs?.map(s => ({ ...s, id: s.id || crypto.randomUUID(), duration_ms: s.duration_ms || (180000 + Math.floor(Math.random() * 60000)), personalNote: s.personalNote || '' })) || []);
            setLinerNotes(existingPlaylist.linerNotes || '');
            setCoverArtUrl(existingPlaylist.coverArtUrl || '');
            setTags(existingPlaylist.tags || []);
            setSeedSongInputs(existingPlaylist.seedSongs || []);
            setIsPublic(existingPlaylist.isPublic || false);
            setStartYear(existingPlaylist.startYear || '');
            setEndYear(existingPlaylist.endYear || '');
            setPreferHiddenGems(existingPlaylist.preferHiddenGems || false);
            setLanguagePreferences(existingPlaylist.languagePreferences || '');
            setExcludeKeywords(existingPlaylist.excludeKeywords || '');
            setInstrumentalVocalRatio(existingPlaylist.instrumentalVocalRatio || 'balanced');
            setFusionGenres(existingPlaylist.fusionGenres || []);
            setStoryNarrative(existingPlaylist.storyNarrative || '');
            setVibeArcDescription(existingPlaylist.vibeArcDescription || '');
        } else { // Reset form for new playlist
            setTheme(''); setOriginalThemePrompt(''); setSongs([]); setLinerNotes(''); setCoverArtUrl(''); setTags([]); setSeedSongInputs([]);
            setIsPublic(false);
            setStartYear(''); setEndYear(''); setPreferHiddenGems(false); setLanguagePreferences('');
            setExcludeKeywords(''); setInstrumentalVocalRatio('balanced'); setFusionGenres([]);
            setStoryNarrative(''); setVibeArcDescription('');
        }
        setAiSuggestions([]); setSuggestedTitles([]); setError(null); setSuccessMessage(null); setFuturePlaylistIdeas([]);
    }, [existingPlaylist, currentUser, isLoadingAuth, onSaveSuccess]);

    const displayError = (message) => { console.error("PC Error:", message); setError(message); setTimeout(() => setError(null), 4000); };
    const displaySuccess = (message) => { console.log("PC Success:", message); setSuccessMessage(message); setTimeout(() => setSuccessMessage(null), 3000); };

    const handleThemeInputChange = (e) => { setTheme(e.target.value); if (!originalThemePrompt || Math.abs(e.target.value.length - originalThemePrompt.length) > 5) { setOriginalThemePrompt(e.target.value); }};

    const callGeminiAPI = async (prompt, responseSchema = null) => {
        console.log("PC: callGeminiAPI - Prompt snippet:", prompt.substring(0, 100) + "...");
        if (!geminiApiKey) {
            const errorMsg = "Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.";
            console.error(errorMsg);
            displayError(errorMsg);
            throw new Error(errorMsg);
        }
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        };
        if (responseSchema) {
            payload.generationConfig = {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            };
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errData = await response.json();
                console.error("Gemini API error response:", errData);
                throw new Error(errData?.error?.message || `API Error ${response.status}`);
            }
            const result = await response.json();
            console.log("PC: callGeminiAPI - Full Gemini Result:", result);

            if (!result.candidates || result.candidates.length === 0 || !result.candidates[0].content || !result.candidates[0].content.parts || result.candidates[0].content.parts.length === 0) {
                console.warn("No valid candidates/content/parts in Gemini response:", result);
                throw new Error("No valid content received from AI.");
            }
            const textResponse = result.candidates[0].content.parts[0].text;
            if (!textResponse) {
                console.warn("No text response from Gemini, result:", result);
                throw new Error("No valid text response from AI.");
            }
            return responseSchema ? JSON.parse(textResponse) : textResponse;
        } catch (error) {
            console.error("PC: callGeminiAPI - Fetch or Parsing Error:", error);
            throw error; // Re-throw to be caught by calling function
        }
    };

    const handleGetSongIdeas = async () => {
        console.log("PC: handleGetSongIdeas - START");
        try {
            const currentThemeForPrompt = originalThemePrompt.trim() || theme.trim();
            if (!currentThemeForPrompt && seedSongInputs.length === 0 && fusionGenres.length === 0 && !storyNarrative.trim() && !vibeArcDescription.trim()) {
                displayError("Please provide a theme, seed songs, fusion genres, story, or vibe arc to get ideas.");
                return;
            }
            setIsLoadingSuggestions(true); setAiSuggestions([]);
            let promptParts = [];
            if (currentThemeForPrompt) promptParts.push(`The overall theme for the playlist is "${currentThemeForPrompt}".`);
            if (seedSongInputs.length > 0) { const seeds = seedSongInputs.join(', '); promptParts.push(`It should be inspired by these seed songs: ${seeds}. Do not suggest the seed songs themselves.`); }
            if (fusionGenres.length > 0) { promptParts.push(`Creatively fuse these genres: ${fusionGenres.join(', ')}. Highlight the blend.`); }
            if (storyNarrative.trim()) { promptParts.push(`The playlist should follow this narrative arc or story: "${storyNarrative.trim()}". Suggest songs that fit different parts of this story sequentially if possible.`); }
            if (vibeArcDescription.trim()) { promptParts.push(`The playlist should have this kind of energy/vibe progression: "${vibeArcDescription.trim()}".`); }
            if (startYear && endYear && parseInt(startYear) <= parseInt(endYear)) promptParts.push(`Focus on songs from ${startYear}-${endYear}.`);
            else if (startYear) promptParts.push(`Focus on songs from ${startYear} onwards.`);
            else if (endYear) promptParts.push(`Focus on songs up to ${endYear}.`);
            if (preferHiddenGems) promptParts.push("Prioritize lesser-known tracks/artists (hidden gems).");
            if (languagePreferences.trim()) promptParts.push(`Include songs primarily in: ${languagePreferences.trim()}.`);
            if (instrumentalVocalRatio === 'mostly_instrumental') promptParts.push("The playlist should be mostly instrumental.");
            else if (instrumentalVocalRatio === 'mostly_vocal') promptParts.push("The playlist should be mostly vocal tracks.");
            if (excludeKeywords.trim()) promptParts.push(`Exclude songs related to, or by, or in the genre of: ${excludeKeywords.trim()}.`);
            if (songs.length > 0) { const existingSongTitles = songs.slice(0, 5).map(s => `"${s.title}" by ${s.artist}`).join(', '); promptParts.push(`The playlist already contains: ${existingSongTitles}. Avoid re-suggesting these or very similar tracks.`); }

            let prompt = `Generate a list of 10 song suggestions. ${promptParts.join(" ")} For each song, provide title, artist, and album (if applicable). Also, provide an estimated duration in milliseconds (e.g., "duration_ms": 210000).`;
            console.log("PC: handleGetSongIdeas - Gemini Prompt:", prompt);

            const schema = { type: "OBJECT", properties: { "suggestions": { type: "ARRAY", items: { type: "OBJECT", properties: { "title": { "type": "STRING" }, "artist": { "type": "STRING" }, "album": { "type": "STRING" }, "duration_ms": { "type": "NUMBER" } }, required: ["title", "artist", "duration_ms"] }}}};
            const parsed = await callGeminiAPI(prompt, schema);
            console.log("PC: handleGetSongIdeas - Parsed Gemini response:", parsed);

            const newSuggestions = parsed.suggestions?.filter(suggestedSong =>
                suggestedSong && typeof suggestedSong.title === 'string' && typeof suggestedSong.artist === 'string' &&
                !songs.some(existingSong => existingSong.title.toLowerCase() === suggestedSong.title.toLowerCase() && existingSong.artist.toLowerCase() === suggestedSong.artist.toLowerCase()) &&
                !seedSongInputs.some(seed => { const [seedTitle, seedArtist] = seed.toLowerCase().split(' by '); return suggestedSong.title.toLowerCase() === (seedTitle?.trim()) && (seedArtist ? suggestedSong.artist.toLowerCase().includes(seedArtist.trim()) : true);})
            ) || [];
            console.log("PC: handleGetSongIdeas - Filtered newSuggestions:", newSuggestions);

            setAiSuggestions(newSuggestions.map(s => ({ ...s, id: crypto.randomUUID(), duration_ms: (typeof s.duration_ms === 'number' && s.duration_ms > 30000) ? s.duration_ms : (180000 + Math.floor(Math.random() * 60000)) })) || []);

            if (newSuggestions.length === 0) {
                 if (parsed.suggestions && parsed.suggestions.length > 0) { displaySuccess("AI suggested songs that are already in your playlist or very similar. Try adjusting your preferences or theme!"); }
                 else { displaySuccess("AI couldn't find new song ideas for this combination. Try being more descriptive or adjusting preferences!"); }
            } else {
                displaySuccess(`${newSuggestions.length} new song ideas generated!`);
            }
        } catch (err) {
            console.error("PC: handleGetSongIdeas - CRITICAL ERROR:", err);
            displayError(`Song ideas failed: ${err.message}`);
        } finally {
            setIsLoadingSuggestions(false);
            console.log("PC: handleGetSongIdeas - END");
        }
    };

    const handleSuggestPlaylistTitle = async () => {
        try {
            console.log("PC: handleSuggestPlaylistTitle - START. originalThemePrompt:", originalThemePrompt);
            const currentThemeForPrompt = originalThemePrompt.trim();
            if (!currentThemeForPrompt) {
                displayError("Please enter an initial theme idea to get title suggestions.");
                return;
            }
            setIsLoadingTitle(true); setSuggestedTitles([]);
            const prompt = `Based on the theme or idea "${currentThemeForPrompt}", suggest 3 creative and catchy titles for a music playlist.`;
            const schema = { type: "OBJECT", properties: { "titles": { type: "ARRAY", items: { type: "STRING" } } } };
            const parsed = await callGeminiAPI(prompt, schema);
            console.log("PC: handleSuggestPlaylistTitle - Gemini response parsed:", parsed);
            setSuggestedTitles(parsed.titles || []);
            if (!parsed.titles || parsed.titles.length === 0) {
                displaySuccess("AI couldn't come up with titles for this. Try a different theme idea!");
            }
        } catch (err) {
            console.error("PC: handleSuggestPlaylistTitle - CRITICAL ERROR:", err);
            displayError(`Title suggestions failed: ${err.message}`);
        } finally {
            setIsLoadingTitle(false);
            console.log("PC: handleSuggestPlaylistTitle - END");
        }
    };

    const handleGenerateLinerNotes = async () => {
        console.log("PC: handleGenerateLinerNotes - START");
        if ((!originalThemePrompt.trim() && !theme.trim()) || songs.length === 0) {
            displayError("Please set a theme and add some songs before generating liner notes.");
            return;
        }
        setIsLoadingLinerNotes(true);
        try {
            const songList = songs.map(s => `"${s.title}" by ${s.artist}`).join(', ');
            const prompt = `Write a short, engaging paragraph of liner notes (around 50-70 words) for a playlist titled "${theme || originalThemePrompt}". The playlist includes songs like: ${songList}. Capture the mood or story of the playlist.`;
            const notes = await callGeminiAPI(prompt);
            setLinerNotes(notes);
            displaySuccess("Liner notes generated!");
        } catch (err) {
            console.error("PC: handleGenerateLinerNotes - CRITICAL ERROR:", err);
            displayError(`Liner notes generation failed: ${err.message}`);
        } finally {
            setIsLoadingLinerNotes(false);
            console.log("PC: handleGenerateLinerNotes - END");
        }
    };

    const addSongToPlaylist = (song) => {
        try {
            console.log("PC: addSongToPlaylist - START. Song:", song);
            if (!song || typeof song.title !== 'string' || typeof song.artist !== 'string') {
                console.warn("Attempted to add invalid song object:", song);
                displayError("Cannot add invalid song data.");
                return;
            }
            if (!songs.some(s => s.title.toLowerCase() === song.title.toLowerCase() && s.artist.toLowerCase() === song.artist.toLowerCase())) {
                const songToAdd = { ...song, id: song.id || crypto.randomUUID(), duration_ms: song.duration_ms || (180000 + Math.floor(Math.random() * 60000)), personalNote: '' };
                setSongs(prev => [...prev, songToAdd]);
                displaySuccess(`"${song.title}" added to mixtape!`);
            } else {
                displaySuccess(`"${song.title}" is already in your mixtape.`);
            }
            console.log("PC: addSongToPlaylist - END");
        } catch(e) {
            console.error("PC: addSongToPlaylist - CRITICAL ERROR:", e);
            displayError("Error adding song: " + e.message);
        }
    };
    const removeSongFromPlaylist = (songId) => { console.log("PC: removeSongFromPlaylist for ID:", songId); setSongs(prev => prev.filter(s => s.id !== songId)); };

    const handleAddTag = () => {
        console.log("PC: handleAddTag - START. currentTagInput:", currentTagInput);
        const newTag = currentTagInput.trim().toLowerCase();
        if (newTag && !tags.includes(newTag) && tags.length < 10) {
            setTags(prevTags => [...prevTags, newTag]);
            setCurrentTagInput('');
            displaySuccess(`Tag "${newTag}" added!`);
        } else if (tags.includes(newTag)) {
            displayError("Tag already added.");
        } else if (tags.length >= 10) {
            displayError("Maximum of 10 tags allowed.");
        } else if (!newTag) {
            displayError("Tag cannot be empty.");
        }
        console.log("PC: handleAddTag - END. Current tags:", tags);
    };

    const handleRemoveTag = (tagToRemove) => {
        console.log("PC: handleRemoveTag - Removing:", tagToRemove);
        setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
        console.log("PC: handleRemoveTag - END. Current tags:", tags);
    };

    const handleEditSongNote = (songId) => {
        console.log("PC: handleEditSongNote for ID:", songId);
        const songToEdit = songs.find(s => s.id === songId);
        if (songToEdit) {
            setEditingNoteForSongId(songId);
            setCurrentSongNote(songToEdit.personalNote || '');
        }
    };

    const handleSaveSongNote = (songId) => {
        console.log("PC: handleSaveSongNote for ID:", songId, "with note:", currentSongNote);
        setSongs(prevSongs => prevSongs.map(song =>
            song.id === songId ? { ...song, personalNote: currentSongNote.trim() } : song
        ));
        setEditingNoteForSongId(null);
        setCurrentSongNote('');
        displaySuccess("Personal note saved!");
    };

    const handleCancelEditSongNote = () => {
        console.log("PC: handleCancelEditSongNote");
        setEditingNoteForSongId(null);
        setCurrentSongNote('');
    };

    const handleDragStart = (e, position) => {
        console.log("PC: handleDragStart - position:", position);
        dragSongItem.current = position;
        e.dataTransfer.effectAllowed = "move";
        // Optional: Add a class for visual feedback
        // e.currentTarget.classList.add('dragging');
    };

    const handleDragEnter = (e, position) => {
        console.log("PC: handleDragEnter - position:", position);
        dragOverSongItem.current = position;
        // Optional: Visual feedback for drop target
        // e.currentTarget.classList.add('dragover');
    };
    
    const handleDragLeave = (e) => {
        // Optional: Remove visual feedback if item is dragged out of a potential target
        // e.currentTarget.classList.remove('dragover');
    };

    const handleDrop = (e, dropPosition) => {
        console.log("PC: handleDrop - dropPosition:", dropPosition);
        const newSongs = [...songs];
        const draggedItemContent = newSongs[dragSongItem.current];
        newSongs.splice(dragSongItem.current, 1);
        newSongs.splice(dropPosition, 0, draggedItemContent); // Use dropPosition directly
        dragSongItem.current = null;
        dragOverSongItem.current = null; // Reset this too
        setSongs(newSongs);
        // Optional: Remove visual feedback classes
        // e.currentTarget.classList.remove('dragover');
    };

    const handleDragEnd = (e) => {
        console.log("PC: handleDragEnd");
        // Optional: Clean up any visual feedback classes
        // e.currentTarget.classList.remove('dragging');
        // Array.from(songsListRef.current.children).forEach(child => child.classList.remove('dragover'));
        dragSongItem.current = null;
        dragOverSongItem.current = null;
    };
    
    const handleDragOver = (e) => { e.preventDefault(); }; // Necessary for onDrop to fire

    const handleAddSeedSong = () => {
        console.log("PC: handleAddSeedSong - START. currentSeedSong:", currentSeedSong);
        const newSeed = currentSeedSong.trim();
        if (newSeed && !seedSongInputs.some(s => s.toLowerCase() === newSeed.toLowerCase()) && seedSongInputs.length < 5) {
            setSeedSongInputs(prev => [...prev, newSeed]);
            setCurrentSeedSong('');
            displaySuccess(`Seed song "${newSeed}" added!`);
        } else if (seedSongInputs.some(s => s.toLowerCase() === newSeed.toLowerCase())) {
            displayError("Seed song already added.");
        } else if (seedSongInputs.length >= 5) {
            displayError("Maximum of 5 seed songs allowed.");
        } else if (!newSeed) {
            displayError("Seed song input cannot be empty.");
        }
        console.log("PC: handleAddSeedSong - END. Current seeds:", seedSongInputs);
    };

    const handleRemoveSeedSong = (seedToRemove) => {
        console.log("PC: handleRemoveSeedSong - Removing:", seedToRemove);
        setSeedSongInputs(prev => prev.filter(seed => seed !== seedToRemove));
        console.log("PC: handleRemoveSeedSong - END. Current seeds:", seedSongInputs);
    };

    const handleAddFusionGenre = () => {
        console.log("PC: handleAddFusionGenre - START. currentFusionGenreInput:", currentFusionGenreInput);
        const newGenre = currentFusionGenreInput.trim();
        if (newGenre && !fusionGenres.some(g => g.toLowerCase() === newGenre.toLowerCase()) && fusionGenres.length < 3) {
            setFusionGenres(prev => [...prev, newGenre]);
            setCurrentFusionGenreInput('');
            displaySuccess(`Fusion genre "${newGenre}" added!`);
        } else if (fusionGenres.some(g => g.toLowerCase() === newGenre.toLowerCase())) {
            displayError("Fusion genre already added.");
        } else if (fusionGenres.length >= 3) {
            displayError("Maximum of 3 fusion genres allowed.");
        } else if (!newGenre) {
            displayError("Fusion genre input cannot be empty.");
        }
        console.log("PC: handleAddFusionGenre - END. Current fusion genres:", fusionGenres);
    };

    const handleRemoveFusionGenre = (genreToRemove) => {
        console.log("PC: handleRemoveFusionGenre - Removing:", genreToRemove);
        setFusionGenres(prev => prev.filter(genre => genre !== genreToRemove));
        console.log("PC: handleRemoveFusionGenre - END. Current fusion genres:", fusionGenres);
    };

    const handleGetFutureIdeas = async () => {
        console.log("PC: handleGetFutureIdeas - START");
        if (songs.length < 3) {
            displayError("Add at least 3 songs to your current mixtape to get future ideas.");
            return;
        }
        setIsLoadingFutureIdeas(true);
        setFuturePlaylistIdeas([]);
        try {
            const currentMixtapeSummary = `Current mixtape: Theme is "${theme || originalThemePrompt}". Songs include: ${songs.slice(0,5).map(s => `"${s.title}" by ${s.artist}`).join(', ')}. Tags: ${tags.join(', ')}.`;
            const prompt = `Based on this existing mixtape (${currentMixtapeSummary}), suggest 3 distinct and creative ideas for future playlists. For each idea, provide a catchy theme name and a brief explanation (1-2 sentences) of what makes it interesting or how it relates/contrasts with the current one.`;
            const schema = { type: "OBJECT", properties: { "future_ideas": { type: "ARRAY", items: { type: "OBJECT", properties: { "idea": { "type": "STRING" }, "explanation": { "type": "STRING" } }, required: ["idea", "explanation"] }}}};
            const parsed = await callGeminiAPI(prompt, schema);
            setFuturePlaylistIdeas(parsed.future_ideas || []);
            if (!parsed.future_ideas || parsed.future_ideas.length === 0) {
                displaySuccess("AI couldn't brainstorm future ideas right now. Try again later!");
            } else {
                displaySuccess("Future mixtape ideas generated!");
            }
        } catch (err) {
            console.error("PC: handleGetFutureIdeas - CRITICAL ERROR:", err);
            displayError(`Future ideas generation failed: ${err.message}`);
        } finally {
            setIsLoadingFutureIdeas(false);
            console.log("PC: handleGetFutureIdeas - END");
        }
    };

    const handleSavePlaylistToFirestore = async () => {
        console.log("PC: handleSavePlaylistToFirestore - START");
        if (!currentUser || !db) {
            displayError("User not signed in or database not available. Cannot save.");
            return;
        }
        if (!theme.trim()) {
            displayError("Playlist title (theme) is required.");
            return;
        }
        if (songs.length === 0) {
            displayError("Please add at least one song to the playlist.");
            return;
        }
        setIsSaving(true);
        setError(null); setSuccessMessage(null);

        const playlistData = {
            theme: theme.trim(),
            originalThemePrompt: originalThemePrompt.trim(),
            songs: songs.map(s => ({ // Ensure only necessary fields are saved
                id: s.id, 
                title: s.title, 
                artist: s.artist, 
                album: s.album || '', 
                duration_ms: s.duration_ms || 0,
                personalNote: s.personalNote || ''
            })),
            linerNotes: linerNotes.trim(),
            coverArtUrl: coverArtUrl.trim(),
            tags: tags,
            seedSongs: seedSongInputs,
            isPublic: isPublic,
            startYear: startYear,
            endYear: endYear,
            preferHiddenGems: preferHiddenGems,
            languagePreferences: languagePreferences.trim(),
            excludeKeywords: excludeKeywords.trim(),
            instrumentalVocalRatio: instrumentalVocalRatio,
            fusionGenres: fusionGenres,
            storyNarrative: storyNarrative.trim(),
            vibeArcDescription: vibeArcDescription.trim(),
            userId: currentUser.uid,
            updatedAt: serverTimestamp(),
        };

        try {
            if (existingPlaylist && existingPlaylist.id) {
                playlistData.updatedAt = serverTimestamp(); // Ensure updatedAt is always fresh
                const playlistDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/playlists`, existingPlaylist.id);
                await updateDoc(playlistDocRef, playlistData);
                displaySuccess("Mixtape updated successfully!");
                console.log("PC: Mixtape updated in Firestore, ID:", existingPlaylist.id);
            } else {
                playlistData.createdAt = serverTimestamp();
                const docRef = await addDoc(collection(db, `artifacts/${appId}/users/${currentUser.uid}/playlists`), playlistData);
                displaySuccess("Mixtape saved successfully!");
                console.log("PC: Mixtape saved to Firestore, new ID:", docRef.id);
            }
            if (onSaveSuccess) {
                onSaveSuccess(); // Navigate back to dashboard or clear form
            }
        } catch (err) {
            console.error("PC: handleSavePlaylistToFirestore - CRITICAL ERROR:", err);
            displayError(`Failed to save mixtape: ${err.message}`);
        } finally {
            setIsSaving(false);
            console.log("PC: handleSavePlaylistToFirestore - END");
        }
    };

    const songsListRef = useRef(null);
    useEffect(() => {
        // Auto-scroll to the bottom of the song list when a new song is added
        if (songsListRef.current && songs.length > 0) {
            // Check if the last song added is visible, if not, scroll.
            // This is a simplification; a more robust check might be needed for edge cases.
            const lastSongElement = songsListRef.current.lastElementChild;
            if (lastSongElement) {
                // A small delay can sometimes help ensure the element is fully rendered before scrolling
                setTimeout(() => lastSongElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
            }
        }
    }, [songs.length]); // Trigger only when the number of songs changes

    const totalPlaylistDurationMs = useMemo(() => songs.reduce((total, song) => total + (Number(song.duration_ms) || 0), 0), [songs]);

    if (isLoadingAuth) {
         return (<div className="flex flex-col items-center justify-center flex-grow"><Loader2 className="h-12 w-12 animate-spin text-purple-400" /><p className="mt-4 text-lg">Loading Creator...</p></div>);
    }
    if (!currentUser && !isLoadingAuth) { // Check !isLoadingAuth to ensure auth state is resolved
        return (<div className="text-center py-10 text-gray-400 flex-grow flex flex-col items-center justify-center"><LogIn size={48} className="mx-auto mb-4" /><h2 className="text-2xl mb-2">Please sign in</h2><p>You need to be signed in to create or edit a mixtape.</p></div>);
    }

    return (
        <div className="max-w-4xl mx-auto bg-slate-800/70 p-6 md:p-8 rounded-xl shadow-2xl space-y-8 backdrop-blur-sm">
            <div>
                <button type="button" onClick={() => { console.log("PC: Back to Dashboard clicked"); if(onSaveSuccess) onSaveSuccess(); }} className="flex items-center text-purple-400 hover:text-purple-300 mb-4 text-sm transition-colors">
                    <ChevronLeft size={18} className="mr-1" /> Back to Dashboard
                </button>
                <h2 className="text-3xl font-semibold text-purple-300 mb-1">{existingPlaylist ? 'Edit Mixtape' : 'Create New Mixtape'}</h2>
                <p className="text-sm text-gray-400">Craft the perfect vibe, one track at a time.</p>
            </div>

            {error && <Alert type="error">{error}</Alert>}
            {successMessage && <Alert type="success">{successMessage}</Alert>}

            <PlaylistFormHeader
                theme={theme}
                handleThemeInputChange={handleThemeInputChange}
                originalThemePrompt={originalThemePrompt}
                isLoadingTitle={isLoadingTitle}
                handleSuggestPlaylistTitle={handleSuggestPlaylistTitle}
                suggestedTitles={suggestedTitles}
                setTheme={setTheme}
                setSuggestedTitles={setSuggestedTitles}
                currentTagInput={currentTagInput}
                setCurrentTagInput={setCurrentTagInput}
                handleAddTag={handleAddTag}
                tags={tags}
                handleRemoveTag={handleRemoveTag}
                currentSeedSong={currentSeedSong}
                setCurrentSeedSong={setCurrentSeedSong}
                handleAddSeedSong={handleAddSeedSong}
                seedSongInputs={seedSongInputs}
                handleRemoveSeedSong={handleRemoveSeedSong}
                isPublic={isPublic}
                setIsPublic={setIsPublic}
                isLoadingSuggestions={isLoadingSuggestions}
                songs={songs}
                handleGetSongIdeas={handleGetSongIdeas}
                startYear={startYear} setStartYear={setStartYear}
                endYear={endYear} setEndYear={setEndYear}
                languagePreferences={languagePreferences} setLanguagePreferences={setLanguagePreferences}
                preferHiddenGems={preferHiddenGems} setPreferHiddenGems={setPreferHiddenGems}
                excludeKeywords={excludeKeywords} setExcludeKeywords={setExcludeKeywords}
                instrumentalVocalRatio={instrumentalVocalRatio} setInstrumentalVocalRatio={setInstrumentalVocalRatio}
                fusionGenres={fusionGenres} currentFusionGenreInput={currentFusionGenreInput} setCurrentFusionGenreInput={setCurrentFusionGenreInput} handleAddFusionGenre={handleAddFusionGenre} handleRemoveFusionGenre={handleRemoveFusionGenre}
                storyNarrative={storyNarrative} setStoryNarrative={setStoryNarrative}
                vibeArcDescription={vibeArcDescription} setVibeArcDescription={setVibeArcDescription}
            />

            {(aiSuggestions.length > 0 || songs.length > 0 || isLoadingSuggestions) && (
                <div className="grid md:grid-cols-2 gap-6">
                    <GeminiSuggestionsDisplay
                        aiSuggestions={aiSuggestions}
                        isLoadingSuggestions={isLoadingSuggestions}
                        songs={songs}
                        addSongToPlaylist={addSongToPlaylist}
                    />
                    <CurrentMixtapeDisplay
                        songs={songs}
                        songsListRef={songsListRef} // Pass the ref
                        totalPlaylistDurationMs={totalPlaylistDurationMs}
                        formatDuration={formatDuration}
                        removeSongFromPlaylist={removeSongFromPlaylist}
                        handleEditSongNote={handleEditSongNote}
                        editingNoteForSongId={editingNoteForSongId}
                        currentSongNote={currentSongNote}
                        setCurrentSongNote={setCurrentSongNote}
                        handleSaveSongNote={handleSaveSongNote}
                        handleCancelEditSongNote={handleCancelEditSongNote}
                        handleDragStart={handleDragStart}
                        handleDragEnter={handleDragEnter}
                        handleDragLeave={handleDragLeave}
                        handleDragEnd={handleDragEnd}
                        handleDragOver={handleDragOver}
                        handleDrop={handleDrop}
                    />
                </div>
            )}

            {songs.length >= 3 && (
                <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner space-y-3">
                    <h3 className="text-xl font-medium text-purple-300 mb-3">Future Mixtape Ideas?</h3>
                    <button
                        type="button"
                        onClick={() => { console.log("PC: Get Future Ideas button clicked"); handleGetFutureIdeas(); }}
                        disabled={isLoadingFutureIdeas}
                        className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-md transition-colors duration-200 ease-in-out disabled:opacity-50"
                    >
                        {isLoadingFutureIdeas ? <Loader2 className="animate-spin mr-2" size={20}/> : <Lightbulb className="mr-2" size={20} />}
                        Suggest Next Themes/Artists
                    </button>
                    {futurePlaylistIdeas.length > 0 && !isLoadingFutureIdeas && (
                        <div className="mt-4 space-y-3">
                            {futurePlaylistIdeas.map((idea, index) => (
                                <div key={index} className="p-3 bg-slate-800 rounded-md">
                                    <p className="font-semibold text-indigo-300">{idea.idea}</p>
                                    <p className="text-xs text-gray-400">{idea.explanation}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {(theme || songs.length > 0) && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner space-y-3">
                        <h3 className="text-xl font-medium text-purple-300">4. Design Your Cover</h3>
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-full sm:w-2/3 aspect-square bg-slate-800 rounded-md flex items-center justify-center overflow-hidden border-2 border-slate-600">
                                {coverArtUrl ? <img src={coverArtUrl} alt="Playlist Cover Art Preview" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display='none'; const placeholder = e.target.parentElement.querySelector('.placeholder-icon'); if(placeholder) placeholder.style.display='flex'; }}/> : null}
                                {!coverArtUrl && <ImageIcon size={48} className="text-gray-500 placeholder-icon" />}
                            </div>
                            <div className="w-full space-y-2">
                                <p className="text-sm text-gray-400 text-center">Paste an image URL for your mixtape cover.</p>
                                <input type="text" value={coverArtUrl} onChange={(e) => setCoverArtUrl(e.target.value)} placeholder="Paste image URL here..." className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"/>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner space-y-3">
                        <label htmlFor="linerNotes" className="block text-xl font-medium text-purple-300">5. Add Liner Notes</label>
                        <p className="text-sm text-gray-400 mb-2">Share the story or mood behind your mixtape.</p>
                        <textarea id="linerNotes" value={linerNotes} onChange={(e) => setLinerNotes(e.target.value)} rows="5" placeholder="e.g., 'A collection of tracks for late-night drives...'" className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500 custom-scrollbar"></textarea>
                        <button type="button" onClick={() => { handleGenerateLinerNotes();}} disabled={isLoadingLinerNotes || songs.length === 0 || (!originalThemePrompt.trim() && !theme.trim())} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50 text-sm">
                            {isLoadingLinerNotes ? <Loader2 className="animate-spin mr-2" size={18}/> : <Sparkles className="mr-2" size={18} />}
                            Write Liner Notes
                        </button>
                    </div>
                </div>
            )}

            <div className="pt-6 border-t border-slate-700 flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => { handleSavePlaylistToFirestore(); }} disabled={isSaving || !theme.trim() || songs.length === 0} className="w-full flex items-center justify-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-lg shadow-xl transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                    {isSaving ? <Loader2 className="animate-spin mr-2" size={24}/> : <Save className="mr-2" size={24} />}
                    {existingPlaylist ? 'Update Mixtape' : 'Save Mixtape'}
                </button>
            </div>
        </div>
    );
};

export default PlaylistCreator;
