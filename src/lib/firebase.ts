/// <reference types="vite/client" />

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// ---------------------------------------------------------------------------
// Firebase configuration — all values are sourced from environment variables.
// Copy .env.example to .env.local and fill in your project's credentials.
// ---------------------------------------------------------------------------
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ---------------------------------------------------------------------------
// App — guard against duplicate initialisation during hot-module reloads.
// ---------------------------------------------------------------------------
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

/** Firebase Authentication */
const auth = getAuth(app);

/** Cloud Firestore database */
const db = getFirestore(app);

/** Google Analytics (only initialised in environments that support it) */
const analyticsPromise = isSupported().then((supported) =>
    supported ? getAnalytics(app) : null
);

export { app, auth, db, analyticsPromise };
