
'use client';

import { doc, setDoc, deleteDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

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
    
    const historyRef = doc(firestore, `users/${userId}/history/${media.id}`);
    
    // Construct clean data to avoid "Unsupported field value: undefined"
    const data: any = {
        id: media.id,
        type: media.type,
        title: media.title,
        posterPath: media.posterPath || null,
        lastPlayed: serverTimestamp(),
    };

    if (media.season !== undefined && media.season !== null) data.season = media.season;
    if (media.episode !== undefined && media.episode !== null) data.episode = media.episode;

    try {
        return await setDoc(historyRef, data, { merge: true });
    } catch (error) {
        console.error("Error writing to history:", error);
        throw error;
    }
};

/**
 * Removes a specific item from the user's watch history.
 */
export const deleteFromHistory = async (firestore: Firestore, userId: string, mediaId: string | number) => {
    if (!userId || !firestore || !mediaId) return;
    const historyRef = doc(firestore, `users/${userId}/history/${mediaId}`);
    try {
        await deleteDoc(historyRef);
    } catch (error) {
        console.error("Error deleting from history:", error);
        throw error;
    }
};
