import React, { useState, useEffect } from 'react';
import { FirebaseProvider, useFirebase } from './firebase';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import PlaylistCreator from './components/PlaylistCreator';
import { Loader2 } from 'lucide-react';

function AppContent() {
    const [currentView, setCurrentView] = useState('loading'); // loading, auth, dashboard, creator
    const [editingPlaylist, setEditingPlaylist] = useState(null); // Can be playlist object or null
    const [isRemixing, setIsRemixing] = useState(false); // Flag for remix operation
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const firebase = useFirebase();

    useEffect(() => {
        const handleAuthAndPath = () => {
            if (firebase?.isLoadingAuth) {
                setCurrentView('loading');
            } else if (firebase?.currentUser) {
                if (currentView === 'auth' || currentView === 'loading') {
                    setCurrentView('dashboard');
                }
            } else {
                setCurrentView('auth');
            }
        };
        handleAuthAndPath();
    }, [firebase?.isLoadingAuth, firebase?.currentUser, currentView]);

    const navigateTo = (view, playlistData = null, isRemixOp = false) => {
        setEditingPlaylist(playlistData); // Store the full playlist data
        setIsRemixing(isRemixOp);      // Set the remix flag
        setCurrentView(view);
        setIsMobileMenuOpen(false);
        
        // Basic path update, can be enhanced with actual routing library later
        const newPath = view === 'dashboard' ? '/' : (view === 'auth' ? '/auth' : `/${view}`);
        if (window.location.pathname !== newPath) {
             window.history.pushState({}, '', newPath);
        }
    };
    
    let content;
    if (currentView === 'loading') {
        content = <div className="flex flex-col items-center justify-center flex-grow"><Loader2 className="h-12 w-12 animate-spin text-purple-400" /><p className="mt-4 text-lg">Loading Mixtape Maestro...</p></div>;
    } else if (currentView === 'auth') {
        content = <AuthPage onAuthSuccess={() => navigateTo('dashboard')} />;
    } else if (currentView === 'dashboard') {
        content = <Dashboard 
                    onEditPlaylist={(p) => navigateTo('creator', p, false)} 
                    onRemixPlaylist={(p) => navigateTo('creator', p, true)} // Pass true for isRemixOp
                  />;
    } else if (currentView === 'creator') {
        content = <PlaylistCreator 
                    existingPlaylist={editingPlaylist} 
                    onSaveSuccess={() => navigateTo('dashboard')}
                    isRemix={isRemixing} // Pass the isRemixing flag
                  />;
    } else { 
        content = firebase?.currentUser ? <Dashboard onEditPlaylist={(p) => navigateTo('creator', p, false)} onRemixPlaylist={(p) => navigateTo('creator', p, true)} /> : <AuthPage onAuthSuccess={() => navigateTo('dashboard')} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 text-gray-100 font-sans antialiased flex flex-col">
            <Header currentView={currentView} navigateTo={navigateTo} setIsMobileMenuOpen={setIsMobileMenuOpen} isMobileMenuOpen={isMobileMenuOpen} />
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
                {content}
            </main>
            <Footer />
        </div>
    );
}

const App = () => (
    <FirebaseProvider>
        <AppContent />
    </FirebaseProvider>
);

export default App;
