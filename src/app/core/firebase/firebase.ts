import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase.config';

import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

function initFirebase(): FirebaseApp {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

export const firebaseApp: FirebaseApp = initFirebase();
export const db: Firestore = getFirestore(firebaseApp);
export const auth: Auth = getAuth(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);
