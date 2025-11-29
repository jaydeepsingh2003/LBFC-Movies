// src/firebase/client-provider.tsx
'use client';

import { ReactNode, useMemo } from 'react';
import { FirebaseProvider, initializeFirebase } from '.';

// Note: This pattern is useful for reducing the initial server page size.
// We're ensuring that Firebase is only initialized on the client.
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebaseApp = useMemo(() => initializeFirebase(), []);

  return <FirebaseProvider
    firebaseApp={firebaseApp.app}
    auth={firebaseApp.auth}
    firestore={firebaseApp.firestore}
  >{children}</FirebaseProvider>;
}