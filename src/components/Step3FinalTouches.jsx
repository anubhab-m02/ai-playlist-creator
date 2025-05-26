import React from 'react';
import { Image as ImageIcon, Sparkles, Loader2, Eye, EyeOff, Lightbulb, Save } from 'lucide-react';

const Step3FinalTouches = ({
    coverArtUrl, setCoverArtUrl,
    linerNotes, setLinerNotes, isLoadingLinerNotes, handleGenerateLinerNotes,
    isPublic, setIsPublic,
    songs, originalThemePrompt, theme, // For disabling liner notes button
    // Future Ideas
    isLoadingFutureIdeas, futurePlaylistIdeas, handleGetFutureIdeas,
    // Save
    isSaving, handleSavePlaylistToFirestore, existingPlaylist, isRemix,
    // Navigation
    onPrevStep,
}) => {
    return (
        <div className="space-y-6 p-1">
            <div className="p-6 bg-slate-700/30 rounded-lg shadow-lg">
                 <h3 className="text-xl font-semibold text-purple-300 mb-2">3. Final Touches & Presentation</h3>
                 <p className="text-sm text-gray-400 mb-4">Add a cover, some notes, and decide if you want to share it.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <div className="p-6 bg-slate-700/30 rounded-lg shadow-lg space-y-3">
                    <h4 className="text-lg font-semibold text-purple-300">Design Your Cover</h4>
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
                <div className="p-6 bg-slate-700/30 rounded-lg shadow-lg space-y-3">
                    <label htmlFor="linerNotes" className="block text-lg font-semibold text-purple-300">Add Liner Notes</label>
                    <p className="text-sm text-gray-400 mb-2">Share the story or mood behind your mixtape.</p>
                    <textarea id="linerNotes" value={linerNotes} onChange={(e) => setLinerNotes(e.target.value)} rows="5" placeholder="e.g., 'A collection of tracks for late-night drives...'" className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500 custom-scrollbar"></textarea>
                    <button type="button" onClick={handleGenerateLinerNotes} disabled={isLoadingLinerNotes || songs.length === 0 || (!originalThemePrompt.trim() && !theme.trim())} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-md shadow-md transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-50 text-sm">
                        {isLoadingLinerNotes ? <Loader2 className="animate-spin mr-2" size={18}/> : <Sparkles className="mr-2" size={18} />}
                        Write Liner Notes
                    </button>
                </div>
            </div>
            
            <div className="p-6 bg-slate-700/30 rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                    <label htmlFor="isPublicToggleFinal" className="text-lg font-semibold text-purple-300 flex items-center">
                        {isPublic ? <Eye size={20} className="mr-2 text-green-400"/> : <EyeOff size={20} className="mr-2 text-gray-500"/>}
                        Make Playlist Publicly Shareable?
                    </label>
                    <button
                        id="isPublicToggleFinal"
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${isPublic ? 'bg-green-500 focus:ring-green-400' : 'bg-slate-600 focus:ring-purple-500'}`}
                    >
                        <span className="sr-only">Make playlist public</span>
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isPublic ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
            </div>

            {songs.length >= 3 && (
                <div className="p-6 bg-slate-700/30 rounded-lg shadow-lg space-y-3">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Bonus: Future Mixtape Ideas?</h3>
                    <button
                        type="button"
                        onClick={handleGetFutureIdeas}
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
            
            <div className="mt-8 flex justify-between items-center">
                <button
                    type="button"
                    onClick={onPrevStep}
                    className="px-8 py-3 bg-slate-600 hover:bg-slate-500 text-white text-lg font-semibold rounded-lg shadow-md transition-colors"
                >
                    &larr; Back to Song Curation
                </button>
                <button 
                    type="button" 
                    onClick={handleSavePlaylistToFirestore} 
                    disabled={isSaving || !theme.trim() || songs.length === 0} 
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-lg shadow-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    {isSaving ? <Loader2 className="animate-spin mr-2" size={24}/> : <Save className="mr-2" size={24} />}
                    {existingPlaylist && !isRemix ? 'Update Mixtape' : 'Save Mixtape'}
                </button>
            </div>
        </div>
    );
};

export default Step3FinalTouches;
