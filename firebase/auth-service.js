// ======================================================
// Smile AI Web Studio
// firebase/auth-service.js
// Part 01
// ======================================================

import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// ======================================================
// Google Provider
// ======================================================

const googleProvider = new GoogleAuthProvider();

// ======================================================
// Current User
// ======================================================

export function getCurrentUser(callback) {

    onAuthStateChanged(auth, (user) => {

        callback(user);

    });

}

// ======================================================
// Signup Function
// ======================================================

export async function signup(data) {

    try {

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );

        const user = credential.user;

        await updateProfile(user, {

            displayName: data.name

        });

        await sendEmailVerification(user);

        await setDoc(doc(db, "users", user.uid), {

            uid: user.uid,

            name: data.name,

            email: data.email,

            phone: data.phone,

            businessName: data.businessName || "",

            country: data.country || "",

            state: data.state || "",

            city: data.city || "",

            accountType: data.accountType,

            newsletter: data.newsletter,

            role: data.accountType,

            status: "active",

            emailVerified: false,

            createdAt: serverTimestamp()

        });

        return {

            success: true,

            message: "Account Created Successfully"

        };

    }

    catch (error) {

        return {

            success: false,

            code: error.code,

            message: error.message

        };

    }

}

// ======================================================
// Login Function
// ======================================================

export async function login(email, password) {

    try {

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = credential.user;

        if (!user.emailVerified) {

            return {

                success: false,

                message: "Please verify your email."

            };

        }

        return {

            success: true,

            user

        };

    }

    catch (error) {

        return {

            success: false,

            code: error.code,

            message: error.message

        };

    }

}

// ======================================================
// Google Login
// ======================================================

export async function googleLogin() {

    try {

        const result =
            await signInWithPopup(auth, googleProvider);

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

                role: "customer",

                newsletter: true,

                status: "active",

                emailVerified: true,

                createdAt: serverTimestamp()

            });

        }

        return {

            success: true,

            user

        };

    }

    catch (error) {

        return {

            success: false,

            code: error.code,

            message: error.message

        };

    }

}
