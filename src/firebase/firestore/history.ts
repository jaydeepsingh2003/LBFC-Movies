
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

/**
 * Adds a media item to the user's watch history.
 * Explicitly cleans undefined values to prevent FirebaseError.
 */
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
    
    // Construct a clean object without undefined values to avoid "Unsupported field value: undefined"
    const data: any = {
        id: media.id,
        type: media.type,
        title: media.title,
        posterPath: media.posterPath || null,
        lastPlayed: serverTimestamp(),
    };

    // Only add season/episode if they are defined (Movies don't have these)
    if (media.season !== undefined && media.season !== null) data.season = media.season;
    if (media.episode !== undefined && media.episode !== null) data.episode = media.episode;

    try {
        return await setDoc(historyRef, data, { merge: true });
    } catch (error) {
        console.error("Error writing to history:", error);
        throw error;
    }
};
