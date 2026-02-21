
'use client';

import { doc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

export interface HistoryItem {
    id: number | string;
    type: 'movie' | 'tv';
    title: string;
    posterPath: string | null;
    season?: number;
    episode?: number;
    lastPlayed: any;
}

export const addToHistory = async (firestore: Firestore, userId: string, media: {
    id: number | string;
    type: 'movie' | 'tv';
    title: string;
    posterPath: string | null;
    season?: number;
    episode?: number;
}) => {
    if (!userId || !firestore || !media.id) return;
    
    // We use the ID as the document name to ensure unique entries that get updated on re-watch
    const historyRef = doc(firestore, `users/${userId}/history/${media.id}`);
    
    return setDoc(historyRef, {
        ...media,
        lastPlayed: serverTimestamp(),
    }, { merge: true });
};
