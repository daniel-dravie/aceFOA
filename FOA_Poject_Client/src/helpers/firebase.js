import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBmFrnBLk14b8611VvzCughwQ9OA7wH_Uw",
  authDomain: "foodorderingapp-413a8.firebaseapp.com",
  projectId: "foodorderingapp-413a8",
  storageBucket: "foodorderingapp-413a8.appspot.com",
  messagingSenderId: "445136096506",
  appId: "1:445136096506:web:c6e4b04b6a7d88fa070d43",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth();
export const storage = getStorage(app);