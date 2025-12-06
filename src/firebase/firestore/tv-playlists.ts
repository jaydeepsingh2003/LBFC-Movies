
'use client';

import { doc, setDoc, deleteDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

interface TvShowData {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
}

export const saveTvShowToPlaylist = async (firestore: Firestore, userId: string, show: TvShowData) => {
    const playlistRef = doc(firestore, `users/${userId}/savedTvShows/${show.id}`);
    return setDoc(playlistRef, {
        ...show,
        savedAt: serverTimestamp(),
    });
};

export const removeTvShowFromPlaylist = async (firestore: Firestore, userId: string, showId: number) => {
    const playlistRef = doc(firestore, `users/${userId}/savedTvShows/${showId}`);
    return deleteDoc(playlistRef);
};
