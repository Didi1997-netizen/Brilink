import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- GANTI KONFIGURASI INI DENGAN MILIK ANDA DARI FIREBASE CONSOLE ---
const firebaseConfig = {
  apiKey: "ISI_API_KEY_ANDA_DISINI",
  authDomain: "project-id-anda.firebaseapp.com",
  projectId: "project-id-anda",
  storageBucket: "project-id-anda.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase (Singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };