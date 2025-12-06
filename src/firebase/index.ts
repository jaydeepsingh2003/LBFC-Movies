
'use client';
// src/firebase/index.ts
import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

import firebaseConfig from './config';

export function initializeFirebase() {
    let app: FirebaseApp;
    let auth: Auth;
    let firestore: Firestore;
  
    const apps = getApps();
    app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);

    return { app, auth, firestore };
}

export * from './provider';
export * from './auth/auth-client';
export * from './firestore/playlists';
