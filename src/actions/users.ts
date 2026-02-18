
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

export async function deleteUser(uid: string) {
  if (!uid) {
    return { success: false, error: 'User ID is required.' };
  }

  try {
    const { auth, firestore } = initializeAdminApp();

    // Step 1: Delete user from Firebase Authentication
    // This will prevent the user from being able to log in.
    await auth.deleteUser(uid);

    // Step 2: Delete user's document from Firestore
    await firestore.collection('users').doc(uid).delete();

    // Revalidate the users page to show the updated list
    revalidatePath('/admin/users');

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);

    // Handle case where user might already be deleted from Auth but not Firestore
    if (error.code === 'auth/user-not-found') {
        try {
            const { firestore } = initializeAdminApp();
            await firestore.collection('users').doc(uid).delete();
            revalidatePath('/admin/users');
            return { success: true, message: 'User not found in Auth, but Firestore document was cleaned up.' };
        } catch (fsError: any) {
             return { success: false, error: fsError.message || 'An unexpected error occurred during Firestore cleanup.' };
        }
    }

    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}
