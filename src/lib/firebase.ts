import { initializeApp } from "firebase/app";
import { getFirestore, collection } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const worksCollection = collection(db, 'works');
export const notesCollection = collection(db, 'notes');
export const unitCostCollection = collection(db, 'unitCost');
export const irspWorkCollection = collection(db, 'irspWorks');
export const rspWorkCollection = collection(db, 'rspWorks');
export const reviewCollection = collection(db, 'reviews');
