'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// A memoized object to hold the initialized Firebase services.
// This is defined outside the component to ensure it's a true singleton
// across the entire client-side application lifecycle.
const firebaseServices = initializeFirebase();

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // The firebaseServices object is now stable and won't be re-created on re-renders,
  // preventing the re-initialization issue.
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      storage={firebaseServices.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
