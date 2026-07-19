// ======================================================
// Smile AI Web Studio
// Firebase Service
// Firebase SDK v12+
// ======================================================

// Firebase Core
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

// Authentication
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

// Firestore
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
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ======================================================
// Firebase Config
// ======================================================

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArcvyvNAOKipPZB0YEfSeoeN9_k-8JznQ",
  authDomain: "smile-business-os.firebaseapp.com",
  projectId: "smile-business-os",
  storageBucket: "smile-business-os.firebasestorage.app",
  messagingSenderId: "114356400630",
  appId: "1:114356400630:web:96fc9d07baaf3a504c17d7",
  measurementId: "G-73WD9V05ZZ"
};


// ======================================================
// Initialize
// ======================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// Remember Me Default

setPersistence(auth,browserLocalPersistence);


// ======================================================
// Export
// ======================================================

export {

app,

auth,

db,

// Auth

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

setPersistence,

browserLocalPersistence,

browserSessionPersistence,

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

serverTimestamp

};
