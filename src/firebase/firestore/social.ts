'use client';

import { doc, setDoc, deleteDoc, serverTimestamp, type Firestore, writeBatch } from 'firebase/firestore';

export const followUser = async (firestore: Firestore, currentUserId: string, targetUserId: string) => {
    const batch = writeBatch(firestore);
    
    const followingRef = doc(firestore, `users/${currentUserId}/following`, targetUserId);
    batch.set(followingRef, { followedAt: serverTimestamp() });

    const followerRef = doc(firestore, `users/${targetUserId}/followers`, currentUserId);
    batch.set(followerRef, { followedAt: serverTimestamp() });

    return batch.commit();
};

export const unfollowUser = async (firestore: Firestore, currentUserId: string, targetUserId: string) => {
    const batch = writeBatch(firestore);

    const followingRef = doc(firestore, `users/${currentUserId}/following`, targetUserId);
    batch.delete(followingRef);

    const followerRef = doc(firestore, `users/${targetUserId}/followers`, currentUserId);
    batch.delete(followerRef);
    
    return batch.commit();
};
