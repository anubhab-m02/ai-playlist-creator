import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    updateProfile
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, // Keep for user profile updates if needed
    serverTimestamp 
} from 'firebase/firestore';
import { createContext, useState, useEffect, useContext } from 'react'; // Removed useCallback as it was for spotify callback

// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};
const globalFirebaseApp = initializeApp(firebaseConfig);
// Attempt to get Firestore instance immediately to catch early init errors
let firestoreDbInstance;
try {
    firestoreDbInstance = getFirestore(globalFirebaseApp);
    console.log("Firestore initialized successfully in firebase.jsx");
} catch (e) {
    console.error("CRITICAL: Firestore initialization failed in firebase.jsx:", e);
    // Potentially set a global error state or alert user
}

export const MIXTAPE_MAESTRO_CUSTOM_APP_ID = "mixtape-maestro-v2"; 

// --- Spotify Configuration --- (Removed as per earlier steps)

// --- PKCE Helper Functions --- (Removed as per earlier steps)

// --- Firebase Context ---
export const FirebaseContext = createContext(null);
export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [db, setDb] = useState(null); // Will be set to firestoreDbInstance
    const [currentUser, setCurrentUser] = useState(null); 
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    
    // Removed Spotify state variables

    useEffect(() => {
        // Use the globally initialized (and error-checked) Firestore instance
        if (firestoreDbInstance) {
            setDb(firestoreDbInstance);
        } else {
            // Handle the case where Firestore failed to initialize (e.g., show app-wide error)
            console.error("FirebaseProvider: Firestore instance is not available.");
        }

        const firebaseAuth = getAuth(globalFirebaseApp);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user && firestoreDbInstance) { // Ensure db is available before Firestore operations
                const userDocRef = doc(firestoreDbInstance, "users", user.uid);
                try {
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setCurrentUser({ uid: user.uid, ...userDocSnap.data() });
                    } else {
                        const authUserDisplayName = user.displayName;
                        const authUserEmail = user.email;
                        const authUserPhotoURL = user.photoURL;
                        let calculatedDisplayName = authUserDisplayName || (authUserEmail ? authUserEmail.split('@')[0] : '') || `User ${user.uid.substring(0, 6)}`;
                        
                        const newUserProfile = {
                            uid: user.uid, email: authUserEmail || null, displayName: calculatedDisplayName,
                            photoURL: authUserPhotoURL || null, createdAt: serverTimestamp(),
                        };
                        await setDoc(userDocRef, newUserProfile);
                        setCurrentUser(newUserProfile);
                    }
                } catch (profileError) {
                    console.error("Error fetching/creating user profile:", profileError);
                    // Potentially sign out the user or show an error if profile is critical
                }
            } else { 
                setCurrentUser(null); 
            }
            setIsLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []); // Dependencies are correct

    const signInWithGoogle = async () => { 
        if (!auth) throw new Error("Firebase Auth not initialized.");
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (error) { console.error("Google Sign-In Error:", error); throw error; }
    };

    const signUpWithEmail = async (email, password, displayName) => { 
        if (!auth) throw new Error("Firebase Auth not initialized.");
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (displayName && displayName.trim() !== "") {
                try { 
                    await updateProfile(userCredential.user, { displayName: displayName.trim() }); 
                } catch (profileError) { 
                    console.warn("Could not update Auth profile displayName:", profileError); 
                }
            }
            return userCredential.user;
        } catch (error) { console.error("Email Sign-Up Error:", error); throw error; }
    };
    
    const signInWithEmail = async (email, password) => { 
        if (!auth) throw new Error("Firebase Auth not initialized.");
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) { console.error("Email Sign-In Error:", error); throw error; }
    };

    const doSignOut = async () => { 
        if (!auth) throw new Error("Firebase Auth not initialized.");
        try {
            await firebaseSignOut(auth);
            setCurrentUser(null); 
        } catch (error) { console.error("Sign-Out Error:", error); throw error; }
    };

    return (
        <FirebaseContext.Provider value={{ 
            auth, db, currentUser, isLoadingAuth, 
            appId: MIXTAPE_MAESTRO_CUSTOM_APP_ID, 
            signInWithGoogle, signUpWithEmail, signInWithEmail, doSignOut
        }}>
            {children}
        </FirebaseContext.Provider>
    );
};