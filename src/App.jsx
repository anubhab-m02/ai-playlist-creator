import React, { useState, useEffect } from 'react';
import { FirebaseProvider, useFirebase } from './firebase'; // Corrected import path
import Header from './components/Header';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import PlaylistCreator from './components/PlaylistCreator';
import SpotifyCallbackHandler from './components/SpotifyCallbackHandler';
import { Loader2 } from 'lucide-react';

function AppContent() { // Renamed App to AppContent to avoid conflict with default export name
    const [currentView, setCurrentView] = useState('loading');
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const firebase = useFirebase();

    useEffect(() => {
        const handleAuthAndPath = () => {
            const path = window.location.pathname;
            if (path === "/callback") {
                setCurrentView('callback');
            } else if (firebase?.isLoadingAuth) {
                setCurrentView('loading');
            } else if (firebase?.currentUser) {
                // If user is logged in, default to dashboard, or stay on creator if that was the view
                if (currentView === 'auth' || currentView === 'loading' || currentView === 'callback') {
                    setCurrentView('dashboard');
                }
                // Allow staying on 'creator' if already there
            } else {
                setCurrentView('auth');
            }
        };
        handleAuthAndPath();
    }, [firebase?.isLoadingAuth, firebase?.currentUser, currentView]); // Added currentView to dep array

    const navigateTo = (view, playlist = null) => {
        setEditingPlaylist(playlist);
        setCurrentView(view);
        setIsMobileMenuOpen(false);
        const newPath = view === 'dashboard' ? '/' : (view === 'auth' ? '/auth' : `/${view}`);
        if (window.location.pathname !== newPath && view !== 'callback') {
             window.history.pushState({}, '', newPath);
        }
    };
    
    let content;
    if (currentView === 'loading') {
        content = <div className="flex flex-col items-center justify-center flex-grow"><Loader2 className="h-12 w-12 animate-spin text-purple-400" /><p className="mt-4 text-lg">Loading Mixtape Maestro...</p></div>;
    } else if (currentView === 'auth') {
        content = <AuthPage onAuthSuccess={() => navigateTo('dashboard')} />;
    } else if (currentView === 'dashboard') {
        content = <Dashboard onEditPlaylist={(p) => navigateTo('creator', p)} />;
    } else if (currentView === 'creator') {
        content = <PlaylistCreator existingPlaylist={editingPlaylist} onSaveSuccess={() => navigateTo('dashboard')} />;
    } else if (currentView === 'callback') {
        content = <SpotifyCallbackHandler onCallbackProcessed={() => navigateTo('dashboard')} />;
    } else {
        content = firebase?.currentUser ? <Dashboard onEditPlaylist={(p) => navigateTo('creator', p)} /> : <AuthPage onAuthSuccess={() => navigateTo('dashboard')} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 text-gray-100 font-sans antialiased flex flex-col">
            <Header currentView={currentView} navigateTo={navigateTo} setIsMobileMenuOpen={setIsMobileMenuOpen} isMobileMenuOpen={isMobileMenuOpen} />
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col"> {/* Added flex flex-col for loading */}
                {content}
            </main>
            <Footer />
        </div>
    );
}

// Main App export that includes the FirebaseProvider
const App = () => ( // This is the default export
    <FirebaseProvider>
        <AppContent />
    </FirebaseProvider>
);

export default App;
