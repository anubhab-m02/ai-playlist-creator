import React, { useState } from 'react';
import AdvancedAIPrefs from './AdvancedAIPrefs';
import GeminiSuggestionsDisplay from './GeminiSuggestionsDisplay';
import CurrentMixtapeDisplay from './CurrentMixtapeDisplay';
import { Music, Loader2, Settings2, ChevronDown, ChevronUp } from 'lucide-react';

const Step2Curation = ({
    // Advanced AI Prefs props
    startYear, setStartYear, endYear, setEndYear,
    languagePreferences, setLanguagePreferences,
    preferHiddenGems, setPreferHiddenGems,
    excludeKeywords, setExcludeKeywords,
    instrumentalVocalRatio, setInstrumentalVocalRatio,
    fusionGenres, currentFusionGenreInput, setCurrentFusionGenreInput, handleAddFusionGenre, handleRemoveFusionGenre,
    storyNarrative, setStoryNarrative,
    vibeArcDescription, setVibeArcDescription,
    // Song Ideas props
    isLoadingSuggestions, songs, originalThemePrompt, theme, seedSongInputs, // For disabling button
    handleGetSongIdeas,
    // Gemini Display props
    aiSuggestions, addSongToPlaylist,
    // Current Mixtape Display props
    currentSongs, songsListRef, totalPlaylistDurationMs, formatDuration,
    removeSongFromPlaylist, handleEditSongNote, editingNoteForSongId, currentSongNote, setCurrentSongNote,
    handleSaveSongNote, handleCancelEditSongNote,
    handleDragStart, handleDragEnter, handleDragLeave, handleDragEnd, handleDragOver, handleDrop,
    // Navigation
    onPrevStep, onNextStep,
}) => {
    const [isAdvancedPrefsOpen, setIsAdvancedPrefsOpen] = useState(false);

    return (
        <div className="space-y-6 p-1">
            {/* Collapsible Advanced AI Preferences Section */}
            <div className="p-6 bg-slate-700/30 rounded-lg shadow-lg">
                <button
                    type="button"
                    onClick={() => setIsAdvancedPrefsOpen(!isAdvancedPrefsOpen)}
                    className="flex items-center justify-between w-full text-left py-2 text-lg font-semibold text-purple-300 hover:text-purple-200 transition-colors focus:outline-none mb-2"
                >
                    <span className="flex items-center">
                        <Settings2 size={22} className="mr-2" />
                        Fine-Tune AI Suggestions (Optional)
                    </span>
                    {isAdvancedPrefsOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
                {isAdvancedPrefsOpen && (
                    <div className="mt-1 pl-1 pr-1 pb-2 border-t border-slate-600/50 pt-4">
                        <AdvancedAIPrefs
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
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-700/30 rounded-lg shadow-lg">
                 <h3 className="text-xl font-semibold text-purple-300 mb-2">2. Get Song Ideas & Build Your List</h3>
                 <p className="text-sm text-gray-400 mb-4">Let Gemini help you find the perfect tracks, or add your own.</p>
                <button 
                    type="button" 
                    onClick={handleGetSongIdeas} 
                    disabled={isLoadingSuggestions || (!originalThemePrompt.trim() && !theme.trim() && seedSongInputs.length === 0 && fusionGenres.length === 0 && !storyNarrative.trim() && !vibeArcDescription.trim())} 
                    className="w-full sm:w-auto mb-6 flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                >
                    {isLoadingSuggestions ? <Loader2 className="animate-spin mr-2" size={20}/> : <Music className="mr-2" size={20} />} 
                    {songs.length > 0 ? "Get More Ideas" : "Get Song Ideas"}
                </button>

                {/* Layout for Suggestions and Current Mixtape */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GeminiSuggestionsDisplay
                        aiSuggestions={aiSuggestions}
                        isLoadingSuggestions={isLoadingSuggestions}
                        songs={currentSongs} // Pass current songs for context
                        addSongToPlaylist={addSongToPlaylist}
                    />
                    <CurrentMixtapeDisplay
                        songs={currentSongs}
                        songsListRef={songsListRef} 
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
            </div>
            <div className="mt-8 flex justify-between">
                <button
                    type="button"
                    onClick={onPrevStep}
                    className="px-8 py-3 bg-slate-600 hover:bg-slate-500 text-white text-lg font-semibold rounded-lg shadow-md transition-colors"
                >
                    &larr; Back to Foundation
                </button>
                <button
                    type="button"
                    onClick={onNextStep}
                    disabled={currentSongs.length === 0} // Disable if no songs added
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next: Final Touches &rarr;
                </button>
            </div>
        </div>
    );
};

export default Step2Curation;
