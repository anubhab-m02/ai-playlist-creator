import React, { useState, useEffect } from 'react';
import { useFirebase } from '../firebase'; // Corrected import path
import PlaylistCard from './PlaylistCard';
import Modal from './Modal';
import Alert from './Alert';
import { Loader2, Music, LogIn } from 'lucide-react';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';


const Dashboard = ({ onEditPlaylist }) => {
    const { db, currentUser, appId, isLoadingAuth } = useFirebase();
    const [playlists, setPlaylists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [playlistToDelete, setPlaylistToDelete] = useState(null);

    useEffect(() => {
        if (isLoadingAuth) {
            setIsLoading(true);
            return;
        }
        if (!currentUser || !db) {
            setError(!currentUser ? "Please sign in to view your mixtapes." : "Database not available.");
            setIsLoading(false);
            setPlaylists([]);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        const playlistsCollectionPath = `artifacts/${appId}/users/${currentUser.uid}/playlists`;
        const q = query(collection(db, playlistsCollectionPath));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const playlistsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            playlistsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setPlaylists(playlistsData);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching playlists:", err);
            setError("Failed to load your mixtapes. Firestore permissions might be incorrect or network issue.");
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
        } catch (err) {
            console.error("Error deleting playlist:", err);
            setError("Failed to delete mixtape.");
            setTimeout(() => setError(null), 3000);
        } finally {
            setShowDeleteConfirm(false);
            setPlaylistToDelete(null);
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

    if (error) return <Alert type="error">{error}</Alert>;
    
    if (playlists.length === 0 && !isLoading) {
        return <div className="text-center text-gray-400 py-10 flex-grow flex flex-col items-center justify-center">
            <Music className="h-16 w-16 mx-auto mb-4 text-gray-500" />
            <h2 className="text-2xl font-semibold mb-2">No Mixtapes Yet!</h2>
            <p>Time to craft your first masterpiece. Click "Create New" to get started.</p>
        </div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-purple-300 mb-6">My Mixtapes</h2>
            {playlists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {playlists.map(playlist => (
                        <PlaylistCard key={playlist.id} playlist={playlist} onEdit={() => onEditPlaylist(playlist)} onDelete={() => requestDeletePlaylist(playlist.id)} />
                    ))}
                </div>
            ) : (
                 <div className="text-center text-gray-400 py-10"> {/* Fallback if playlists array is empty after loading */}
                    <Music className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                    <h2 className="text-2xl font-semibold mb-2">No Mixtapes Found</h2>
                    <p>Start by creating a new mixtape!</p>
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
