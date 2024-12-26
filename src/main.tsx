import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDmOkmg7X_756H98Wzi4doU1FZjhEBZad8',
  authDomain: 'budget-section-portal-dbms.firebaseapp.com',
  projectId: 'budget-section-portal-dbms',
  storageBucket: 'budget-section-portal-dbms.firebasestorage.app',
  messagingSenderId: '789197743276',
  appId: '1:789197743276:web:d01f8f65cd32e92c1aab09',
  measurementId: 'G-17NTYMP3DB',
};

// Initialize Firebase if no app exists
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </React.StrictMode>
);
