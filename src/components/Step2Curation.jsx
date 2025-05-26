import React, { useState } from 'react';
import AdvancedAIPrefs from './AdvancedAIPrefs';
import GeminiSuggestionsDisplay from './GeminiSuggestionsDisplay';
import CurrentMixtapeDisplay from './CurrentMixtapeDisplay';
import { Music, Loader2, Settings2, ChevronDown, ChevronUp, ListMusic, Wand2 } from 'lucide-react';

// Using a slightly modified SectionCard for collapsibility control via props
const CollapsibleSectionCard = ({ title, icon: Icon, description, children, initiallyOpen = false, onToggle, isOpen, className="" }) => {
    const open = isOpen;
    const toggle = () => onToggle(!open);

    return (
        <div className={`p-5 bg-slate-700/40 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/50 ${className}`}>
            <button
                type="button"
                onClick={toggle}
                className="flex items-center justify-between w-full text-left py-1 text-lg font-semibold text-purple-300 hover:text-purple-200 transition-colors focus:outline-none mb-2"
                aria-expanded={open}
            >
                <span className="flex items-center">
                    {Icon && <Icon size={22} className="mr-3 text-purple-400 flex-shrink-0" />}
                    {title}
                </span>
                {open ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
            {open && (
                <div className={`mt-1 ${Icon ? 'pl-10' : 'pl-1'} pr-1 pb-2 border-t border-slate-600/50 pt-4 space-y-4`}>
                     {description && <p className="text-sm text-gray-400 mb-3 -mt-2">{description}</p>}
                    {children}
                </div>
            )}
             {!open && description && <p className="text-xs text-gray-500 mt-1 ml-10 truncate">{description}</p>}
        </div>
    );
};


const Step2Curation = ({
    startYear, setStartYear, endYear, setEndYear,
    languagePreferences, setLanguagePreferences,
    preferHiddenGems, setPreferHiddenGems,
    excludeKeywords, setExcludeKeywords,
    instrumentalVocalRatio, setInstrumentalVocalRatio,
    fusionGenres, currentFusionGenreInput, setCurrentFusionGenreInput, handleAddFusionGenre, handleRemoveFusionGenre,
    storyNarrative, setStoryNarrative,
    vibeArcDescription, setVibeArcDescription,
    isLoadingSuggestions, songs, originalThemePrompt, theme, seedSongInputs, 
    handleGetSongIdeas,
    aiSuggestions, addSongToPlaylist,
    currentSongs, songsListRef, totalPlaylistDurationMs, formatDuration,
    removeSongFromPlaylist, handleEditSongNote, editingNoteForSongId, currentSongNote, setCurrentSongNote,
    handleSaveSongNote, handleCancelEditSongNote,
    handleDragStart, handleDragEnter, handleDragLeave, handleDragEnd, handleDragOver, handleDrop,
    onPrevStep, onNextStep,
}) => {
    const [isAdvancedPrefsOpen, setIsAdvancedPrefsOpen] = useState(false); // Default to closed

    return (
        <div className="space-y-6 p-1"> {/* Reduced outer spacing, sections will have their own */}
            {/* Top section for Advanced AI Prefs and Get Ideas button */}
            <CollapsibleSectionCard
                title="Fine-Tune AI Suggestions"
                icon={Settings2}
                description="Refine Gemini's song choices with these advanced preferences (optional)."
                isOpen={isAdvancedPrefsOpen}
                onToggle={setIsAdvancedPrefsOpen}
                className="mb-6" // Add bottom margin to this card
            >
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
            </CollapsibleSectionCard>

            <div className="text-center mb-6"> {/* Centered Get Ideas Button */}
                <button 
                    type="button" 
                    onClick={handleGetSongIdeas} 
                    disabled={isLoadingSuggestions || (!originalThemePrompt.trim() && !theme.trim() && seedSongInputs.length === 0 && fusionGenres.length === 0 && !storyNarrative.trim() && !vibeArcDescription.trim())} 
                    className="inline-flex items-center justify-center px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-70 text-md"
                >
                    {isLoadingSuggestions ? <Loader2 className="animate-spin mr-2" size={20}/> : <Wand2 className="mr-2" size={20} />} 
                    {currentSongs.length > 0 ? "Get More Song Ideas" : "Get Song Ideas"}
                </button>
            </div>

            {/* Two-column layout for Suggestions and Current Mixtape */}
            { (aiSuggestions.length > 0 || currentSongs.length > 0 || isLoadingSuggestions) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GeminiSuggestionsDisplay
                        aiSuggestions={aiSuggestions}
                        isLoadingSuggestions={isLoadingSuggestions}
                        songs={currentSongs} 
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
            )}
             {/* Placeholder if nothing to show yet in the two columns */}
            { !(aiSuggestions.length > 0 || currentSongs.length > 0 || isLoadingSuggestions) && !isAdvancedPrefsOpen && (
                <div className="p-6 bg-slate-700/30 rounded-lg shadow-inner min-h-[150px] flex items-center justify-center text-center border border-dashed border-slate-600">
                    <p className="text-gray-400 italic">Click "Get Song Ideas" above to start curating your mixtape. <br/> You can also expand "Fine-Tune AI Suggestions" for more control.</p>
                </div>
            )}


            <div className="mt-10 flex justify-between">
                <button
                    type="button"
                    onClick={onPrevStep}
                    className="px-10 py-3.5 bg-slate-600 hover:bg-slate-500 text-white text-lg font-bold rounded-xl shadow-lg transition-colors transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-opacity-50"
                >
                    &larr; Foundation
                </button>
                <button
                    type="button"
                    onClick={onNextStep}
                    disabled={currentSongs.length === 0} 
                    className="px-10 py-3.5 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-xl shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50"
                >
                    Final Touches &rarr;
                </button>
            </div>
        </div>
    );
};

export default Step2Curation;
