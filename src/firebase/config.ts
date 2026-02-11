// This file reads the client-side Firebase configuration from environment variables.
// These variables are loaded from the .env.local file and must be prefixed
// with NEXT_PUBLIC_ to be exposed to the browser.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Basic validation to ensure environment variables are loaded.
if (!firebaseConfig.projectId) {
  console.error(
    'Firebase config is not loaded. Make sure your .env.local file is set up correctly.'
  );
}
