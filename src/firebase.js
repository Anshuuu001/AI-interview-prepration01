import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/**
 * CLIENT CONFIGURATION SECURITY NOTE:
 * All variables prefixed with VITE_ are embedded into the client-side JavaScript bundle
 * at build time and are publicly visible in browser network traffic and source inspection.
 * Firebase client API keys are public client identifiers (not backend secrets).
 * Firebase project access control must be enforced through Firebase Security Rules
 * and Google Cloud Console HTTP Referrer Domain Restrictions.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase only if API key is provided
const isConfigured = Boolean(firebaseConfig.apiKey);
const app = isConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : null;

const analytics = typeof window !== 'undefined' && app && firebaseConfig.measurementId
  ? getAnalytics(app)
  : null;

const auth = app ? getAuth(app) : null;
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };
