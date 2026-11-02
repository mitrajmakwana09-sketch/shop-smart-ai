
/* ==========================================
   SHOP SMART AI - FIREBASE CONFIGURATION
========================================== */

// Import Firebase SDK
import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { getStorage } from
    "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",

    projectId: "YOUR_PROJECT_ID",

    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",

    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

    appId: "YOUR_APP_ID"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Firestore Database
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Export Firebase Services
export {
    app,
    auth,
    db,
    storage
};
