import { auth } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getIdToken as getFirebaseIdToken,
} from 'firebase/auth';

export const signup = async (email, password, fullName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get the ID token
    const token = await getFirebaseIdToken(user);
    
    // Call the backend endpoint to register the user
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ fullName })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to register with backend');
    }

    return { user, token };
  } catch (error) {
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get the ID token
    const token = await getFirebaseIdToken(user);
    
    return { user, token };
  } catch (error) {
    throw error;
  }
};

export const getIdToken = async () => {
  if (auth.currentUser) {
    return await getFirebaseIdToken(auth.currentUser);
  }
  return null;
};
