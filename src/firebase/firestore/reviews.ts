
'use client';

import {
  doc,
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';

export interface UserReview {
  userId: string;
  displayName: string;
  photoURL: string;
  content: string;
  rating: number;
  createdAt: Timestamp;
}

export interface ReviewData {
  userId: string;
  displayName: string;
  photoURL: string;
  content: string;
  rating: number;
}

export const addMovieReview = async (
  firestore: Firestore,
  movieId: number,
  reviewData: ReviewData
) => {
  const reviewsCollectionRef = collection(firestore, `movies/${movieId}/reviews`);
  return addDoc(reviewsCollectionRef, {
    ...reviewData,
    createdAt: serverTimestamp(),
  });
};

export const deleteMovieReview = async (
    firestore: Firestore,
    movieId: number,
    reviewId: string
) => {
    const reviewDocRef = doc(firestore, `movies/${movieId}/reviews/${reviewId}`);
    return await deleteDoc(reviewDocRef);
}
