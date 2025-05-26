import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFirebase } from '../firebase';
import Alert from './Alert';
import Step1Foundation from './Step1Foundation';
import Step2Curation from './Step2Curation';
import Step3FinalTouches from './Step3FinalTouches';
import Modal from './Modal'; 
import ManageTagsModal from './ManageTagsModal'; 
import { Loader2, LogIn, ChevronLeft, AlertTriangle, CheckCircle } from 'lucide-react'; 
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

const PlaylistCreator = ({ existingPlaylist, onSaveSuccess, isRemix = false }) => {
    const { db, currentUser, appId, isLoadingAuth } = useFirebase();

    const [currentStep, setCurrentStep] = useState(1);
    const stepNames = ["Foundation", "Curate Songs", "Final Touches"];
    const totalSteps = stepNames.length;


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

    const [showDuplicateSongModal, setShowDuplicateSongModal] = useState(false);
    const [songToAddDespiteDuplicate, setSongToAddDespiteDuplicate] = useState(null);
    
    const [isManageTagsModalOpen, setIsManageTagsModalOpen] = useState(false);
    const [editingPlaylistId, setEditingPlaylistId] = useState(null);

    const dragSongItem = useRef(null);
    const dragOverSongItem = useRef(null);
    const songsListRef = useRef(null);
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

    useEffect(() => {
        if (isLoadingAuth) return;
        if (!currentUser) {
            if (onSaveSuccess) onSaveSuccess(); 
            return;
        }
        setCurrentStep(1); 

        if (existingPlaylist) {
            setTheme(isRemix ? `Remix of ${existingPlaylist.theme || 'Untitled'}` : existingPlaylist.theme || '');
            setOriginalThemePrompt(existingPlaylist.originalThemePrompt || existingPlaylist.theme || '');
            setSongs(existingPlaylist.songs?.map(s => ({ ...s, id: crypto.randomUUID(), duration_ms: s.duration_ms || (180000 + Math.floor(Math.random() * 60000)), personalNote: s.personalNote || '' })) || []);
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
            
            if (isRemix) {
                setEditingPlaylistId(null); 
                displaySuccess("Remixing mixtape! All changes will create a new copy.");
            } else {
                setEditingPlaylistId(existingPlaylist.id); 
            }

        } else { 
            setTheme(''); setOriginalThemePrompt(''); setSongs([]); setLinerNotes(''); setCoverArtUrl(''); setTags([]); setSeedSongInputs([]);
            setIsPublic(false);
            setStartYear(''); setEndYear(''); setPreferHiddenGems(false); setLanguagePreferences('');
            setExcludeKeywords(''); setInstrumentalVocalRatio('balanced'); setFusionGenres([]);
            setStoryNarrative(''); setVibeArcDescription('');
            setEditingPlaylistId(null);
        }
        setAiSuggestions([]); setSuggestedTitles([]); setError(null); setSuccessMessage(null); setFuturePlaylistIdeas([]);
    }, [existingPlaylist, currentUser, isLoadingAuth, onSaveSuccess, isRemix]);

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
            throw error; 
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

    const addSongToPlaylist = (songCandidate) => {
        console.log("PC: addSongToPlaylist - Candidate:", songCandidate);
        if (!songCandidate || typeof songCandidate.title !== 'string' || typeof songCandidate.artist !== 'string') {
            console.warn("Attempted to add invalid song object:", songCandidate);
            displayError("Cannot add invalid song data.");
            return;
        }

        const isDuplicate = songs.some(
            s => s.title.toLowerCase() === songCandidate.title.toLowerCase() && 
                 s.artist.toLowerCase() === songCandidate.artist.toLowerCase()
        );

        if (isDuplicate) {
            console.log("PC: Duplicate song detected - ", songCandidate.title);
            setSongToAddDespiteDuplicate(songCandidate);
            setShowDuplicateSongModal(true);
        } else {
            const songToAdd = { 
                ...songCandidate, 
                id: songCandidate.id || crypto.randomUUID(), 
                duration_ms: songCandidate.duration_ms || (180000 + Math.floor(Math.random() * 60000)), 
                personalNote: '' 
            };
            setSongs(prev => [...prev, songToAdd]);
            displaySuccess(`"${songToAdd.title}" added to mixtape!`);
        }
        console.log("PC: addSongToPlaylist - END");
    };

    const handleAddAnyway = () => {
        if (songToAddDespiteDuplicate) {
            console.log("PC: handleAddAnyway - Adding:", songToAddDespiteDuplicate.title);
            const songToAdd = { 
                ...songToAddDespiteDuplicate, 
                id: crypto.randomUUID(), 
                duration_ms: songToAddDespiteDuplicate.duration_ms || (180000 + Math.floor(Math.random() * 60000)), 
                personalNote: '' 
            };
            setSongs(prev => [...prev, songToAdd]);
            displaySuccess(`"${songToAdd.title}" added again to mixtape!`);
        }
        setShowDuplicateSongModal(false);
        setSongToAddDespiteDuplicate(null);
        console.log("PC: handleAddAnyway - END");
    };

    const handleCancelAddDuplicate = () => {
        console.log("PC: handleCancelAddDuplicate");
        setShowDuplicateSongModal(false);
        setSongToAddDespiteDuplicate(null);
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
        console.log("PC: handleRemoveTag (from PlaylistFormHeader) - Removing:", tagToRemove);
        setTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
        console.log("PC: handleRemoveTag - END. Current tags:", tags);
    };

    const handleSaveManagedTags = (newTagsList) => {
        setTags(newTagsList); 
        displaySuccess("Tags updated successfully!");
        console.log("PC: Tags updated from modal:", newTagsList);
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
    };

    const handleDragEnter = (e, position) => {
        console.log("PC: handleDragEnter - position:", position);
        dragOverSongItem.current = position;
    };
    
    const handleDragLeave = (e) => {
    };

    const handleDrop = (e, dropPosition) => {
        console.log("PC: handleDrop - dropPosition:", dropPosition);
        const newSongs = [...songs];
        const draggedItemContent = newSongs[dragSongItem.current];
        newSongs.splice(dragSongItem.current, 1);
        newSongs.splice(dropPosition, 0, draggedItemContent); 
        dragSongItem.current = null;
        dragOverSongItem.current = null; 
        setSongs(newSongs);
    };

    const handleDragEnd = (e) => {
        console.log("PC: handleDragEnd");
        dragSongItem.current = null;
        dragOverSongItem.current = null;
    };
    
    const handleDragOver = (e) => { e.preventDefault(); }; 

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
        console.log("PC: handleSavePlaylistToFirestore - START. Editing ID:", editingPlaylistId, "Is Remix:", isRemix);
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
            songs: songs.map(s => ({ 
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
            isArchived: false, 
        };

        try {
            if (editingPlaylistId && !isRemix) { 
                playlistData.updatedAt = serverTimestamp(); 
                if (existingPlaylist && existingPlaylist.createdAt) {
                    playlistData.createdAt = existingPlaylist.createdAt;
                }
                 if (existingPlaylist && typeof existingPlaylist.isArchived === 'boolean') { 
                    playlistData.isArchived = existingPlaylist.isArchived;
                }
                const playlistDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/playlists`, editingPlaylistId);
                await updateDoc(playlistDocRef, playlistData);
                displaySuccess("Mixtape updated successfully!");
                console.log("PC: Mixtape updated in Firestore, ID:", editingPlaylistId);
            } else { 
                playlistData.createdAt = serverTimestamp();
                const docRef = await addDoc(collection(db, `artifacts/${appId}/users/${currentUser.uid}/playlists`), playlistData);
                displaySuccess("Mixtape saved successfully!");
                console.log("PC: Mixtape saved to Firestore, new ID:", docRef.id);
            }
            if (onSaveSuccess) {
                onSaveSuccess(); 
            }
        } catch (err) {
            console.error("PC: handleSavePlaylistToFirestore - CRITICAL ERROR:", err);
            displayError(`Failed to save mixtape: ${err.message}`);
        } finally {
            setIsSaving(false);
            console.log("PC: handleSavePlaylistToFirestore - END");
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const totalPlaylistDurationMs = useMemo(() => songs.reduce((total, song) => total + (Number(song.duration_ms) || 0), 0), [songs]);

    if (isLoadingAuth) {
         return (<div className="flex flex-col items-center justify-center flex-grow"><Loader2 className="h-12 w-12 animate-spin text-purple-400" /><p className="mt-4 text-lg">Loading Creator...</p></div>);
    }
    if (!currentUser && !isLoadingAuth) { 
        return (<div className="text-center py-10 text-gray-400 flex-grow flex flex-col items-center justify-center"><LogIn size={48} className="mx-auto mb-4" /><h2 className="text-2xl mb-2">Please sign in</h2><p>You need to be signed in to create or edit a mixtape.</p></div>);
    }

    return (
        <div className="max-w-5xl mx-auto bg-slate-800/60 p-4 md:p-6 lg:px-8 lg:py-8 rounded-xl shadow-2xl backdrop-blur-md space-y-6 border border-slate-700/50">
            {showDuplicateSongModal && songToAddDespiteDuplicate && (
                <Modal title="Duplicate Song Alert" onClose={handleCancelAddDuplicate}>
                    <div className="text-center">
                        <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-400" />
                        <p className="text-lg text-gray-200 mb-2">
                            The song <strong className="text-purple-300">"{songToAddDespiteDuplicate.title}"</strong> by <strong className="text-purple-300">{songToAddDespiteDuplicate.artist}</strong> is already in your mixtape.
                        </p>
                        <p className="text-gray-400 mb-6">Do you want to add it again?</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleCancelAddDuplicate}
                                className="px-6 py-2 rounded-md text-sm font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddAnyway}
                                className="px-6 py-2 rounded-md text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                            >
                                Add Anyway
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            <ManageTagsModal
                isOpen={isManageTagsModalOpen}
                onClose={() => setIsManageTagsModalOpen(false)}
                currentTags={tags}
                onSaveTags={handleSaveManagedTags} 
            />

            <div className="mb-6">
                <button type="button" onClick={() => { console.log("PC: Back to Dashboard clicked"); if(onSaveSuccess) onSaveSuccess(); }} className="flex items-center text-purple-400 hover:text-purple-300 mb-3 text-sm transition-colors">
                    <ChevronLeft size={18} className="mr-1" /> Back to Dashboard
                </button>
                <h2 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-2">
                    {editingPlaylistId && !isRemix ? 'Edit Mixtape' : (isRemix ? 'Remixing Mixtape' : 'Create New Mixtape')}
                </h2>
            </div>

            {/* Enhanced Stepper Navigation */}
            <nav aria-label="Progress" className="mb-8">
                <ol role="list" className="flex items-center justify-between space-x-2 md:space-x-4">
                    {stepNames.map((stepName, stepIdx) => {
                        const stepNumber = stepIdx + 1;
                        const isCompleted = currentStep > stepNumber;
                        const isActive = currentStep === stepNumber;

                        return (
                            <li key={stepName} className={`flex-1 ${stepIdx < totalSteps -1 ? 'pr-2 md:pr-4 relative' : ''}`}>
                                {isCompleted ? (
                                    <div className="group flex flex-col items-center w-full">
                                        <span className="flex items-center text-sm font-medium">
                                            <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-purple-600 rounded-full">
                                                <CheckCircle className="w-6 h-6 text-white" aria-hidden="true" />
                                            </span>
                                        </span>
                                        <span className="text-xs text-center mt-2 font-medium text-purple-300">{stepName}</span>
                                        {stepIdx < totalSteps - 1 && (
                                          <div className="hidden sm:block absolute top-5 left-full w-full h-0.5 bg-purple-600 -translate-x-1/2" aria-hidden="true" />
                                        )}
                                    </div>
                                ) : isActive ? (
                                    <div className="flex flex-col items-center w-full" aria-current="step">
                                        <span className="flex items-center text-sm font-medium">
                                            <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 border-2 border-purple-500 bg-purple-500/30 rounded-full">
                                                <span className="text-purple-200">{`0${stepNumber}`}</span>
                                            </span>
                                        </span>
                                        <span className="text-xs text-center mt-2 font-semibold text-purple-200">{stepName}</span>
                                        {stepIdx < totalSteps - 1 && (
                                            <div className="hidden sm:block absolute top-5 left-full w-full h-0.5 bg-slate-700 -translate-x-1/2" aria-hidden="true" />
                                        )}
                                    </div>
                                ) : (
                                    <div className="group flex flex-col items-center w-full">
                                        <span className="flex items-center text-sm font-medium">
                                            <span className="flex-shrink-0 flex items-center justify-center w-10 h-10 border-2 border-slate-600 rounded-full group-hover:border-slate-500">
                                                <span className="text-slate-500 group-hover:text-slate-400">{`0${stepNumber}`}</span>
                                            </span>
                                        </span>
                                        <span className="text-xs text-center mt-2 font-medium text-slate-500 group-hover:text-slate-400">{stepName}</span>
                                        {stepIdx < totalSteps - 1 && (
                                            <div className="hidden sm:block absolute top-5 left-full w-full h-0.5 bg-slate-700 -translate-x-1/2" aria-hidden="true" />
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>


            {error && <Alert type="error">{error}</Alert>}
            {successMessage && <Alert type="success">{successMessage}</Alert>}

            {/* Step Content Area - this div can control the overall height of the step content area */}
            <div className="mt-6 min-h-[calc(100vh-450px)]"> {/* Example: min-height to encourage less page scroll */}
                {currentStep === 1 && (
                    <Step1Foundation key="step1"
                        theme={theme} handleThemeInputChange={handleThemeInputChange} 
                        originalThemePrompt={originalThemePrompt} isLoadingTitle={isLoadingTitle} 
                        handleSuggestPlaylistTitle={handleSuggestPlaylistTitle} 
                        suggestedTitles={suggestedTitles} setTheme={setTheme} setSuggestedTitles={setSuggestedTitles}
                        currentTagInput={currentTagInput} setCurrentTagInput={setCurrentTagInput} 
                        handleAddTag={handleAddTag} tags={tags} handleRemoveTag={handleRemoveTag} 
                        onOpenManageTags={() => setIsManageTagsModalOpen(true)}
                        currentSeedSong={currentSeedSong} setCurrentSeedSong={setCurrentSeedSong} 
                        handleAddSeedSong={handleAddSeedSong} seedSongInputs={seedSongInputs} 
                        handleRemoveSeedSong={handleRemoveSeedSong}
                        onNextStep={nextStep}
                    />
                )}
                {currentStep === 2 && (
                    <Step2Curation key="step2"
                        startYear={startYear} setStartYear={setStartYear} endYear={endYear} setEndYear={setEndYear}
                        languagePreferences={languagePreferences} setLanguagePreferences={setLanguagePreferences}
                        preferHiddenGems={preferHiddenGems} setPreferHiddenGems={setPreferHiddenGems}
                        excludeKeywords={excludeKeywords} setExcludeKeywords={setExcludeKeywords}
                        instrumentalVocalRatio={instrumentalVocalRatio} setInstrumentalVocalRatio={setInstrumentalVocalRatio}
                        fusionGenres={fusionGenres} currentFusionGenreInput={currentFusionGenreInput} 
                        setCurrentFusionGenreInput={setCurrentFusionGenreInput} handleAddFusionGenre={handleAddFusionGenre} 
                        handleRemoveFusionGenre={handleRemoveFusionGenre}
                        storyNarrative={storyNarrative} setStoryNarrative={setStoryNarrative}
                        vibeArcDescription={vibeArcDescription} setVibeArcDescription={setVibeArcDescription}
                        isLoadingSuggestions={isLoadingSuggestions} songs={songs} 
                        originalThemePrompt={originalThemePrompt} theme={theme} seedSongInputs={seedSongInputs}
                        handleGetSongIdeas={handleGetSongIdeas}
                        aiSuggestions={aiSuggestions} addSongToPlaylist={addSongToPlaylist}
                        currentSongs={songs} songsListRef={songsListRef} 
                        totalPlaylistDurationMs={totalPlaylistDurationMs} formatDuration={formatDuration}
                        removeSongFromPlaylist={removeSongFromPlaylist} handleEditSongNote={handleEditSongNote} 
                        editingNoteForSongId={editingNoteForSongId} currentSongNote={currentSongNote} 
                        setCurrentSongNote={setCurrentSongNote} handleSaveSongNote={handleSaveSongNote} 
                        handleCancelEditSongNote={handleCancelEditSongNote}
                        handleDragStart={handleDragStart} handleDragEnter={handleDragEnter} 
                        handleDragLeave={handleDragLeave} handleDragEnd={handleDragEnd} 
                        handleDragOver={handleDragOver} handleDrop={handleDrop}
                        onPrevStep={prevStep} onNextStep={nextStep}
                    />
                )}
                {currentStep === 3 && (
                    <Step3FinalTouches key="step3"
                        coverArtUrl={coverArtUrl} setCoverArtUrl={setCoverArtUrl}
                        linerNotes={linerNotes} setLinerNotes={setLinerNotes} 
                        isLoadingLinerNotes={isLoadingLinerNotes} handleGenerateLinerNotes={handleGenerateLinerNotes}
                        isPublic={isPublic} setIsPublic={setIsPublic}
                        songs={songs} originalThemePrompt={originalThemePrompt} theme={theme}
                        isLoadingFutureIdeas={isLoadingFutureIdeas} futurePlaylistIdeas={futurePlaylistIdeas} 
                        handleGetFutureIdeas={handleGetFutureIdeas}
                        isSaving={isSaving} handleSavePlaylistToFirestore={handleSavePlaylistToFirestore} 
                        existingPlaylist={existingPlaylist} isRemix={isRemix}
                        onPrevStep={prevStep}
                    />
                )}
            </div>
        </div>
    );
};

export default PlaylistCreator;
