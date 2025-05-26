import React from 'react'; // Removed useRef as it's now passed as a prop
import { Clock, GripVertical, Edit2, Trash2 } from 'lucide-react';

// formatDuration should be passed as a prop or imported from a utility file

const CurrentMixtapeDisplay = ({
    songs,
    songsListRef, // Receive the ref as a prop
    totalPlaylistDurationMs,
    formatDuration, // Pass this helper function as a prop
    removeSongFromPlaylist,
    handleEditSongNote,
    editingNoteForSongId,
    currentSongNote,
    setCurrentSongNote,
    handleSaveSongNote,
    handleCancelEditSongNote,
    // Drag and Drop handlers
    handleDragStart,
    handleDragEnter,
    handleDragLeave, // Ensure this prop is received
    handleDragEnd,
    handleDragOver, 
    handleDrop
}) => {
    // const songsListRef = useRef(null); // Removed: ref is now passed as a prop

    return (
        <div className="p-6 bg-slate-700/50 rounded-lg shadow-inner">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-medium text-purple-300">3. Your Mixtape</h3>
                {songs.length > 0 && (
                    <span className="text-sm text-gray-400 flex items-center">
                        <Clock size={14} className="mr-1.5 text-purple-400"/>
                        {songs.length} tracks • {formatDuration(totalPlaylistDurationMs)}
                    </span>
                )}
            </div>
            {songs.length === 0 && <p className="text-sm text-gray-400 italic">Add songs from Gemini's Booth or search results.</p>}
            {songs.length > 0 && (
                <ul ref={songsListRef} className="space-y-2 max-h-[28rem] overflow-y-auto pr-2 custom-scrollbar">
                    {songs.map((song, index) => (
                        <li
                            key={song.id}
                            className="flex flex-col p-3 bg-slate-800 rounded-md border border-transparent hover:border-purple-500/50 transition-all group"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragLeave={(e) => handleDragLeave(e)} // Pass event to handler
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver} 
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center flex-grow min-w-0">
                                    <GripVertical size={20} className="text-gray-500 mr-2 cursor-grab group-hover:text-purple-400 transition-colors flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-200 truncate" title={song.title}>{index + 1}. {song.title}</p>
                                        <p className="text-xs text-gray-400 truncate" title={`${song.artist}${song.album ? ` • ${song.album}` : ''}`}>
                                            {song.artist} {song.album ? `• ${song.album}` : ''} {song.duration_ms ? `(${formatDuration(song.duration_ms)})` : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 flex items-center ml-2">
                                    <button onClick={() => handleEditSongNote(song.id)} className="p-1.5 rounded-full hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition-colors mr-1" title="Edit Note">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => removeSongFromPlaylist(song.id)} className="p-1.5 rounded-full hover:bg-red-700/50 text-red-400 hover:text-red-300 transition-colors" title="Remove from Mixtape">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            {editingNoteForSongId === song.id ? (
                                <div className="mt-2.5 pl-7">
                                    <textarea
                                        value={currentSongNote}
                                        onChange={(e) => setCurrentSongNote(e.target.value)}
                                        placeholder="Add a personal note..."
                                        rows="2"
                                        className="w-full p-2 text-xs bg-slate-700 border border-slate-600 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-500 custom-scrollbar"
                                    />
                                    <div className="mt-1.5 flex justify-end space-x-2">
                                        <button onClick={handleCancelEditSongNote} className="px-2.5 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded-md transition-colors">Cancel</button>
                                        <button onClick={() => handleSaveSongNote(song.id)} className="px-2.5 py-1 text-xs bg-green-600 hover:bg-green-500 rounded-md transition-colors">Save Note</button>
                                    </div>
                                </div>
                            ) : (
                                song.personalNote && (
                                    <p className="mt-1.5 pl-7 text-xs text-gray-400 italic break-words cursor-pointer hover:text-sky-300" onClick={() => handleEditSongNote(song.id)}>{song.personalNote}</p>
                                )
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CurrentMixtapeDisplay;
