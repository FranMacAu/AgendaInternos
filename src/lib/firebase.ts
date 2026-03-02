import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCY8bLoEX7-zzkfhVHC69V-fRe_oO1o9IQ",
  authDomain: "studio-2746222822-e5b7b.firebaseapp.com",
  projectId: "studio-2746222822-e5b7b",
  storageBucket: "studio-2746222822-e5b7b.firebasestorage.app",
  messagingSenderId: "60067907758",
  appId: "1:60067907758:web:c51f5ce562210d2624453f"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };