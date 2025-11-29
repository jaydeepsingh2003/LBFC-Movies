// src/firebase/client-provider.tsx
'use client';

import { ReactNode, useMemo } from 'react';
import { FirebaseProvider } from '.';
import { getApp, getApps, initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from './config';

// Note: This pattern is useful for reducing the initial server page size.
// We're ensuring that Firebase is only initialized on the client.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseApp = useMemo(() => {
    let app: FirebaseApp;
    let auth: Auth;
    let firestore: Firestore;

    const apps = getApps();
    app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);

    return { app, auth, firestore };
  }, []);

  return <FirebaseProvider
    firebaseApp={firebaseApp.app}
    auth={firebaseApp.auth}
    firestore={firebaseApp.firestore}
  >{children}</FirebaseProvider>;
}
