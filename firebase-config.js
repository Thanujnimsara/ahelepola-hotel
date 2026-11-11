import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// FIREBASE CONFIGURATION OBJECT
export const firebaseConfig = {
  apiKey: "AIzaSyDFQY8Ig8UBW1pwMCi1hXP3fRjYsbe5ugw",
  authDomain: "heritage-ehelepola-hotel.firebaseapp.com",
  projectId: "heritage-ehelepola-hotel",
  storageBucket: "heritage-ehelepola-hotel.firebasestorage.app",
  messagingSenderId: "204335189148",
  appId: "1:204335189148:web:b94b7a4b04c78fac3cf159"
};

// Bypass configuration check so the admin panel loads immediately
export function isFirebaseConfigured() {
  return true;
}

// INITIALIZATION
let app = null;
let auth = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("%c[Firebase]%c Initialized successfully for Heritage Ehelepola Hotel.", "color: #007600; font-weight: bold;", "color: inherit;");
} catch (error) {
  console.error("[Firebase] Initialization error:", error.message);
}

// Attach to window object for global usage
if (typeof window !== "undefined") {
  window.__HERITAGE_FIREBASE__ = {
    app,
    auth,
    db,
    isConfigured: isFirebaseConfigured
  };
  window.__AHELEPOLA_FIREBASE__ = window.__HERITAGE_FIREBASE__;
}

// EXPORTS
export {
  app,
  auth,
  db,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
};
