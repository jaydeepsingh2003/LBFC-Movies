'use client';

import { useEffect } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
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
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
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

export const logout = async () => {
    const auth = getAuth();
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};
