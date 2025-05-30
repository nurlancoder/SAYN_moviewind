import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Demo Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "demo-api-key-replace-with-your-own",
  authDomain: "sayn-movie-app.firebaseapp.com",
  projectId: "sayn-movie-app",
  storageBucket: "sayn-movie-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;