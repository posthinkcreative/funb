
'use server';

import { revalidatePath } from 'next/cache';
import { initializeAdminApp } from '@/firebase/admin';

// This function can only be executed on the server.
export async function updateUserRole(uid: string, newRole: 'admin' | 'customer') {
  if (!uid) {
    return { success: false, error: 'User ID is required.' };
  }
  
  if (!['admin', 'customer'].includes(newRole)) {
     return { success: false, error: 'Invalid role specified.' };
  }

  try {
    // Initialize the Firebase Admin SDK to get services with admin privileges
    const { firestore, auth } = initializeAdminApp();
    
    // Step 1: Update the user's role in the Firestore document.
    const userRef = firestore.collection('users').doc(uid);
    await userRef.update({ role: newRole });

    // Step 2: Set the custom claim. This is the "admin stamp" on the user's ID card.
    await auth.setCustomUserClaims(uid, { role: newRole });

    // Revalidate paths to ensure UI updates with the new data
    revalidatePath('/admin/users');
    revalidatePath(`/`); 

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user role and claims:", error);
    // Provide a more specific error message if setting the claim fails
    if (error.code === 'auth/internal-error' || error.message.includes('permission')) {
        return { success: false, error: `Failed to set custom claim. Please verify your FIREBASE_SERVICE_ACCOUNT_KEY in .env.local and check its IAM permissions in Google Cloud. Details: ${error.message}` };
    }
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}

