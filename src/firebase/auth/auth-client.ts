
'use client';

import { useEffect } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const db = getFirestore(app);
                const userRef = doc(db, 'users', user.uid);
                // For new email/password sign-ups, displayName might be null initially
                const displayName = user.displayName || user.email?.split('@')[0];
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: displayName,
                    photoURL: user.photoURL,
                }, { merge: true });
            }
        });
        return () => unsubscribe();
    }, [auth, app]);

    return { user, isLoading: loading, error };
}

export const loginWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
    const auth = getAuth();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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
