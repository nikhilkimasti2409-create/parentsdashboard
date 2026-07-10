import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAHJte4EBZDE22L6RpDqn3qm3DUrY5Tkss",
  projectId: "my-dashboard-e2eb5",
  authDomain: "my-dashboard-e2eb5.firebaseapp.com"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
