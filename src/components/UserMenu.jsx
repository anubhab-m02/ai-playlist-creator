import React from 'react';
import { useFirebase } from '../firebase'; // Corrected import path
import { User, LogOut } from 'lucide-react';

const UserMenu = ({ handleSignOut, isMobile }) => {
    const { currentUser } = useFirebase();

    if (!currentUser) return null; // Don't render if no user

    return (
        <div className={isMobile ? "text-left w-full" : "relative"}>
            <div className={`flex items-center ${isMobile ? "py-2 justify-between" : ""}`}>
                <div className="flex items-center">
                    {currentUser.photoURL ? 
                        <img src={currentUser.photoURL} alt="User" className="h-8 w-8 rounded-full mr-2" onError={(e) => e.target.style.display='none'}/> : // Hide if image fails to load
                        <User className="h-8 w-8 rounded-full p-1 bg-slate-600 text-purple-300 mr-2 flex-shrink-0" />
                    }
                    <span className={`text-sm truncate ${isMobile ? "text-gray-200" : "text-gray-300"}`}>{currentUser.displayName || currentUser.email}</span>
                </div>
                <button 
                    onClick={handleSignOut} 
                    className={`
                        ${isMobile ? "w-auto text-left ml-4" : "mt-2"} 
                        px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white 
                        flex items-center transition-colors duration-150 ease-in-out
                    `}
                >
                    <LogOut size={16} className="mr-0 sm:mr-2"/> 
                    <span className={isMobile ? "hidden sm:inline" : "inline"}>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default UserMenu;
