/**
 * ============================================================================
 * Heritage Ehelepola Hotel - Firebase Configuration & Initialization
 * SDK Version: Firebase v10+ (Modular ESM via Official Google CDN)
 * Deployment: GitHub Pages / Static Web Compatible (No build step required)
 * ============================================================================
 * 
 * Instructions:
 * 1. Go to Firebase Console (https://console.firebase.google.com/).
 * 2. Create a new project or select an existing one (e.g. "ahelepola-hotel").
 * 3. In Project Settings -> General -> Your apps -> Web app (</>), copy your
 *    credentials and replace the placeholder values below.
 * 4. Enable Authentication -> Sign-in method -> Email/Password.
 * 5. Enable Firestore Database (start in Test mode or configure security rules).
 */

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
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ============================================================================
// 1. FIREBASE CONFIGURATION OBJECT
// Replace these with your actual Firebase Project Configuration keys:
// ============================================================================
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "ahelepola-hotel.firebaseapp.com",
  projectId: "ahelepola-hotel",
  storageBucket: "ahelepola-hotel.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/**
 * Checks whether valid Firebase credentials have been configured
 * @returns {boolean} True if keys are customized, false if still default placeholder
 */
export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  );
}

// ============================================================================
// 2. INITIALIZE FIREBASE APP & SERVICES
// ============================================================================
let app = null;
let auth = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("%c[Firebase v10+]%c Initialized successfully for Heritage Ehelepola Hotel.", "color: #d5b287; font-weight: bold;", "color: inherit;");
} catch (error) {
  console.warn("[Firebase Initialization Warning]:", error.message);
}

// Attach to window object for convenient debugging and cross-script access
if (typeof window !== "undefined") {
  window.__AHELEPOLA_FIREBASE__ = {
    app,
    auth,
    db,
    isConfigured: isFirebaseConfigured
  };
}

// ============================================================================
// 3. EXPORTS
// ============================================================================
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
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
};
