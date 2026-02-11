
import admin from 'firebase-admin';
import { firebaseConfig } from './config';

// This file should only be imported on the server side.

// Structure to hold the initialized app and services
interface AdminServices {
  app: admin.app.App;
  auth: admin.auth.Auth;
  firestore: admin.firestore.Firestore;
}

// Singleton variable to hold our initialized services
let adminServices: AdminServices | null = null;

// The service account key - loaded from environment variables
function getServiceAccount() {
    try {
        const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountString || serviceAccountString.trim() === '') {
            throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set or is empty. Please check your .env.local file.");
        }
        // It's expected to be a stringified JSON, so we parse it.
        return JSON.parse(serviceAccountString);
    } catch (e: any) {
        // The original error is logged to the server console for detailed debugging.
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string in your .env.local file. Error:", e.message);
        
        // A more user-friendly error is thrown to be displayed in the UI.
        const helpfulError = `Could not initialize Firebase Admin SDK. The 'FIREBASE_SERVICE_ACCOUNT_KEY' in your environment is not a valid JSON string. Please ensure you have copied the entire JSON object from your Firebase project's service account settings. It should start with '{' and end with '}'.`;
        
        throw new Error(helpfulError);
    }
}


/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This is a singleton pattern to prevent re-initialization.
 * This function should only be called in server-side code (e.g., Server Actions, API routes).
 * @returns An object containing the initialized Firebase Admin app and Firestore service.
 */
export function initializeAdminApp(): AdminServices {
  if (adminServices) {
    return adminServices;
  }

  // If no active admin app, create one
  if (!admin.apps.length) {
    const serviceAccount = getServiceAccount();

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: firebaseConfig.projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
    
    const auth = app.auth();
    const firestore = app.firestore();

    adminServices = { app, auth, firestore };
    return adminServices;
  }
  
  // If an app exists but our singleton is not set (e.g., after hot-reload in dev)
  const app = admin.apps[0]!;
  const auth = app.auth();
  const firestore = app.firestore();
  adminServices = { app, auth, firestore };
  return adminServices;
}

