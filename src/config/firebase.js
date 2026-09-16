/**
 * Firebase initialization — single source of truth for the Firestore instance.
 * Validates that all required environment variables are present at startup.
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate that critical Firebase config values are present
const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error(
    `[Firebase] Missing required config keys: ${missingKeys.join(", ")}. ` +
    `Make sure environment variables are set (VITE_FIREBASE_*). ` +
    `On Netlify, add them in Site Settings → Environment Variables and redeploy.`
  );
}

/** True if all critical Firebase config values are present */
export const isFirebaseConfigured = missingKeys.length === 0;

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
