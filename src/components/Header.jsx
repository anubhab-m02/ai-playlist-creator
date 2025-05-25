import React from 'react';
import { useFirebase } from '../firebase';
import UserMenu from './UserMenu';
import { ListMusic, Menu, X } from 'lucide-react'; // Removed CheckCircle, Briefcase

const Header = ({ currentView, navigateTo, setIsMobileMenuOpen, isMobileMenuOpen }) => {
    const { currentUser, doSignOut } = useFirebase(); // Removed spotify-related context values

    const handleSignOut = async () => {
        try {
            await doSignOut();
            navigateTo('auth');
        } catch (error) {
            console.error("Error during sign out:", error);
        }
    };

    return (
        <header className="bg-slate-800/50 backdrop-blur-md shadow-lg p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => currentUser ? navigateTo('dashboard') : navigateTo('auth')}>
                    <ListMusic className="h-8 w-8 text-purple-400" />
                    <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Mixtape Maestro</h1>
                </div>
                {currentUser && (
                    <nav className="hidden md:flex space-x-4 items-center">
                        <button onClick={() => navigateTo('dashboard')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-purple-700/50 hover:text-purple-300'}`}>My Mixtapes</button>
                        <button onClick={() => navigateTo('creator')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'creator' ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-purple-700/50 hover:text-purple-300'}`}>Create New</button>
                        {/* Removed Spotify Connect Button/Indicator */}
                        <UserMenu handleSignOut={handleSignOut} />
                    </nav>
                )}
                {currentUser && (
                    <div className="md:hidden"><button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white focus:outline-none">{isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}</button></div>
                )}
                 {!currentUser && currentView !== 'auth' && ( // Show login button if not on auth page and not logged in
                    <nav className="hidden md:block">
                         <button onClick={() => navigateTo('auth')} className="px-4 py-2 rounded-md text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white shadow-md">Login</button>
                    </nav>
                )}
            </div>
            {currentUser && isMobileMenuOpen && (
                <div className="md:hidden mt-3 bg-slate-700/80 rounded-lg p-4 space-y-3">
                    <button onClick={() => navigateTo('dashboard')} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentView === 'dashboard' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-purple-700/50 hover:text-white'}`}>My Mixtapes</button>
                    <button onClick={() => navigateTo('creator')} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentView === 'creator' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-purple-700/50 hover:text-white'}`}>Create New</button>
                    {/* Removed Spotify Connect Button/Indicator from mobile menu */}
                    <div className="pt-2 border-t border-slate-600"><UserMenu handleSignOut={handleSignOut} isMobile /></div>
                </div>
            )}
             {!currentUser && isMobileMenuOpen && currentView !== 'auth' && (
                 <div className="md:hidden mt-3 bg-slate-700/80 rounded-lg p-4">
                    <button onClick={() => navigateTo('auth')} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-purple-600 hover:bg-purple-700 text-white shadow-md">Login</button>
                </div>
            )}
        </header>
    );
};

export default Header;
