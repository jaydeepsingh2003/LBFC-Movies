
'use client';

import { doc, setDoc, getDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

export const setMovieRating = async (firestore: Firestore, userId: string, movieId: number, rating: number) => {
    const ratingRef = doc(firestore, `users/${userId}/ratings/${movieId}`);
    return setDoc(ratingRef, {
        rating: rating,
        ratedAt: serverTimestamp(),
    });
};

export const getMovieRating = async (firestore: Firestore, userId: string, movieId: number): Promise<number | null> => {
    const ratingRef = doc(firestore, `users/${userId}/ratings/${movieId}`);
    const docSnap = await getDoc(ratingRef);
    if (docSnap.exists()) {
        return docSnap.data().rating as number;
    }
    return null;
};
