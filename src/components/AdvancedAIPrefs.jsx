import React from 'react';
import { CalendarDays, Gem, Languages, MinusCircle, PercentCircle, Blend, X, BookOpen, TrendingUp } from 'lucide-react'; // Ensured all used icons are imported

const AdvancedAIPrefs = ({
    startYear,
    setStartYear,
    endYear,
    setEndYear,
    languagePreferences,
    setLanguagePreferences,
    preferHiddenGems,
    setPreferHiddenGems,
    excludeKeywords,
    setExcludeKeywords,
    instrumentalVocalRatio,
    setInstrumentalVocalRatio,
    fusionGenres,
    currentFusionGenreInput,
    setCurrentFusionGenreInput,
    handleAddFusionGenre,
    handleRemoveFusionGenre,
    storyNarrative,
    setStoryNarrative,
    vibeArcDescription,
    setVibeArcDescription,
}) => {
    // console.log("AdvancedAIPrefs rendering"); // Optional: for debugging if needed
    return (
        <div className="pt-4 border-t border-slate-600/50 space-y-4">
            <h4 className="text-lg font-medium text-purple-300 mb-1">Advanced AI Preferences</h4>
            
            {/* Year Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                <div>
                    <label htmlFor="startYearAdv" className="block text-sm font-medium text-gray-300 mb-1">Start Year</label>
                    <div className="relative">
                        <CalendarDays size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"/>
                        <input type="number" id="startYearAdv" value={startYear} onChange={(e) => setStartYear(e.target.value)} placeholder="e.g., 1990" className="w-full p-3 pl-10 bg-slate-800 border border-slate-600 rounded-md placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="endYearAdv" className="block text-sm font-medium text-gray-300 mb-1">End Year</label>
                     <div className="relative">
                        <CalendarDays size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"/>
                        <input type="number" id="endYearAdv" value={endYear} onChange={(e) => setEndYear(e.target.value)} placeholder="e.g., 1999" className="w-full p-3 pl-10 bg-slate-800 border border-slate-600 rounded-md placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"/>
                    </div>
                </div>
            </div>

            {/* Language Preferences */}
            <div>
                <label htmlFor="languagePreferencesAdv" className="block text-sm font-medium text-gray-300 mb-1">Language Preferences</label>
                <div className="relative">
                    <Languages size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    <input type="text" id="languagePreferencesAdv" value={languagePreferences} onChange={(e) => setLanguagePreferences(e.target.value)} placeholder="e.g., English, Spanish" className="w-full p-3 pl-10 bg-slate-800 border border-slate-600 rounded-md placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"/>
                </div>
            </div>

            {/* Hidden Gems Toggle */}
            <div className="flex items-center justify-between">
                <label htmlFor="preferHiddenGemsToggleAdv" className="text-sm font-medium text-gray-300 flex items-center">
                    <Gem size={18} className={`mr-2 ${preferHiddenGems ? 'text-cyan-400' : 'text-gray-500'}`}/>
                    Prioritize Hidden Gems?
                </label>
                <button
                    id="preferHiddenGemsToggleAdv"
                    type="button"
                    onClick={() => setPreferHiddenGems(!preferHiddenGems)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${preferHiddenGems ? 'bg-cyan-500 focus:ring-cyan-400' : 'bg-slate-600 focus:ring-purple-500'}`}
                >
                    <span className="sr-only">Prioritize Hidden Gems</span>
                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${preferHiddenGems ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
            </div>

            {/* Negative Constraints */}
            <div>
                <label htmlFor="excludeKeywordsAdv" className="block text-sm font-medium text-gray-300 mb-1">Exclude (Keywords, Artists, Genres)</label>
                <div className="relative">
                    <MinusCircle size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    <input type="text" id="excludeKeywordsAdv" value={excludeKeywords} onChange={(e) => setExcludeKeywords(e.target.value)} placeholder="e.g., no rap, exclude Nickelback" className="w-full p-3 pl-10 bg-slate-800 border border-slate-600 rounded-md placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"/>
                </div>
            </div>

            {/* Instrumental/Vocal Ratio */}
            <div>
                <label htmlFor="instrumentalVocalRatioAdv" className="block text-sm font-medium text-gray-300 mb-1">Instrumental/Vocal Focus</label>
                <div className="relative">
                    <PercentCircle size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    <select 
                        id="instrumentalVocalRatioAdv" 
                        value={instrumentalVocalRatio} 
                        onChange={(e) => setInstrumentalVocalRatio(e.target.value)}
                        className="w-full p-3 pl-10 bg-slate-800 border border-slate-600 rounded-md appearance-none focus:ring-purple-500 focus:border-purple-500"
                    >
                        <option value="balanced">Balanced</option>
                        <option value="mostly_instrumental">Mostly Instrumental</option>
                        <option value="mostly_vocal">Mostly Vocal</option>
                    </select>
                </div>
            </div>
            
            {/* Cross-Genre Fusion */}
            <div>
                <label htmlFor="fusionGenreInputAdv" className="block text-sm font-medium text-gray-300 mb-1">Cross-Genre Fusion (add up to 3)</label>
                <div className="flex flex-col sm:flex-row gap-3 mb-2">
                    <input 
                        type="text" 
                        id="fusionGenreInputAdv" 
                        value={currentFusionGenreInput} 
                        onChange={(e) => setCurrentFusionGenreInput(e.target.value)} 
                        onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFusionGenre();}}}
                        placeholder="e.g., Funk, Jazz, Rock" 
                        className="flex-grow p-3 bg-slate-800 border border-slate-600 rounded-md placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <button 
                        type="button" 
                        onClick={handleAddFusionGenre} 
                        disabled={fusionGenres.length >= 3}
                        className="flex items-center justify-center px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md shadow-md transition-colors text-sm sm:text-base disabled:opacity-50"
                    >
                        <Blend size={18} className="mr-2"/> Add Fusion Genre
                    </button>
                </div>
                {fusionGenres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {fusionGenres.map((genre, index) => (
                            <span key={index} className="flex items-center bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                {genre.charAt(0).toUpperCase() + genre.slice(1)}
                                <button type="button" onClick={() => handleRemoveFusionGenre(genre)} className="ml-2 text-orange-200 hover:text-white">
                                    <X size={14}/>
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Storytelling Mode */}
            <div>
                <label htmlFor="storyNarrativeAdv" className="block text-sm font-medium text-gray-300 mb-1">Storytelling Narrative (Optional)</label>
                <div className="relative">
                    <BookOpen size={18} className="absolute left-3 top-3 text-gray-400 pointer-events-none"/>
                    <textarea id="storyNarrativeAdv" value={storyNarrative} onChange={(e) => setStoryNarrative(e.target.value)} placeholder="e.g., A hero's journey: Call to adventure -> Trials -> Victory -> Reflection" rows="3" className="w-full p-3 pl-10 bg-slate-800 border border-slate-600 rounded-md placeholder-gray-500 custom-scrollbar focus:ring-purple-500 focus:border-purple-500"/>
                </div>
            </div>

            {/* Vibe Arc Description */}
            <div>
                <label htmlFor="vibeArcDescriptionAdv" className="block text-sm font-medium text-gray-300 mb-1">Vibe Arc Description (Optional)</label>
                <div className="relative">
                    <TrendingUp size={18} className="absolute left-3 top-3 text-gray-400 pointer-events-none"/>
                    <textarea id="vibeArcDescriptionAdv" value={vibeArcDescription} onChange={(e) => setVibeArcDescription(e.target.value)} placeholder="e.g., Start mellow, build energy, cool down" rows="3" className="w-full p-3 pl-10 bg-slate-800 border border-slate-600 rounded-md placeholder-gray-500 custom-scrollbar focus:ring-purple-500 focus:border-purple-500"/>
                </div>
            </div>
        </div>
    );
};

export default AdvancedAIPrefs;
