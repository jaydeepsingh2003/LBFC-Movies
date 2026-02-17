'use client';

import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    type User
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useFirebaseApp } from '@/firebase';
import { doc, setDoc, getFirestore } from 'firebase/firestore';

export function useUser() {
    const app = useFirebaseApp();
    const auth = getAuth(app);
    const [user, loading, error] = useAuthState(auth);

    // Removed automatic setDoc from hook to prevent Firestore quota exhaustion (resource-exhausted).
    // User profile sync now happens only on explicit auth events (login/signup).
    
    return { user, isLoading: loading, error };
}

async function syncUserProfile(user: User) {
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    const displayName = user.displayName || user.email?.split('@')[0];
    await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: user.photoURL,
    }, { merge: true });
}

export const loginWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        if (result.user) {
            await syncUserProfile(result.user);
        }
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
    const auth = getAuth();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await syncUserProfile(userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing up with email and password", error);
        throw error;
    }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
    const auth = getAuth();
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await syncUserProfile(userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in with email and password", error);
        throw error;
    }
};

export const logout = async () => {
    const auth = getAuth();
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};
