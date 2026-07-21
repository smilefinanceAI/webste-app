// ============================================================
// Smile AI Web Studio
// Firebase Service Layer
// Firebase JS SDK v12+
// ============================================================

// ==============================
// Firebase App
// ==============================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";


// ==============================
// Firebase Auth
// ==============================

import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,

    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,

    GoogleAuthProvider,
    FacebookAuthProvider,
    GithubAuthProvider,
    OAuthProvider,

    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


// ==============================
// Firebase Firestore
// ==============================

import {
    getFirestore,

    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,

    collection,
    getDocs,

    query,
    where,
    orderBy,
    limit,

    addDoc,

    serverTimestamp,

    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==============================
// Firebase Config
// ==============================

import {
    firebaseConfig
} from "./firebase-config.js";


// ==============================
// Initialize Firebase
// ==============================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ==============================
// Default Persistence
// ==============================

const setDefaultPersistence = async () => {

    try {

        await setPersistence(
            auth,
            browserLocalPersistence
        );

    } catch (error) {

        console.error(
            "Firebase persistence error:",
            error
        );

    }

};


// Start default persistence

setDefaultPersistence();


// ============================================================
// EXPORT
// ============================================================

export {

    // Firebase Core

    app,

    auth,

    db,


    // Auth

    getAuth,

    setPersistence,

    browserLocalPersistence,

    browserSessionPersistence,

    createUserWithEmailAndPassword,

    signInWithEmailAndPassword,

    signInWithPopup,

    GoogleAuthProvider,

    FacebookAuthProvider,

    GithubAuthProvider,

    OAuthProvider,

    sendPasswordResetEmail,

    onAuthStateChanged,

    signOut,

    updateProfile,


    // Firestore

    doc,

    setDoc,

    getDoc,

    updateDoc,

    deleteDoc,

    collection,

    getDocs,

    query,

    where,

    orderBy,

    limit,

    addDoc,

    serverTimestamp,

    onSnapshot

};
