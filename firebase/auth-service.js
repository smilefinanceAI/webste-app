// firebase/auth-service.js

import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===============================
// GOOGLE PROVIDER
// ===============================

const googleProvider = new GoogleAuthProvider();

// ===============================
// SIGNUP
// ===============================

export async function signupUser(userData) {

  const {
    name,
    email,
    password,
    phone,
    businessName,
    country,
    state,
    city,
    accountType,
    newsletter
  } = userData;

  try {

    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = credential.user;

    await updateProfile(user, {
      displayName: name
    });

    await sendEmailVerification(user);

    await setDoc(doc(db, "users", user.uid), {

      uid: user.uid,

      name,

      email,

      phone,

      businessName,

      country,

      state,

      city,

      accountType,

      newsletter,

      role: accountType,

      status: "active",

      emailVerified: false,

      createdAt: serverTimestamp()

    });

    return {
      success: true,
      message: "Account Created Successfully"
    };

  } catch (error) {

    return {
      success: false,
      message: error.message
    };

  }

}

// ===============================
// LOGIN
// ===============================

export async function loginUser(email, password) {

  try {

    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = credential.user;

    if (!user.emailVerified) {

      return {
        success: false,
        message: "Please verify your email first."
      };

    }

    return {
      success: true,
      user
    };

  } catch (error) {

    return {
      success: false,
      message: error.message
    };

  }

}

// ===============================
// GOOGLE LOGIN
// ===============================

export async function googleLogin() {

  try {

    const result = await signInWithPopup(auth, googleProvider);

    const user = result.user;

    const ref = doc(db, "users", user.uid);

    const snap = await getDoc(ref);

    if (!snap.exists()) {

      await setDoc(ref, {

        uid: user.uid,

        name: user.displayName,

        email: user.email,

        phone: user.phoneNumber || "",

        businessName: "",

        country: "",

        state: "",

        city: "",

        accountType: "customer",

        newsletter: true,

        role: "customer",

        status: "active",

        emailVerified: true,

        createdAt: serverTimestamp()

      });

    }

    return {
      success: true,
      user
    };

  } catch (error) {

    return {
      success: false,
      message: error.message
    };

  }

}

// ===============================
// RESET PASSWORD
// ===============================

export async function forgotPassword(email) {

  try {

    await sendPasswordResetEmail(auth, email);

    return {
      success: true,
      message: "Password reset email sent."
    };

  } catch (error) {

    return {
      success: false,
      message: error.message
    };

  }

}

// ===============================
// LOGOUT
// ===============================

export async function logoutUser() {

  await signOut(auth);

  window.location.href = "login.html";

}

// ===============================
// CURRENT USER
// ===============================

export function currentUser(callback) {

  onAuthStateChanged(auth, (user) => {

    callback(user);

  });

}
