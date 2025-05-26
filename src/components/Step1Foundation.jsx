import React from 'react';
import { Tag as TagIconLucide, X, Disc3, Plus, Sparkles, Loader2, Tags as TagsIcon } from 'lucide-react';

const Step1Foundation = ({
    theme, handleThemeInputChange, originalThemePrompt, isLoadingTitle, handleSuggestPlaylistTitle, suggestedTitles, setTheme, setSuggestedTitles,
    currentTagInput, setCurrentTagInput, handleAddTag, tags, handleRemoveTag, onOpenManageTags,
    currentSeedSong, setCurrentSeedSong, handleAddSeedSong, seedSongInputs, handleRemoveSeedSong,
    onNextStep, // Function to go to the next step
}) => {
    return (
        <div className="space-y-6 p-1"> {/* Reduced padding as it's now part of a larger step */}
            {/* 1. Name Your Mixtape */}
            <div className="p-6 bg-slate-700/30 rounded-lg shadow-lg">
                <label htmlFor="theme" className="block text-xl font-semibold text-purple-300 mb-2">1. Name Your Mixtape</label>
                <p className="text-sm text-gray-400 mb-3">What's the vibe? Give your mixtape a catchy title or theme.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                        type="text" 
                        id="theme" 
                        value={theme} 
                        onChange={handleThemeInputChange} 
                        placeholder="e.g., 90s Summer Hits, Rainy Day Lo-fi" 
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
            <div className="p-6 bg-slate-700/30 rounded-lg shadow-lg">
                <label htmlFor="tags" className="block text-lg font-semibold text-purple-300 mb-2">Mood / Activity Tags</label>
                 <p className="text-sm text-gray-400 mb-3">Help describe your mixtape. Add tags like "chill", "workout", or "road trip".</p>
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <input 
                        type="text" 
                        id="tags" 
                        value={currentTagInput} 
                        onChange={(e) => setCurrentTagInput(e.target.value)} 
                        onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag();}}}
                        placeholder="Enter a tag and press Enter or Add" 
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
                        <TagsIcon size={18} className="mr-2" /> Manage All
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
            <div className="p-6 bg-slate-700/30 rounded-lg shadow-lg">
                <label htmlFor="seedSong" className="block text-lg font-semibold text-purple-300 mb-2">Kickstart with Seed Songs (Optional)</label>
                <p className="text-sm text-gray-400 mb-3">Got a few songs in mind already? Add them here to guide the AI.</p>
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
            <div className="mt-8 flex justify-end">
                <button
                    type="button"
                    onClick={onNextStep}
                    disabled={!theme.trim()}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next: Curate Songs &rarr;
                </button>
            </div>
        </div>
    );
};

export default Step1Foundation;
