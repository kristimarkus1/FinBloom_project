// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCI_eM7Bdm_Lx3z4FJ_AO8wgr4MlP17E4c",
    authDomain: "finbloom-4c24b.firebaseapp.com",
    projectId: "finbloom-4c24b",
    storageBucket: "finbloom-4c24b.firebasestorage.app",
    messagingSenderId: "347566089452",
    appId: "1:347566089452:web:70dca2c3f8640c5379b1c9",
    measurementId: "G-K2DSZ5C0HW"
  };

// Initialize Firebase
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Firestore database

export { auth, db };