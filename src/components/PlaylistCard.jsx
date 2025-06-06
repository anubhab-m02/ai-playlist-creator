import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Archive, RotateCcw, Inbox, Zap } from 'lucide-react'; // Added Archive, Inbox (for Unarchive), Zap (for Remix)

const PlaylistCard = ({ playlist, onEdit, onDelete, onArchiveToggle, onRemix }) => { // Added onArchiveToggle, onRemix
    const fallbackCover = `https://placehold.co/300x300/1F2937/9333EA?text=${encodeURIComponent(playlist.theme?.substring(0,10) || 'Mix')}`;
    const [imageSrc, setImageSrc] = useState(playlist.coverArtUrl || fallbackCover);

    useEffect(() => {
        setImageSrc(playlist.coverArtUrl || fallbackCover);
    }, [playlist.coverArtUrl, playlist.theme]);
    
    const handleImageError = () => {
        setImageSrc(fallbackCover);
    };

    const isArchived = playlist.isArchived || false;

    return (
        <div className={`bg-slate-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-purple-500/30 hover:scale-[1.02] flex flex-col ${isArchived ? 'opacity-70 border-2 border-slate-700' : ''}`}>
            <img 
                src={imageSrc} 
                alt={`Cover for ${playlist.theme || 'mixtape'}`} 
                className="w-full h-48 object-cover"
                onError={handleImageError} 
            />
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-purple-400 truncate mb-1" title={playlist.theme}>{playlist.theme || "Untitled Mixtape"}</h3>
                <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-500">
                        {playlist.songs ? playlist.songs.length : 0} tracks
                        {playlist.createdAt?.toDate && ` • Created: ${new Date(playlist.createdAt.toDate()).toLocaleDateString()}`}
                    </p>
                    {isArchived && <span className="text-xs bg-slate-700 text-amber-400 px-2 py-0.5 rounded-full font-semibold">Archived</span>}
                </div>
                <p className="text-sm text-gray-400 h-10 overflow-hidden text-ellipsis mb-3 flex-grow">
                    {playlist.linerNotes || "No liner notes for this mixtape."}
                </p>
                <div className="flex justify-end space-x-2 mt-4 pt-3 border-t border-slate-700/50">
                    {!isArchived && (
                         <button onClick={() => onRemix(playlist)} className="p-2 rounded-full hover:bg-slate-700 transition-colors" title="Remix Mixtape">
                            <Zap size={18} className="text-teal-400" />
                        </button>
                    )}
                    <button onClick={() => onArchiveToggle(playlist.id, isArchived)} className="p-2 rounded-full hover:bg-slate-700 transition-colors" title={isArchived ? "Unarchive Mixtape" : "Archive Mixtape"}>
                        {isArchived ? <Inbox size={18} className="text-green-400" /> : <Archive size={18} className="text-amber-400" />}
                    </button>
                    {!isArchived && (
                        <button onClick={onEdit} className="p-2 rounded-full hover:bg-slate-700 transition-colors" title="Edit Mixtape">
                            <Edit3 size={18} className="text-yellow-400" />
                        </button>
                    )}
                    <button onClick={() => onDelete(playlist.id)} className="p-2 rounded-full hover:bg-slate-700 transition-colors" title="Delete Mixtape">
                        <Trash2 size={18} className="text-red-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaylistCard;
