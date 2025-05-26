import React, { useState, useEffect } from 'react';
import { useFirebase } from '../firebase'; 
import PlaylistCard from './PlaylistCard';
import Modal from './Modal';
import Alert from './Alert';
import { Loader2, Music, LogIn, ChevronDown, ChevronUp, Archive as ArchiveIcon } from 'lucide-react'; // Added Chevron icons
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';


const Dashboard = ({ onEditPlaylist, onRemixPlaylist }) => { // Added onRemixPlaylist
    const { db, currentUser, appId, isLoadingAuth } = useFirebase();
    const [activePlaylists, setActivePlaylists] = useState([]);
    const [archivedPlaylists, setArchivedPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [playlistToDelete, setPlaylistToDelete] = useState(null);
    const [showArchived, setShowArchived] = useState(false); // State for toggling archived section

    useEffect(() => {
        if (isLoadingAuth) {
            setIsLoading(true);
            return;
        }
        if (!currentUser || !db) {
            setError(!currentUser ? "Please sign in to view your mixtapes." : "Database not available.");
            setIsLoading(false);
            setActivePlaylists([]);
            setArchivedPlaylists([]);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        const playlistsCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/playlists`;
        // Order by 'updatedAt' in descending order to show newest first.
        // Firestore requires an index for this. If you haven't created one, 
        // you'll see an error in the console with a link to create it.
        const q = query(collection(db, playlistsCollectionPath), orderBy("updatedAt", "desc"));


        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allPlaylistsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const active = [];
            const archived = [];

            allPlaylistsData.forEach(playlist => {
                if (playlist.isArchived) {
                    archived.push(playlist);
                } else {
                    active.push(playlist);
                }
            });
            
            // No need to sort again if Firestore query already handles it.
            // If not using Firestore orderBy, sort here:
            // active.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));
            // archived.sort((a, b) => (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0));

            setActivePlaylists(active);
            setArchivedPlaylists(archived);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching playlists:", err);
            setError("Failed to load your mixtapes. Firestore permissions might be incorrect, network issue, or missing index for ordering. Check console for details.");
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [db, currentUser, appId, isLoadingAuth]);

    const requestDeletePlaylist = (playlistId) => {
        setPlaylistToDelete(playlistId);
        setShowDeleteConfirm(true);
    };

    const confirmDeletePlaylist = async () => {
        if (!db || !currentUser || !playlistToDelete) {
            setError("Cannot delete: Missing information.");
            setTimeout(() => setError(null), 3000);
            setShowDeleteConfirm(false);
            return;
        }
        try {
            const playlistDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/playlists`, playlistToDelete);
            await deleteDoc(playlistDocRef);
            // Playlist will be removed from UI via onSnapshot
            setError(null); // Clear any previous error
        } catch (err) {
            console.error("Error deleting playlist:", err);
            setError("Failed to delete mixtape.");
            setTimeout(() => setError(null), 3000);
        } finally {
            setShowDeleteConfirm(false);
            setPlaylistToDelete(null);
        }
    };

    const handleArchiveToggle = async (playlistId, currentArchivedStatus) => {
        if (!db || !currentUser || !playlistId) {
            setError("Cannot update archive status: Missing information.");
            setTimeout(() => setError(null), 3000);
            return;
        }
        try {
            const playlistDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/playlists`, playlistId);
            await updateDoc(playlistDocRef, {
                isArchived: !currentArchivedStatus,
                updatedAt: serverTimestamp() // Update timestamp to reflect change
            });
             setError(null); // Clear any previous error
            // UI will update via onSnapshot
        } catch (err) {
            console.error("Error toggling archive status:", err);
            setError(`Failed to ${currentArchivedStatus ? 'unarchive' : 'archive'} mixtape.`);
            setTimeout(() => setError(null), 3000);
        }
    };


    if (isLoading || isLoadingAuth) return <div className="flex justify-center items-center flex-grow"><Loader2 className="h-10 w-10 animate-spin text-purple-400" /> <p className="ml-3 text-lg">Loading your mixtapes...</p></div>;
    
    if (!currentUser && !isLoadingAuth) {
        return <div className="text-center text-gray-400 py-10 flex-grow flex flex-col items-center justify-center">
            <LogIn className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <h2 className="text-2xl font-semibold mb-2">Please Sign In</h2>
            <p>Sign in to create and view your mixtapes.</p>
        </div>;
    }
    
    if (activePlaylists.length === 0 && archivedPlaylists.length === 0 && !isLoading && !error) {
        return <div className="text-center text-gray-400 py-10 flex-grow flex flex-col items-center justify-center">
            <Music className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <h2 className="text-2xl font-semibold mb-2">No Mixtapes Yet!</h2>
            <p>Time to craft your first masterpiece. Click "Create New" to get started.</p>
        </div>;
    }

    return (
        <div className="space-y-8">
            {error && <Alert type="error">{error}</Alert>}
            
            <div>
                <h2 className="text-3xl font-semibold text-purple-300 mb-6">My Active Mixtapes ({activePlaylists.length})</h2>
                {activePlaylists.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {activePlaylists.map(playlist => (
                            <PlaylistCard 
                                key={playlist.id} 
                                playlist={playlist} 
                                onEdit={() => onEditPlaylist(playlist)} 
                                onDelete={() => requestDeletePlaylist(playlist.id)}
                                onArchiveToggle={handleArchiveToggle}
                                onRemix={() => onRemixPlaylist(playlist)}
                            />
                        ))}
                    </div>
                ) : (
                     <div className="text-center text-gray-400 py-6 border-2 border-dashed border-slate-700 rounded-lg">
                        <Music className="h-12 w-12 mx-auto mb-3 text-gray-500" />
                        <p className="text-lg">No active mixtapes found.</p>
                        <p className="text-sm">Create a new one or check your archive!</p>
                    </div>
                )}
            </div>

            {archivedPlaylists.length > 0 && (
                 <div>
                    <button 
                        onClick={() => setShowArchived(!showArchived)}
                        className="flex items-center justify-between w-full text-left px-4 py-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors mb-4 focus:outline-none"
                    >
                        <div className="flex items-center">
                            <ArchiveIcon className="h-6 w-6 mr-3 text-amber-400" />
                            <h2 className="text-2xl font-semibold text-purple-300">Archived Mixtapes ({archivedPlaylists.length})</h2>
                        </div>
                        {showArchived ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                    {showArchived && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
                            {archivedPlaylists.map(playlist => (
                                <PlaylistCard 
                                    key={playlist.id} 
                                    playlist={playlist} 
                                    onDelete={() => requestDeletePlaylist(playlist.id)}
                                    onArchiveToggle={handleArchiveToggle}
                                    // Edit and Remix are typically disabled for archived items
                                    onEdit={() => { setError("Unarchive first to edit."); setTimeout(()=>setError(null), 3000);}} 
                                    onRemix={() => { setError("Unarchive first to remix."); setTimeout(()=>setError(null), 3000);}}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {showDeleteConfirm && (
                <Modal title="Confirm Delete" onClose={() => { setShowDeleteConfirm(false); setPlaylistToDelete(null); }}>
                    <p className="text-gray-300 mb-6">Are you sure you want to delete this mixtape? This action cannot be undone.</p>
                    <div className="flex justify-end space-x-3">
                        <button onClick={() => { setShowDeleteConfirm(false); setPlaylistToDelete(null); }} className="px-4 py-2 rounded-md text-sm font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors">Cancel</button>
                        <button onClick={confirmDeletePlaylist} className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors">Delete</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Dashboard;
