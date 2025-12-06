
'use client';

import {
  doc,
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';

export interface UserTvShowReview {
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

export const addTvShowReview = async (
  firestore: Firestore,
  showId: number,
  reviewData: ReviewData
) => {
  const reviewsCollectionRef = collection(firestore, `tv-shows/${showId}/reviews`);
  return addDoc(reviewsCollectionRef, {
    ...reviewData,
    createdAt: serverTimestamp(),
  });
};

export const deleteTvShowReview = async (
    firestore: Firestore,
    showId: number,
    reviewId: string
) => {
    const reviewDocRef = doc(firestore, `tv-shows/${showId}/reviews/${reviewId}`);
    return await deleteDoc(reviewDocRef);
}

    