'use client';

import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail,
    type User
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useFirebaseApp } from '@/firebase';
import { doc, setDoc, getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateLoginAlertEmail } from '@/ai/flows/generate-login-alert-email';

export function useUser() {
    const app = useFirebaseApp();
    const auth = getAuth(app);
    const [user, loading, error] = useAuthState(auth);

    return { user, isLoading: loading, error };
}

export async function syncUserProfile(user: User) {
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    const displayName = user.displayName || user.email?.split('@')[0] || 'Enthusiast';
    
    await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
    }, { merge: true });

    try {
        const emailContent = await generateLoginAlertEmail({
            displayName,
            email: user.email || '',
            timestamp: new Date().toLocaleString(),
        });

        const alertRef = collection(db, `users/${user.uid}/loginAlerts`);
        await addDoc(alertRef, {
            to: user.email,
            message: {
                subject: emailContent.subject,
                text: emailContent.text,
                html: emailContent.html,
            },
            createdAt: serverTimestamp(),
            userId: user.uid,
            status: 'pending'
        });
    } catch (error) {
        console.error("Login notification failed:", error);
    }
}

export async function updateUserProfile(user: User, data: { displayName?: string, photoURL?: string }) {
    const db = getFirestore();
    const userRef = doc(db, 'users', user.uid);
    
    await updateProfile(user, {
        displayName: data.displayName,
        photoURL: data.photoURL
    });
    
    await setDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
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
        throw error;
    }
};

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
    const auth = getAuth();
    auth.useDeviceLanguage();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        await syncUserProfile(userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing up", error);
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
        console.error("Error signing in", error);
        throw error;
    }
};

export const resetPassword = async (email: string) => {
    const auth = getAuth();
    auth.useDeviceLanguage();
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error("Error sending reset email", error);
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
