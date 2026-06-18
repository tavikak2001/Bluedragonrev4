'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigured } from './config';

export function initializeFirebase(): { firebaseApp: FirebaseApp | null; firestore: Firestore | null; auth: Auth | null } {
  try {
    if (!isFirebaseConfigured()) {
      console.error('Firebase Error: API Key is missing or invalid. Please check your .env file or Firebase Console.');
      return { firebaseApp: null, firestore: null, auth: null };
    }

    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    return { firebaseApp, firestore, auth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { firebaseApp: null, firestore: null, auth: null };
  }
}
