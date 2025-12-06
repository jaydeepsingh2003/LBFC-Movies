
'use client';

import {
  doc,
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';

export interface WatchParty {
  movieId: number;
  movieTitle: string;
  moviePosterPath: string;
  scheduledAt: Timestamp;
  hostId: string;
  hostDisplayName: string;
  hostPhotoURL: string;
  isPublic: boolean;
}

export interface WatchPartyData {
  movieId: number;
  movieTitle: string;
  moviePosterPath: string;
  scheduledAt: Date;
  hostId: string;
  hostDisplayName: string;
  hostPhotoURL: string;
  isPublic: boolean;
}

export const createWatchParty = async (
  firestore: Firestore,
  partyData: WatchPartyData
) => {
  const watchPartiesRef = collection(firestore, 'watch-parties');
  return addDoc(watchPartiesRef, {
    ...partyData,
    createdAt: serverTimestamp(),
  });
};

export const rsvpToWatchParty = async (
  firestore: Firestore,
  partyId: string,
  user: { uid: string; displayName: string | null; photoURL: string | null }
) => {
    const rsvpRef = doc(firestore, `watch-parties/${partyId}/rsvps`, user.uid);
    return setDoc(rsvpRef, {
        displayName: user.displayName,
        photoURL: user.photoURL,
        timestamp: serverTimestamp(),
    });
}

export const cancelRsvpToWatchParty = async (
    firestore: Firestore,
    partyId: string,
    userId: string
) => {
    const rsvpRef = doc(firestore, `watch-parties/${partyId}/rsvps`, userId);
    return deleteDoc(rsvpRef);
}

export interface ChatMessageData {
    userId: string;
    displayName: string;
    photoURL: string | null;
    text: string;
}

export const sendChatMessage = async (
    firestore: Firestore,
    partyId: string,
    messageData: ChatMessageData
) => {
    const messagesRef = collection(firestore, `watch-parties/${partyId}/messages`);
    return addDoc(messagesRef, {
        ...messageData,
        createdAt: serverTimestamp()
    });
}
