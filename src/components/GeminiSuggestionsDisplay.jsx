import React from 'react';
import { Loader2, PlusCircle } from 'lucide-react';

const GeminiSuggestionsDisplay = ({ 
    aiSuggestions, 
    isLoadingSuggestions, 
    songs, // To provide context for messages
    addSongToPlaylist 
}) => {
    if (!isLoadingSuggestions && aiSuggestions.length === 0 && songs.length === 0) {
        return <p className="text-sm text-gray-400 italic">Enter a theme and click "Get Song Ideas" to see suggestions here.</p>;
    }
    if (!isLoadingSuggestions && aiSuggestions.length === 0 && songs.length > 0) {
        return <p className="text-sm text-gray-400 italic">No new AI suggestions based on current criteria. Try a different theme or adjust preferences!</p>;
    }

    return (
        <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner">
            <h3 className="text-xl font-medium text-purple-300 mb-3">2. Gemini's Booth <span className="text-sm text-gray-400">(Song Ideas)</span></h3>
            {isLoadingSuggestions && (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" /> 
                    <p className="ml-2 text-gray-300">Brewing suggestions...</p>
                </div>
            )}
            {aiSuggestions.length > 0 && (
                <ul className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {aiSuggestions.map((song) => (
                        <li 
                            key={song.id} 
                            className="flex items-center justify-between p-3 bg-slate-800 rounded-md hover:bg-slate-700/70 transition-colors"
                        >
                            <div>
                                <p className="font-medium text-gray-200">{song.title}</p>
                                <p className="text-xs text-gray-400">
                                    {song.artist} {song.album ? `• ${song.album}` : ''}
                                </p>
                            </div>
                            <button 
                                onClick={() => addSongToPlaylist(song)} 
                                className="p-2 rounded-full hover:bg-purple-600 text-purple-400 hover:text-white transition-colors" 
                                title="Add to Mixtape"
                            >
                                <PlusCircle size={20} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GeminiSuggestionsDisplay;
