import React from 'react';
import { Loader2, PlusCircle, Music } from 'lucide-react'; // Changed MusicNote to Music

const GeminiSuggestionsDisplay = ({ 
    aiSuggestions, 
    isLoadingSuggestions, 
    songs, // To provide context for messages
    addSongToPlaylist 
}) => {
    // Message for when AI is working or no suggestions are available yet.
    if (isLoadingSuggestions) {
        return (
            <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner min-h-[200px] flex flex-col justify-center items-center text-center">
                <Loader2 className="h-10 w-10 animate-spin text-purple-400 mb-3" /> 
                <p className="text-lg font-medium text-gray-200">Gemini is searching for tunes...</p>
                <p className="text-sm text-gray-400">Hang tight, crafting your recommendations!</p>
            </div>
        );
    }

    if (aiSuggestions.length === 0) {
        if (songs.length === 0) { // No songs in playlist and no AI suggestions yet
            return (
                <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner min-h-[200px] flex flex-col justify-center items-center text-center">
                    <Music size={48} className="text-purple-400 mb-3 opacity-70" /> {/* Changed MusicNote to Music */}
                    <h4 className="text-lg font-medium text-gray-200 mb-1">Gemini's Booth is Ready!</h4>
                    <p className="text-sm text-gray-400">Enter a theme in Step 1 and click "Get Song Ideas" to see suggestions here.</p>
                </div>
            );
        } else { // Songs in playlist, but no *new* AI suggestions for current criteria
             return (
                <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner min-h-[200px] flex flex-col justify-center items-center text-center">
                    <Music size={48} className="text-purple-400 mb-3 opacity-70" /> {/* Changed MusicNote to Music */}
                    <h4 className="text-lg font-medium text-gray-200 mb-1">Looking for something different?</h4>
                    <p className="text-sm text-gray-400">No new AI suggestions for this combo. Try a different theme or adjust preferences in "Fine-Tune AI"!</p>
                </div>
            );
        }
    }

    return (
        <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold text-purple-300 mb-1">Gemini's Booth</h3>
            <p className="text-sm text-gray-400 mb-4">Freshly picked song ideas based on your criteria. Click '+' to add them to your mixtape!</p>
            
            {aiSuggestions.length > 0 && (
                <ul className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar"> {/* Increased max-h slightly */}
                    {aiSuggestions.map((song) => (
                        <li 
                            key={song.id} 
                            // Ensure the li itself allows its children to expand
                            className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700/70 rounded-md transition-colors w-full"
                        >
                            {/* This div should take up available space to push button to the right */}
                            <div className="flex-grow min-w-0 mr-3"> {/* Added min-w-0 for better truncation and mr-3 for spacing */}
                                <p className="font-medium text-gray-100 truncate" title={song.title}>{song.title}</p>
                                <p className="text-xs text-gray-400 truncate" title={`${song.artist}${song.album ? ` • ${song.album}` : ''}`}>
                                    {song.artist} {song.album ? `• ${song.album}` : ''}
                                </p>
                            </div>
                            <button 
                                onClick={() => addSongToPlaylist(song)} 
                                className="flex-shrink-0 p-2 rounded-full hover:bg-purple-600 text-purple-400 hover:text-white transition-colors" 
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
