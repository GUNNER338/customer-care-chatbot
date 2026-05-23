import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock_key_for_build",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock_domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock_project_id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock_app_id",
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export auth instance
export const auth = getAuth(app);
