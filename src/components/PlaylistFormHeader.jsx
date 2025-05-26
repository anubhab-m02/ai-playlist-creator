import React, { useState } from 'react'; // Added useState for local collapse state
import AdvancedAIPrefs from './AdvancedAIPrefs'; 
import { Loader2, Music, Sparkles, Tag as TagIconLucide, X, Disc3, Plus, Eye, EyeOff, Tags, ChevronDown, ChevronUp, Settings2 } from 'lucide-react'; // Added ChevronDown, ChevronUp, Settings2

const PlaylistFormHeader = ({
    theme,
    handleThemeInputChange,
    originalThemePrompt,
    isLoadingTitle,
    handleSuggestPlaylistTitle,
    suggestedTitles,
    setTheme,
    setSuggestedTitles,
    currentTagInput,
    setCurrentTagInput,
    handleAddTag,
    tags,
    handleRemoveTag,
    onOpenManageTags, 
    currentSeedSong,
    setCurrentSeedSong,
    handleAddSeedSong,
    seedSongInputs,
    handleRemoveSeedSong,
    isPublic,
    setIsPublic,
    isLoadingSuggestions,
    songs, 
    handleGetSongIdeas,
    startYear, setStartYear, endYear, setEndYear,
    languagePreferences, setLanguagePreferences,
    preferHiddenGems, setPreferHiddenGems,
    excludeKeywords, setExcludeKeywords,
    instrumentalVocalRatio, setInstrumentalVocalRatio,
    fusionGenres, currentFusionGenreInput, setCurrentFusionGenreInput, handleAddFusionGenre, handleRemoveFusionGenre,
    storyNarrative, setStoryNarrative,
    vibeArcDescription, setVibeArcDescription
}) => {
    const [isAdvancedPrefsOpen, setIsAdvancedPrefsOpen] = useState(false); // State for collapsible section

    return (
        <div className="space-y-6 p-6 bg-slate-700/50 rounded-lg shadow-inner">
            {/* 1. Name Your Mixtape */}
            <div>
                <label htmlFor="theme" className="block text-xl font-medium text-purple-300 mb-2">1. Name Your Mixtape</label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                        type="text" 
                        id="theme" 
                        value={theme} 
                        onChange={handleThemeInputChange} 
                        placeholder="Enter playlist title/theme..." 
                        className="flex-grow p-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500" 
                        required 
                    />
                    <button 
                        type="button" 
                        onClick={handleSuggestPlaylistTitle} 
                        disabled={isLoadingTitle || !originalThemePrompt.trim()} 
                        className="flex items-center justify-center px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-md shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50 text-sm sm:text-base"
                    >
                        {isLoadingTitle ? <Loader2 className="animate-spin mr-2" size={20}/> : <Sparkles className="mr-2" size={18} />} Suggest Title
                    </button>
                </div>
                {suggestedTitles.length > 0 && !isLoadingTitle && (
                    <div className="mt-3 space-y-2 p-3 bg-slate-800/50 rounded-md">
                        <p className="text-xs text-gray-300">Click a title to use it:</p>
                        <ul className="flex flex-wrap gap-2">
                            {suggestedTitles.map((title, i) => (
                                <li key={i}>
                                    <button 
                                        type="button"
                                        onClick={() => { setTheme(title); setSuggestedTitles([]); }} 
                                        className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors"
                                    >
                                        {title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            
            {/* Mood / Activity Tags */}
            <div>
                <label htmlFor="tags" className="block text-lg font-medium text-purple-300 mb-2">Mood / Activity Tags</label>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <input 
                        type="text" 
                        id="tags" 
                        value={currentTagInput} 
                        onChange={(e) => setCurrentTagInput(e.target.value)} 
                        onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag();}}}
                        placeholder="e.g., Chill, Workout, Road Trip" 
                        className="flex-grow p-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500"
                    />
                    <button 
                        type="button" 
                        onClick={handleAddTag} 
                        className="flex items-center justify-center px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md shadow-md transition-colors text-sm sm:text-base"
                    >
                        <TagIconLucide size={18} className="mr-2"/> Add Tag
                    </button>
                    <button
                        type="button"
                        onClick={onOpenManageTags}
                        className="flex items-center justify-center px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-md shadow-md transition-colors text-sm sm:text-base"
                        title="Manage all tags"
                    >
                        <Tags size={18} className="mr-2" /> Manage All
                    </button>
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-800/60 rounded-md min-h-[40px]">
                        {tags.map(tag => (
                            <span key={tag} className="flex items-center bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full h-fit">
                                {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 text-purple-200 hover:text-white p-0.5 rounded-full hover:bg-purple-700/50 transition-colors">
                                    <X size={14}/>
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Kickstart with Seed Songs */}
            <div>
                <label htmlFor="seedSong" className="block text-lg font-medium text-purple-300 mb-2">Kickstart with Seed Songs (Optional)</label>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <input 
                        type="text" 
                        id="seedSong" 
                        value={currentSeedSong} 
                        onChange={(e) => setCurrentSeedSong(e.target.value)} 
                        onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSeedSong();}}}
                        placeholder="e.g., Bohemian Rhapsody by Queen" 
                        className="flex-grow p-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500"
                    />
                    <button 
                        type="button" 
                        onClick={handleAddSeedSong} 
                        className="flex items-center justify-center px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-md shadow-md transition-colors text-sm sm:text-base"
                    >
                        <Plus size={18} className="mr-2"/> Add Seed
                    </button>
                </div>
                {seedSongInputs.length > 0 && (
                     <div className="flex flex-wrap gap-2 p-3 bg-slate-800/60 rounded-md min-h-[40px]">
                        {seedSongInputs.map((seed, index) => (
                            <span key={index} className="flex items-center bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full h-fit">
                                <Disc3 size={14} className="mr-1.5"/> {seed}
                                <button type="button" onClick={() => handleRemoveSeedSong(seed)} className="ml-2 text-emerald-200 hover:text-white p-0.5 rounded-full hover:bg-emerald-700/50 transition-colors">
                                    <X size={14}/>
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Collapsible Advanced AI Preferences Section */}
            <div className="pt-4 border-t border-slate-600/50">
                <button
                    type="button"
                    onClick={() => setIsAdvancedPrefsOpen(!isAdvancedPrefsOpen)}
                    className="flex items-center justify-between w-full text-left py-2 px-1 text-lg font-medium text-purple-300 hover:text-purple-200 transition-colors focus:outline-none"
                >
                    <span className="flex items-center">
                        <Settings2 size={20} className="mr-2" />
                        Advanced AI Preferences
                    </span>
                    {isAdvancedPrefsOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
                {isAdvancedPrefsOpen && (
                    <div className="mt-3 pl-2 pr-1 pb-2 border-l-2 border-slate-600">
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
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-600/50">
                <label htmlFor="isPublicToggle" className="text-lg font-medium text-purple-300 flex items-center">
                    {isPublic ? <Eye size={20} className="mr-2 text-green-400"/> : <EyeOff size={20} className="mr-2 text-gray-500"/>}
                    Make Playlist Publicly Shareable?
                </label>
                <button
                    id="isPublicToggle"
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${isPublic ? 'bg-green-500 focus:ring-green-400' : 'bg-slate-600 focus:ring-purple-500'}`}
                >
                    <span className="sr-only">Make playlist public</span>
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isPublic ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
            </div>

            <button 
                type="button" 
                onClick={handleGetSongIdeas} 
                disabled={isLoadingSuggestions || (!originalThemePrompt.trim() && !theme.trim() && seedSongInputs.length === 0 && fusionGenres.length === 0 && !storyNarrative.trim() && !vibeArcDescription.trim())} 
                className="w-full sm:w-auto mt-4 flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
                {isLoadingSuggestions ? <Loader2 className="animate-spin mr-2" size={20}/> : <Music className="mr-2" size={20} />} 
                {songs.length > 0 ? "Get More Ideas" : "Get Song Ideas"}
            </button>
        </div>
    );
};

export default PlaylistFormHeader;

