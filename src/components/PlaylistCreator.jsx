import React, { useState, useEffect, useRef } from 'react';
import { useFirebase } from '../firebase'; // Corrected import path
import Alert from './Alert';
import { Loader2, Music, Image as ImageIcon, PlusCircle, Save, Trash2, ChevronLeft, Sparkles, Briefcase, LogIn } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const PlaylistCreator = ({ existingPlaylist, onSaveSuccess }) => {
    const { db, currentUser, appId, spotifyAccessToken, spotifyProfile } = useFirebase();
    const [theme, setTheme] = useState(''); 
    const [originalThemePrompt, setOriginalThemePrompt] = useState('');
    const [songs, setSongs] = useState([]);
    const [linerNotes, setLinerNotes] = useState('');
    const [coverArtUrl, setCoverArtUrl] = useState(''); // Users can still paste a URL
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    // Removed: const [isLoadingCover, setIsLoadingCover] = useState(false);
    const [isLoadingLinerNotes, setIsLoadingLinerNotes] = useState(false);
    const [isLoadingTitle, setIsLoadingTitle] = useState(false);
    const [suggestedTitles, setSuggestedTitles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingToSpotify, setIsSavingToSpotify] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // API Key for Gemini - ensure this is set in your .env file for local dev
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    // Removed: const imagenApiKey = import.meta.env.VITE_IMAGEN_API_KEY || "";

    useEffect(() => {
        if (!currentUser) {
            if (onSaveSuccess) onSaveSuccess(); 
            return;
        }
        if (existingPlaylist) {
            setTheme(existingPlaylist.theme || '');
            setOriginalThemePrompt(existingPlaylist.theme || '');
            setSongs(existingPlaylist.songs?.map(s => ({...s, id: crypto.randomUUID()})) || []);
            setLinerNotes(existingPlaylist.linerNotes || '');
            setCoverArtUrl(existingPlaylist.coverArtUrl || '');
        } else {
            setTheme(''); setOriginalThemePrompt(''); setSongs([]); setLinerNotes(''); setCoverArtUrl('');
        }
        setAiSuggestions([]); setSuggestedTitles([]); setError(null); setSuccessMessage(null);
    }, [existingPlaylist, currentUser, onSaveSuccess]);

    const displayError = (message) => { setError(message); setTimeout(() => setError(null), 4000); };
    const displaySuccess = (message) => { setSuccessMessage(message); setTimeout(() => setSuccessMessage(null), 3000); };

    const handleThemeInputChange = (e) => { setTheme(e.target.value); if (!originalThemePrompt || Math.abs(e.target.value.length - originalThemePrompt.length) > 5) { setOriginalThemePrompt(e.target.value); }};
    
    const callGeminiAPI = async (prompt, responseSchema) => {
        if (!geminiApiKey) {
            throw new Error("Gemini API key is not configured.");
        }
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: responseSchema ? { responseMimeType: "application/json", responseSchema } : {}
        };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!response.ok) { 
            const errData = await response.json(); 
            console.error("Gemini API error:", errData);
            throw new Error(errData?.error?.message || `API Error ${response.status}`); 
        }
        const result = await response.json();
        const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResponse) throw new Error("No valid response from AI.");
        return responseSchema ? JSON.parse(textResponse) : textResponse;
    };

    const handleGetSongIdeas = async () => {
        const currentThemeForPrompt = originalThemePrompt.trim() || theme.trim();
        if (!currentThemeForPrompt) { displayError("Please enter a theme or title."); return; }
        setIsLoadingSuggestions(true); setAiSuggestions([]);
        const prompt = `Generate a list of 10 song suggestions (title, artist, album) for a playlist with the theme: "${currentThemeForPrompt}".`;
        const schema = { type: "OBJECT", properties: { "suggestions": { type: "ARRAY", items: { type: "OBJECT", properties: { "title": { "type": "STRING" }, "artist": { "type": "STRING" }, "album": { "type": "STRING" } }, required: ["title", "artist"] }}}};
        try {
            const parsed = await callGeminiAPI(prompt, schema);
            setAiSuggestions(parsed.suggestions?.map(s => ({...s, id: crypto.randomUUID() })) || []);
            if (!parsed.suggestions || parsed.suggestions.length === 0) displaySuccess("AI couldn't find specific song ideas for this theme.");
        } catch (err) { console.error("Song ideas error:", err); displayError(`Song ideas failed: ${err.message}`); } 
        finally { setIsLoadingSuggestions(false); }
    };

    const handleSuggestPlaylistTitle = async () => {
        const currentThemeForPrompt = originalThemePrompt.trim();
        if (!currentThemeForPrompt) { displayError("Please enter an initial theme idea."); return; }
        setIsLoadingTitle(true); setSuggestedTitles([]);
        const prompt = `Based on the theme "${currentThemeForPrompt}", suggest 3 creative and catchy titles for a music playlist.`;
        const schema = { type: "OBJECT", properties: { "titles": { type: "ARRAY", items: { type: "STRING" } } } };
        try {
            const parsed = await callGeminiAPI(prompt, schema);
            setSuggestedTitles(parsed.titles || []);
            if (!parsed.titles || parsed.titles.length === 0) displaySuccess("AI couldn't come up with titles for this.");
        } catch (err) { console.error("Title suggestion error:", err); displayError(`Title suggestions failed: ${err.message}`); }
        finally { setIsLoadingTitle(false); }
    };
    
    const handleGenerateLinerNotes = async () => {
        const currentThemeForPrompt = originalThemePrompt.trim() || theme.trim();
        if (!currentThemeForPrompt) { displayError("Please define a theme first."); return; }
        if (songs.length === 0) { displayError("Add some songs for better liner notes."); return; }
        setIsLoadingLinerNotes(true);
        const songExamples = songs.slice(0, 3).map(s => `"${s.title}" by ${s.artist}`).join(', ');
        const prompt = `Write engaging and thematic liner notes (2-3 sentences) for a playlist titled "${theme}" (original theme: "${currentThemeForPrompt}"). It includes songs like ${songExamples}. Capture the playlist's essence.`;
        try {
            const notes = await callGeminiAPI(prompt, null);
            setLinerNotes(notes); 
        } catch (err) { console.error("Liner notes error:", err); displayError(`Liner notes generation failed: ${err.message}`); }
        finally { setIsLoadingLinerNotes(false); }
    };

    // Removed: handleGenerateCoverArt function

    const addSongToPlaylist = (song) => { 
        if (!songs.some(s => s.title === song.title && s.artist === song.artist)) {
            setSongs(prev => [...prev, { ...song, id: crypto.randomUUID() }]);
        } else { displaySuccess(`"${song.title}" is already in your mixtape.`); }
    };
    const removeSongFromPlaylist = (songId) => setSongs(prev => prev.filter(s => s.id !== songId));

    const handleSavePlaylistToFirestore = async () => {
        if (!currentUser || !db) { displayError("Cannot save: User not authenticated or DB not ready."); return { success: false }; }
        if (!theme.trim()) { displayError("Playlist title/theme cannot be empty."); return { success: false }; }
        if (songs.length === 0) { displayError("Add at least one song."); return { success: false }; }
        setIsSaving(true);
        const playlistData = { 
            theme, songs: songs.map(({ id, ...rest }) => rest), linerNotes, 
            coverArtUrl, userId: currentUser.uid, updatedAt: serverTimestamp() 
        };
        let newPlaylistId = existingPlaylist?.id;
        try {
            const path = `artifacts/${appId}/users/${currentUser.uid}/playlists`;
            if (existingPlaylist?.id) {
                await updateDoc(doc(db, path, existingPlaylist.id), playlistData);
                displaySuccess("Mixtape updated in Maestro!");
            } else {
                playlistData.createdAt = serverTimestamp();
                const newDocRef = await addDoc(collection(db, path), playlistData);
                newPlaylistId = newDocRef.id;
                displaySuccess("Mixtape saved to Maestro!");
            }
            return { success: true, playlistId: newPlaylistId };
        } catch (err) { console.error("Save to Maestro error:", err); displayError(`Save to Maestro failed: ${err.message}`); return { success: false }; }
        finally { setIsSaving(false); }
    };

    const handleSaveToSpotify = async () => {
        if (!spotifyAccessToken) { displayError("Please connect to Spotify first."); return; }
        if (!spotifyProfile?.id) { displayError("Spotify user ID not found. Try reconnecting Spotify."); return; }
        if (!theme.trim()) { displayError("Playlist title cannot be empty for Spotify."); return; }
        if (songs.length === 0) { displayError("Add songs to save to Spotify."); return; }
        setIsSavingToSpotify(true);

        const firestoreSaveResult = await handleSavePlaylistToFirestore();
        if (!firestoreSaveResult.success) {
             setIsSavingToSpotify(false);
             displayError("Failed to save to Maestro first. Spotify save aborted.");
             return;
        }
        const currentPlaylistId = firestoreSaveResult.playlistId || existingPlaylist?.id;

        const trackUris = songs.map(song => song.spotifyUri).filter(uri => uri); 
        if (trackUris.length === 0 && songs.length > 0) {
             displaySuccess("Simulating Spotify Save: No Spotify track URIs found. Creating an empty playlist on Spotify for now.");
        }
        try {
            const createPlaylistResponse = await fetch(`https://api.spotify.com/v1/users/${spotifyProfile.id}/playlists`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${spotifyAccessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: theme, description: linerNotes || `A Mixtape Maestro creation: ${theme}`, public: false })
            });
            if (!createPlaylistResponse.ok) { const errData = await createPlaylistResponse.json(); throw new Error(`Spotify (Create Playlist): ${errData.error?.message || createPlaylistResponse.statusText}`); }
            const newSpotifyPlaylist = await createPlaylistResponse.json();
            displaySuccess(`Playlist "${newSpotifyPlaylist.name}" created on Spotify!`);

            if (trackUris.length > 0 && newSpotifyPlaylist.id) {
                for (let i = 0; i < trackUris.length; i += 100) {
                    const chunk = trackUris.slice(i, i + 100);
                    const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${newSpotifyPlaylist.id}/tracks`, {
                        method: 'POST', headers: { 'Authorization': `Bearer ${spotifyAccessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ uris: chunk })
                    });
                    if (!addTracksResponse.ok) { const errData = await addTracksResponse.json(); displayError(`Spotify (Add Tracks): ${errData.error?.message || addTracksResponse.statusText}`); }
                }
                displaySuccess(`Tracks added to "${newSpotifyPlaylist.name}" on Spotify!`);
            }
            
            if (currentUser && db && currentPlaylistId) {
                 const playlistDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/playlists`, currentPlaylistId);
                 await updateDoc(playlistDocRef, { spotifyPlaylistId: newSpotifyPlaylist.id, spotifyPlaylistUrl: newSpotifyPlaylist.external_urls?.spotify });
            }
        } catch (err) { console.error("Error saving to Spotify:", err); displayError(`Failed to save to Spotify: ${err.message}`); } 
        finally { setIsSavingToSpotify(false); }
    };
    
    const songsListRef = useRef(null);
    useEffect(() => { if (songsListRef.current) songsListRef.current.scrollTop = songsListRef.current.scrollHeight; }, [songs.length]);

    if (!currentUser) {
        return (
            <div className="text-center py-10 text-gray-400 flex-grow flex flex-col items-center justify-center">
                <LogIn size={48} className="mx-auto mb-4" />
                <h2 className="text-2xl mb-2">Please sign in</h2>
                <p>You need to be signed in to create a mixtape.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-slate-800/70 p-6 md:p-8 rounded-xl shadow-2xl space-y-8 backdrop-blur-sm">
            <div>
                <button onClick={onSaveSuccess} className="flex items-center text-purple-400 hover:text-purple-300 mb-4 text-sm transition-colors">
                    <ChevronLeft size={18} className="mr-1" /> Back to Dashboard
                </button>
                <h2 className="text-3xl font-semibold text-purple-300 mb-1">{existingPlaylist ? 'Edit Mixtape' : 'Create New Mixtape'}</h2>
                <p className="text-sm text-gray-400">Craft the perfect vibe, one track at a time.</p>
            </div>

            {error && <Alert type="error">{error}</Alert>}
            {successMessage && <Alert type="success">{successMessage}</Alert>}

            <div className="space-y-4 p-6 bg-slate-700/50 rounded-lg shadow-inner">
                <label htmlFor="theme" className="block text-xl font-medium text-purple-300">1. Name Your Mixtape</label>
                 <div className="flex flex-col sm:flex-row gap-3">
                    <input type="text" id="theme" value={theme} onChange={handleThemeInputChange} placeholder="Enter playlist title/theme..." className="flex-grow p-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500" required />
                    <button type="button" onClick={handleSuggestPlaylistTitle} disabled={isLoadingTitle || !originalThemePrompt.trim()} className="flex items-center justify-center px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-md shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50 text-sm sm:text-base">
                        {isLoadingTitle ? <Loader2 className="animate-spin mr-2" size={20}/> : <Sparkles className="mr-2" size={18} />} Suggest Title
                    </button>
                </div>
                {suggestedTitles.length > 0 && !isLoadingTitle && (
                    <div className="mt-3 space-y-2 p-3 bg-slate-800/50 rounded-md">
                        <p className="text-xs text-gray-300">Click a title to use it:</p>
                        <ul className="flex flex-wrap gap-2">{suggestedTitles.map((title, i) => (<li key={i}><button onClick={() => { setTheme(title); setSuggestedTitles([]); }} className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors">{title}</button></li>))}</ul>
                    </div>
                )}
                 <button type="button" onClick={handleGetSongIdeas} disabled={isLoadingSuggestions || (!originalThemePrompt.trim() && !theme.trim())} className="w-full sm:w-auto mt-3 flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                    {isLoadingSuggestions ? <Loader2 className="animate-spin mr-2" size={20}/> : <Music className="mr-2" size={20} />} Get Song Ideas
                </button>
            </div>

             {(aiSuggestions.length > 0 || songs.length > 0 || isLoadingSuggestions) && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner">
                        <h3 className="text-xl font-medium text-purple-300 mb-3">2. Gemini's Booth <span className="text-sm text-gray-400">(Song Ideas)</span></h3>
                        {isLoadingSuggestions && <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /> <p className="ml-2">Brewing suggestions...</p></div>}
                        {!isLoadingSuggestions && aiSuggestions.length === 0 && songs.length > 0 && <p className="text-sm text-gray-400 italic">No new AI suggestions. Add more songs or change theme.</p>}
                        {!isLoadingSuggestions && aiSuggestions.length === 0 && songs.length === 0 && <p className="text-sm text-gray-400 italic">Enter a theme and click "Get Song Ideas".</p>}
                        {aiSuggestions.length > 0 && (<ul className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">{aiSuggestions.map((song) => (<li key={song.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-md hover:bg-slate-700/70 transition-colors"><div><p className="font-medium text-gray-200">{song.title}</p><p className="text-xs text-gray-400">{song.artist} {song.album ? `• ${song.album}` : ''}</p></div><button onClick={() => addSongToPlaylist(song)} className="p-2 rounded-full hover:bg-purple-600 text-purple-400 hover:text-white transition-colors" title="Add to Mixtape"><PlusCircle size={20} /></button></li>))}</ul>)}
                    </div>
                    <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner">
                        <h3 className="text-xl font-medium text-purple-300 mb-3">3. Your Mixtape <span className="text-sm text-gray-400">({songs.length} tracks)</span></h3>
                        {songs.length === 0 && <p className="text-sm text-gray-400 italic">Add songs from Gemini's Booth.</p>}
                        {songs.length > 0 && (<ul ref={songsListRef} className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">{songs.map((song, index) => (<li key={song.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-md"><div><p className="font-medium text-gray-200">{index + 1}. {song.title}</p><p className="text-xs text-gray-400 ml-4">{song.artist} {song.album ? `• ${song.album}` : ''}</p></div><button onClick={() => removeSongFromPlaylist(song.id)} className="p-2 rounded-full hover:bg-red-600 text-red-400 hover:text-white transition-colors" title="Remove from Mixtape"><Trash2 size={18} /></button></li>))}</ul>)}
                    </div>
                </div>
            )}

             {(theme || songs.length > 0) && (
            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner space-y-3">
                    <h3 className="text-xl font-medium text-purple-300">4. Design Your Cover</h3>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-full sm:w-2/3 aspect-square bg-slate-800 rounded-md flex items-center justify-center overflow-hidden border-2 border-slate-600">
                            {coverArtUrl ? 
                                <img src={coverArtUrl} alt="Playlist Cover Art Preview" className="w-full h-full object-cover" onError={(e) => {e.target.style.display='none'; /* Optionally show placeholder icon again */}}/> : 
                                <ImageIcon size={48} className="text-gray-500" />}
                        </div>
                        <div className="w-full space-y-2">
                             <p className="text-sm text-gray-400 text-center">Paste an image URL for your mixtape cover.</p>
                            <input 
                                type="text" 
                                value={coverArtUrl}
                                onChange={(e) => setCoverArtUrl(e.target.value)}
                                placeholder="Paste image URL here..."
                                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner space-y-3">
                    <label htmlFor="linerNotes" className="block text-xl font-medium text-purple-300">5. Add Liner Notes</label>
                    <p className="text-sm text-gray-400 mb-2">Share the story or mood behind your mixtape.</p>
                    <textarea id="linerNotes" value={linerNotes} onChange={(e) => setLinerNotes(e.target.value)} rows="5" placeholder="e.g., 'A collection of tracks for late-night drives...'" className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500 custom-scrollbar"></textarea>
                    <button type="button" onClick={handleGenerateLinerNotes} disabled={isLoadingLinerNotes || songs.length === 0 || (!originalThemePrompt.trim() && !theme.trim())} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50 text-sm">
                        {isLoadingLinerNotes ? <Loader2 className="animate-spin mr-2" size={18}/> : <Sparkles className="mr-2" size={18} />} Write Liner Notes
                    </button>
                </div>
            </div>
            )}

            <div className="pt-6 border-t border-slate-700 flex flex-col sm:flex-row gap-4">
                <button onClick={handleSavePlaylistToFirestore} disabled={isSaving || !theme.trim() || songs.length === 0} className="flex-1 flex items-center justify-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-lg shadow-xl transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                    {isSaving ? <Loader2 className="animate-spin mr-2" size={24}/> : <Save className="mr-2" size={24} />}
                    {existingPlaylist ? 'Update in Maestro' : 'Save to Maestro'}
                </button>
                {spotifyAccessToken && (
                    <button onClick={handleSaveToSpotify} disabled={isSavingToSpotify || !theme.trim() || songs.length === 0} className="flex-1 flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg shadow-xl transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                        {isSavingToSpotify ? <Loader2 className="animate-spin mr-2" size={24}/> : <Briefcase className="mr-2" size={24} />}
                        Save to Spotify
                    </button>
                )}
            </div>
             <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #4a5568; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #718096; }
            `}</style>
        </div>
    );
};

export default PlaylistCreator;
