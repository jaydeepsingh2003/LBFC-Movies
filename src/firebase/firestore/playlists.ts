'use client';

import { doc, setDoc, deleteDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

interface MovieData {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
}

export const saveMovieToPlaylist = async (firestore: Firestore, userId: string, movie: MovieData) => {
    const playlistRef = doc(firestore, `users/${userId}/savedMovies/${movie.id}`);
    return setDoc(playlistRef, {
        ...movie,
        savedAt: serverTimestamp(),
    });
};

export const removeMovieFromPlaylist = async (firestore: Firestore, userId: string, movieId: number) => {
    const playlistRef = doc(firestore, `users/${userId}/savedMovies/${movieId}`);
    return deleteDoc(playlistRef);
};
