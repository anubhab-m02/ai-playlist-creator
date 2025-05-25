import React, { useState } from 'react';
import { useFirebase } from '../firebase'; // Corrected import path
import Alert from './Alert';
import { Loader2, User, Mail, Lock } from 'lucide-react';

const AuthPage = ({ onAuthSuccess }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useFirebase();

    const handleGoogleSignIn = async () => {
        setLoading(true); setError('');
        try {
            await signInWithGoogle();
            if (onAuthSuccess) onAuthSuccess(); // Call onAuthSuccess after successful sign-in
        } catch (err) {
            setError(err.message || "Failed to sign in with Google.");
        } finally { setLoading(false); }
    };

    const handleEmailPasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            if (isSignUp) {
                if (!displayName.trim()) throw new Error("Display name is required for sign up.");
                await signUpWithEmail(email, password, displayName);
            } else {
                await signInWithEmail(email, password);
            }
            if (onAuthSuccess) onAuthSuccess(); // Call onAuthSuccess after successful action
        } catch (err) {
            const authErrorMessages = {
                "auth/email-already-in-use": "This email address is already in use.",
                "auth/invalid-email": "Please enter a valid email address.",
                "auth/weak-password": "Password should be at least 6 characters.",
                "auth/user-not-found": "No account found with this email.",
                "auth/wrong-password": "Incorrect password. Please try again.",
                "auth/invalid-credential": "Invalid email or password."
            };
            setError(err.code ? (authErrorMessages[err.code] || `Error: ${err.code}`) : err.message);
        } finally { setLoading(false); }
    };
    
    return (
        <div className="flex items-center justify-center py-12 flex-grow">
            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6">
                <h2 className="text-3xl font-bold text-center text-purple-400">{isSignUp ? 'Create Account' : 'Welcome Back!'}</h2>
                {error && <Alert type="error">{error}</Alert>}
                
                <form onSubmit={handleEmailPasswordSubmit} className="space-y-5">
                    {isSignUp && (
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
                                <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full p-3 pl-10 bg-slate-700 border border-slate-600 rounded-md focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500" placeholder="Your Name"/>
                            </div>
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 pl-10 bg-slate-700 border border-slate-600 rounded-md focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500" placeholder="you@example.com"/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18}/>
                            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 pl-10 bg-slate-700 border border-slate-600 rounded-md focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500" placeholder="••••••••"/>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full p-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-colors disabled:opacity-70 flex items-center justify-center shadow-md">
                        {loading && <Loader2 className="animate-spin mr-2" size={20}/>}
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-600" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-800 text-gray-400">Or continue with</span></div>
                </div>

                <button onClick={handleGoogleSignIn} disabled={loading} className="w-full p-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-md transition-colors border border-slate-500 disabled:opacity-70 flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M21.818 10.693c0-.655-.055-1.291-.173-1.909H12v3.6h5.545c-.255 1.173-.982 2.155-2.118 2.845v2.336h3.009c1.755-1.609 2.755-3.927 2.755-6.573z"/><path d="M12 22c2.927 0 5.364-.964 7.155-2.609l-3.009-2.336c-.973.655-2.209 1.045-3.745 1.045-2.882 0-5.318-1.936-6.191-4.545H2.755v2.4C4.555 19.591 8.018 22 12 22z"/><path d="M5.809 13.545c-.2-.6-.318-1.236-.318-1.891s.118-1.291.318-1.891V7.355H2.755C2.273 8.464 2 9.691 2 11s.273 2.536.755 3.645l3.054-2.4z"/><path d="M12 5.255c1.582 0 2.991.545 4.109 1.609l2.655-2.655C16.918 2.273 14.727 1 12 1 8.018 1 4.555 3.409 2.755 6.645l3.054 2.4C6.682 7.191 9.118 5.255 12 5.255z"/></svg>
                    Sign In with Google
                </button>

                <p className="text-sm text-center text-gray-400">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button onClick={() => {setIsSignUp(!isSignUp); setError('');}} className="font-medium text-purple-400 hover:text-purple-300 ml-1">
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
