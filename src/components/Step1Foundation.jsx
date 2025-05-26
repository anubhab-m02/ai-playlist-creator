import React from 'react'; // Removed useState as it's not used here directly anymore for local collapse
import { Tag as TagIconLucide, X, Disc3, Plus, Sparkles, Loader2, Tags as TagsIcon, Music, Edit } from 'lucide-react';

// Define SectionCard outside the Step1Foundation component for stability
const SectionCard = ({ title, icon: Icon, description, children }) => (
    <div className="p-6 bg-slate-700/40 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/50">
        <div className="flex items-center mb-1">
            {Icon && <Icon size={24} className="mr-3 text-purple-400 flex-shrink-0" />}
            <h2 className="text-xl font-semibold text-purple-300">{title}</h2>
        </div>
        {description && <p className="text-sm text-gray-400 mb-4 ml-9">{description}</p>}
        <div className={`space-y-3 ${Icon ? 'ml-9' : ''}`}> {/* Conditionally add margin if icon exists */}
            {children}
        </div>
    </div>
);


const Step1Foundation = ({
    theme, handleThemeInputChange, originalThemePrompt, isLoadingTitle, handleSuggestPlaylistTitle, suggestedTitles, setTheme, setSuggestedTitles,
    currentTagInput, setCurrentTagInput, handleAddTag, tags, handleRemoveTag, onOpenManageTags,
    currentSeedSong, setCurrentSeedSong, handleAddSeedSong, seedSongInputs, handleRemoveSeedSong,
    onNextStep,
}) => {
    return (
        <div className="space-y-8 p-1">
            <SectionCard 
                title="Name Your Mixtape" 
                icon={Edit}
                description="What's the vibe? Give your mixtape a catchy title or theme."
            >
                <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                        type="text" 
                        id="theme" 
                        value={theme} 
                        onChange={handleThemeInputChange} 
                        placeholder="e.g., 90s Summer Hits, Rainy Day Lo-fi" 
                        className="flex-grow p-3 bg-slate-800 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500 text-gray-100" 
                        required 
                    />
                    <button 
                        type="button" 
                        onClick={handleSuggestPlaylistTitle} 
                        disabled={isLoadingTitle || !originalThemePrompt.trim()} 
                        className="flex items-center justify-center px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-70"
                    >
                        {isLoadingTitle ? <Loader2 className="animate-spin mr-2" size={20}/> : <Sparkles className="mr-2" size={18} />} Suggest Title
                    </button>
                </div>
                {suggestedTitles.length > 0 && !isLoadingTitle && (
                    <div className="mt-4 space-y-2 p-3 bg-slate-800/70 rounded-md">
                        <p className="text-xs text-gray-300 font-medium">AI Suggestions (click to use):</p>
                        <ul className="flex flex-wrap gap-2">
                            {suggestedTitles.map((title, i) => (
                                <li key={i}>
                                    <button 
                                        type="button"
                                        onClick={() => { setTheme(title); setSuggestedTitles([]); }} 
                                        className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors shadow-sm"
                                    >
                                        {title}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </SectionCard>
            
            <SectionCard 
                title="Mood / Activity Tags"
                icon={TagsIcon}
                description="Help describe your mixtape. Add tags like 'chill', 'workout', or 'road trip'."
            >
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <input 
                        type="text" 
                        id="tags" 
                        value={currentTagInput} 
                        onChange={(e) => setCurrentTagInput(e.target.value)} 
                        onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag();}}}
                        placeholder="Enter a tag and press Enter or Add" 
                        className="flex-grow p-3 bg-slate-800 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500 text-gray-100"
                    />
                    <button 
                        type="button" 
                        onClick={handleAddTag} 
                        className="flex items-center justify-center px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md transition-colors text-sm sm:text-base transform hover:scale-105"
                    >
                        <TagIconLucide size={18} className="mr-2"/> Add Tag
                    </button>
                    <button
                        type="button"
                        onClick={onOpenManageTags}
                        className="flex items-center justify-center px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition-colors text-sm sm:text-base transform hover:scale-105"
                        title="Manage all tags"
                    >
                        <TagsIcon size={18} className="mr-2" /> Manage All
                    </button>
                </div>
                {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-800/70 rounded-md min-h-[44px]">
                        {tags.map(tag => (
                            <span key={tag} className="flex items-center bg-purple-600 text-white text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full shadow-sm h-fit">
                                {tag.charAt(0).toUpperCase() + tag.slice(1)}
                                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 text-purple-200 hover:text-white p-0.5 rounded-full hover:bg-purple-700/50 transition-colors">
                                    <X size={14}/>
                                </button>
                            </span>
                        ))}
                    </div>
                ) : <p className="text-sm text-gray-500 italic">No tags added yet. Click "Add Tag" or "Manage All".</p>}
            </SectionCard>

            <SectionCard
                title="Kickstart with Seed Songs"
                icon={Music}
                description="Got a few songs in mind already? Add them here to guide the AI (optional)."
            >
                <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <input 
                        type="text" 
                        id="seedSong" 
                        value={currentSeedSong} 
                        onChange={(e) => setCurrentSeedSong(e.target.value)} 
                        onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSeedSong();}}}
                        placeholder="e.g., Bohemian Rhapsody by Queen" 
                        className="flex-grow p-3 bg-slate-800 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500 text-gray-100"
                    />
                    <button 
                        type="button" 
                        onClick={handleAddSeedSong} 
                        className="flex items-center justify-center px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md transition-colors text-sm sm:text-base transform hover:scale-105"
                    >
                        <Plus size={18} className="mr-2"/> Add Seed
                    </button>
                </div>
                {seedSongInputs.length > 0 ? (
                     <div className="flex flex-wrap gap-2 p-3 bg-slate-800/70 rounded-md min-h-[44px]">
                        {seedSongInputs.map((seed, index) => (
                            <span key={index} className="flex items-center bg-emerald-600 text-white text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full shadow-sm h-fit">
                                <Disc3 size={14} className="mr-1.5"/> {seed}
                                <button type="button" onClick={() => handleRemoveSeedSong(seed)} className="ml-2 text-emerald-200 hover:text-white p-0.5 rounded-full hover:bg-emerald-700/50 transition-colors">
                                    <X size={14}/>
                                </button>
                            </span>
                        ))}
                    </div>
                ): <p className="text-sm text-gray-500 italic">No seed songs added yet. This can help the AI understand your taste!</p>}
            </SectionCard>

            <div className="mt-10 flex justify-end">
                <button
                    type="button"
                    onClick={onNextStep}
                    disabled={!theme.trim()}
                    className="px-10 py-3.5 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-xl shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50"
                >
                    Next: Curate Songs &rarr;
                </button>
            </div>
        </div>
    );
};

export default Step1Foundation;
