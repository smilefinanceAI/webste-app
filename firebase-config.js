import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyArcvyvNAOKipPZB0YEfSeoeN9_k-8JznQ",
  authDomain: "smile-business-os.firebaseapp.com",
  projectId: "smile-business-os",
  storageBucket: "smile-business-os.firebasestorage.app",
  messagingSenderId: "114356400630",
  appId: "1:114356400630:web:96fc9d07baaf3a504c17d7",
  measurementId: "G-73WD9V05ZZ"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, db, storage, analytics };
