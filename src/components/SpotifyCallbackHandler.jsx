import React, { useEffect, useState } from 'react';
import { useFirebase } from '../firebase'; // Corrected import path
import { Loader2 } from 'lucide-react';

const SpotifyCallbackHandler = ({ onCallbackProcessed }) => {
    const { handleSpotifyCallback } = useFirebase();
    const [message, setMessage] = useState("Processing Spotify login...");

    useEffect(() => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const error = params.get("error");
        let processed = false;

        const processToken = async () => {
            if (error) {
                setMessage(`Error from Spotify: ${error}. Redirecting...`);
                console.error("Spotify Auth Error:", error);
            } else if (accessToken) {
                setMessage("Spotify connection successful! Processing...");
                await handleSpotifyCallback(accessToken); // Ensure this promise resolves
                setMessage("Processed! Redirecting...");
            } else {
                setMessage("Invalid Spotify callback. Redirecting...");
            }
            processed = true;
            if (onCallbackProcessed) {
                onCallbackProcessed();
            } else {
                // Fallback if onCallbackProcessed is not provided (though App.jsx should handle view change)
                setTimeout(() => { window.location.href = "/"; }, 1000);
            }
        };

        processToken();
        
        // Clean up URL hash
        if (window.history.replaceState) {
            window.history.replaceState(null, '', window.location.pathname);
        } else {
            window.location.hash = ''; // Fallback for older browsers
        }

    }, [handleSpotifyCallback, onCallbackProcessed]);

    return (
        <div className="flex flex-col items-center justify-center flex-grow">
            <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
            <p className="mt-4 text-lg text-gray-300">{message}</p>
        </div>
    );
};

export default SpotifyCallbackHandler;
