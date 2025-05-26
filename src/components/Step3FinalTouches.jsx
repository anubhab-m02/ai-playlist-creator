import React from 'react';
import { Image as ImageIcon, Sparkles, Loader2, Eye, EyeOff, Lightbulb, Save, FileText, Camera } from 'lucide-react';

// Using a simple SectionCard for non-collapsible sections in this step
const SectionWrapper = ({ title, icon: Icon, description, children, className="" }) => (
    <div className={`p-5 bg-slate-700/40 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/50 ${className}`}>
        <div className="flex items-center mb-1">
            {Icon && <Icon size={22} className="mr-3 text-purple-400 flex-shrink-0" />}
            <h2 className="text-xl font-semibold text-purple-300">{title}</h2>
        </div>
        {description && <p className="text-sm text-gray-400 mb-4 ml-9">{description}</p>}
        <div className={`space-y-4 ${Icon ? 'ml-9' : ''}`}>
            {children}
        </div>
    </div>
);


const Step3FinalTouches = ({
    coverArtUrl, setCoverArtUrl,
    linerNotes, setLinerNotes, isLoadingLinerNotes, handleGenerateLinerNotes,
    isPublic, setIsPublic,
    songs, originalThemePrompt, theme, 
    isLoadingFutureIdeas, futurePlaylistIdeas, handleGetFutureIdeas,
    isSaving, handleSavePlaylistToFirestore, existingPlaylist, isRemix,
    onPrevStep,
}) => {
    return (
        <div className="space-y-8 p-1">
            {/* Two-column layout for Cover and Liner Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                <SectionWrapper
                    title="Design Your Cover"
                    icon={Camera}
                    description="Give your mixtape a face. Paste an image URL below."
                    className="flex flex-col" // Ensure card can grow
                >
                    <div className="flex flex-col items-center gap-4 flex-grow"> {/* flex-grow for content */}
                        <div className="w-full sm:w-3/4 aspect-square bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden border-2 border-slate-600 shadow-inner">
                            {coverArtUrl ? <img src={coverArtUrl} alt="Playlist Cover Art Preview" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display='none'; const placeholder = e.target.parentElement.querySelector('.placeholder-icon'); if(placeholder) placeholder.style.display='flex'; }}/> : null}
                            {!coverArtUrl && <ImageIcon size={60} className="text-gray-500 placeholder-icon" />}
                        </div>
                        <input 
                            type="text" 
                            value={coverArtUrl} 
                            onChange={(e) => setCoverArtUrl(e.target.value)} 
                            placeholder="Paste image URL here..." 
                            className="w-full p-3 bg-slate-800 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500 text-gray-100"
                        />
                    </div>
                </SectionWrapper>

                <SectionWrapper
                    title="Add Liner Notes"
                    icon={FileText}
                    description="Share the story, mood, or a dedication for your mixtape."
                    className="flex flex-col" // Ensure card can grow
                >
                    <textarea 
                        id="linerNotes" 
                        value={linerNotes} 
                        onChange={(e) => setLinerNotes(e.target.value)} 
                        rows="7" 
                        placeholder="e.g., 'A collection of tracks for late-night drives, inspired by neon lights and cityscapes...'" 
                        className="w-full p-3 bg-slate-800 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500 text-gray-100 custom-scrollbar flex-grow" // flex-grow for textarea
                    />
                    <button 
                        type="button" 
                        onClick={handleGenerateLinerNotes} 
                        disabled={isLoadingLinerNotes || songs.length === 0 || (!originalThemePrompt.trim() && !theme.trim())} 
                        className="w-full sm:w-auto mt-auto flex items-center justify-center px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-70 text-sm"
                    >
                        {isLoadingLinerNotes ? <Loader2 className="animate-spin mr-2" size={18}/> : <Sparkles className="mr-2" size={18} />}
                        Write Liner Notes
                    </button>
                </SectionWrapper>
            </div>
            
            {/* Full-width sections for remaining items */}
            <SectionWrapper title="Sharing & Visibility" icon={Eye} className="mt-8">
                <div className="flex items-center justify-between">
                    <label htmlFor="isPublicToggleFinal" className="text-md font-medium text-gray-200 flex items-center">
                        Make Playlist Publicly Shareable?
                    </label>
                    <button
                        id="isPublicToggleFinal"
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative inline-flex items-center h-7 w-12 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 rounded-full ${isPublic ? 'bg-green-500 focus:ring-green-400' : 'bg-slate-600 focus:ring-purple-500'}`}
                    >
                        <span className="sr-only">Make playlist public</span>
                        <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isPublic ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
                 {isPublic && <p className="text-xs text-green-400/80 mt-1">Anyone with the link will be able to view this mixtape.</p>}
                {!isPublic && <p className="text-xs text-gray-500 mt-1">This mixtape will be private to you.</p>}
            </SectionWrapper>

            {songs.length >= 3 && (
                <SectionWrapper 
                    title="Bonus: Future Mixtape Ideas?"
                    icon={Lightbulb}
                    description="Get some inspiration for your next creation based on this one."
                    className="mt-8"
                >
                    <button
                        type="button"
                        onClick={handleGetFutureIdeas}
                        disabled={isLoadingFutureIdeas}
                        className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 ease-in-out disabled:opacity-60 transform hover:scale-105"
                    >
                        {isLoadingFutureIdeas ? <Loader2 className="animate-spin mr-2" size={20}/> : <Lightbulb className="mr-2" size={20} />}
                        Suggest Next Themes
                    </button>
                    {futurePlaylistIdeas.length > 0 && !isLoadingFutureIdeas && (
                        <div className="mt-4 space-y-3">
                            {futurePlaylistIdeas.map((idea, index) => (
                                <div key={index} className="p-3 bg-slate-800/70 rounded-md border border-slate-600">
                                    <p className="font-semibold text-indigo-300">{idea.idea}</p>
                                    <p className="text-xs text-gray-400">{idea.explanation}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionWrapper>
            )}
            
            <div className="mt-10 flex justify-between items-center">
                <button
                    type="button"
                    onClick={onPrevStep}
                    className="px-10 py-3.5 bg-slate-600 hover:bg-slate-500 text-white text-lg font-bold rounded-xl shadow-lg transition-colors transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-opacity-50"
                >
                    &larr; Curation
                </button>
                <button 
                    type="button" 
                    onClick={handleSavePlaylistToFirestore} 
                    disabled={isSaving || !theme.trim() || songs.length === 0} 
                    className="px-10 py-3.5 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-lg transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin mr-2" size={24}/> : <Save className="mr-2" size={24} />}
                    {existingPlaylist && !isRemix ? 'Update Mixtape' : 'Save Mixtape'}
                </button>
            </div>
        </div>
    );
};

export default Step3FinalTouches;
