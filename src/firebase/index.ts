// src/firebase/index.ts
import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

import firebaseConfig from './config';

// Note: This is a frontend-only file.
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    // During server-side rendering, we can return null or mock instances.
    // However, since we use FirebaseClientProvider, this won't be called on the server.
    throw new Error("Firebase should only be initialized on the client.");
  }
  
  const apps = getApps();
  app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  firestore = getFirestore(app);

  return { app, auth, firestore };
}

export * from './provider';
export * from './auth/auth-client';
export * from './firestore/playlists';
