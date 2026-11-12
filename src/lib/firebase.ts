import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, collection } from 'firebase/firestore';

// Single Firebase configuration + initialization for the whole app.
// Prefer build-time env vars (.env, git-ignored); fall back to the config
// values that were previously hardcoded in main.tsx (they are public
// client identifiers by design) so a fresh clone builds and runs.
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyABTn_9NGFMXRvBoDQoM25PAtb6UAkXVV',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'budget-section-portal-dbms.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'budget-section-portal-dbms',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'budget-section-portal-dbms.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '789197743276',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:789197743276:web:d01f8f65cd32e92c1aab09',
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // Fail loudly and early instead of every Firestore call failing silently.
  throw new Error(
    'Firebase configuration missing. Set VITE_FIREBASE_* variables in .env ' +
    '(see lib/firebase.ts).'
  );
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export const notesCollection = collection(db, 'notes');
export const worksCollection = collection(db, 'works');
