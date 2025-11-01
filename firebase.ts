import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// User-provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCe6L8r6mJKNr7vSwgCiLWhmgWwjEtqToQ",
  authDomain: "sbapp-16b81.firebaseapp.com",
  projectId: "sbapp-16b81",
  storageBucket: "sbapp-16b81.firebasestorage.app",
  messagingSenderId: "211860052111",
  appId: "1:211860052111:web:2da4a0cca0bb7ac49078fa",
  measurementId: "G-SE7N65YSJ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
