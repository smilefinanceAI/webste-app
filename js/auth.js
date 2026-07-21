// ============================================================
// Smile AI Web Studio
// auth.js
// FINAL AUTHENTICATION SYSTEM
// ============================================================

import {
    auth,
    db,

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

    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "./firebase-service.js";


// ============================================================
// CONFIGURATION
// ============================================================

const CUSTOMER_DASHBOARD = "customer-dashboard.html";
const ADMIN_DASHBOARD = "admin-dashboard.html";
const LOGIN_PAGE = "login.html";


// ============================================================
// DOM ELEMENTS
// ============================================================

// Login
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const loginMessage = document.getElementById("loginMessage");

// Signup
const signupForm = document.getElementById("signupForm");

const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPhone = document.getElementById("signupPhone");

const businessName = document.getElementById("businessName");
const businessType = document.getElementById("businessType");
const websiteGoal = document.getElementById("websiteGoal");

const signupPassword = document.getElementById("signupPassword");
const confirmPassword = document.getElementById("confirmPassword");

const referralCode = document.getElementById("referralCode");
const acceptTerms = document.getElementById("acceptTerms");

const signupBtn = document.getElementById("signupBtn");
const signupMessage = document.getElementById("signupMessage");

// Google
const googleLogin = document.getElementById("googleLogin");
const googleSignup = document.getElementById("googleSignup");

// Facebook
const facebookLogin = document.getElementById("facebookLogin");
const facebookSignup = document.getElementById("facebookSignup");

// GitHub
const githubLogin = document.getElementById("githubLogin");
const githubSignup = document.getElementById("githubSignup");

// Microsoft
const microsoftLogin = document.getElementById("microsoftLogin");
const microsoftSignup = document.getElementById("microsoftSignup");


// ============================================================
// FIREBASE PROVIDERS
// ============================================================

const googleProvider = new GoogleAuthProvider();

// IMPORTANT:
// Always show Google account selection
googleProvider.setCustomParameters({
    prompt: "select_account"
});


const facebookProvider = new FacebookAuthProvider();

const githubProvider = new GithubAuthProvider();

const microsoftProvider = new OAuthProvider(
    "microsoft.com"
);


// ============================================================
// UI HELPERS
// ============================================================

function showMessage(element, message, type = "error") {

    if (!element) return;

    element.textContent = message;

    element.classList.remove(
        "success",
        "error"
    );

    element.classList.add(type);
}


function clearMessage(element) {

    if (!element) return;

    element.textContent = "";

    element.classList.remove(
        "success",
        "error"
    );
}


function setLoading(button, status) {

    if (!button) return;

    if (status) {

        button.disabled = true;

        if (!button.dataset.originalText) {

            button.dataset.originalText =
                button.innerHTML;

        }

        button.innerHTML =
            "Please Wait...";

    } else {

        button.disabled = false;

        if (button.dataset.originalText) {

            button.innerHTML =
                button.dataset.originalText;

        }

    }
}


// ============================================================
// VALIDATION
// ============================================================

function validateEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


function validatePassword(password) {

    return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );

}


// ============================================================
// FIREBASE ERROR HANDLER
// ============================================================

function firebaseError(error) {

    console.error(
        "Firebase Auth Error:",
        error
    );

    switch (error.code) {

        case "auth/user-not-found":
            return "Account not found.";

        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Email or password is incorrect.";

        case "auth/email-already-in-use":
            return "This email is already registered.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Password is too weak.";

        case "auth/network-request-failed":
            return "Internet connection problem.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/popup-closed-by-user":
            return "Login cancelled.";

        case "auth/popup-blocked":
            return "Please allow popups for this website.";

        case "auth/operation-not-allowed":
            return "This login method is not enabled in Firebase.";

        case "auth/account-exists-with-different-credential":
            return "This email is already registered with another login method.";

        default:
            return error.message ||
                "Authentication failed.";
    }

}


// ============================================================
// CREATE / UPDATE FIRESTORE USER
// ============================================================

async function createOrUpdateUser(
    user,
    providerName = "email",
    extraData = {}
) {

    if (!user) {
        throw new Error(
            "Firebase user not found."
        );
    }


    const userRef = doc(
        db,
        "users",
        user.uid
    );


    const userSnapshot =
        await getDoc(userRef);


    if (!userSnapshot.exists()) {

        await setDoc(
            userRef,
            {

                uid: user.uid,

                name:
                    extraData.name ||
                    user.displayName ||
                    "",

                email:
                    user.email ||
                    "",

                phone:
                    extraData.phone ||
                    user.phoneNumber ||
                    "",

                businessName:
                    extraData.businessName ||
                    "",

                businessType:
                    extraData.businessType ||
                    "",

                websiteGoal:
                    extraData.websiteGoal ||
                    "",

                referralCode:
                    extraData.referralCode ||
                    "",

                photoURL:
                    user.photoURL ||
                    "",

                role:
                    "customer",

                provider:
                    providerName,

                status:
                    "active",

                createdAt:
                    serverTimestamp(),

                lastLogin:
                    serverTimestamp()

            }
        );

    } else {

        await updateDoc(
            userRef,
            {

                email:
                    user.email ||
                    "",

                photoURL:
                    user.photoURL ||
                    "",

                provider:
                    providerName,

                lastLogin:
                    serverTimestamp(),

                status:
                    "active"

            }
        );

    }

}


// ============================================================
// GET USER ROLE
// ============================================================

async function getUserRole(user) {

    try {

        const userRef = doc(
            db,
            "users",
            user.uid
        );

        const snapshot =
            await getDoc(userRef);


        if (!snapshot.exists()) {

            return "customer";

        }


        const data =
            snapshot.data();


        return data.role ||
            "customer";

    }

    catch (error) {

        console.error(
            "Role Error:",
            error
        );

        return "customer";

    }

}


// ============================================================
// REDIRECT AFTER SUCCESSFUL LOGIN
// ============================================================

async function redirectAfterLogin(user) {

    if (!user) {

        window.location.replace(
            LOGIN_PAGE
        );

        return;

    }


    try {

        const role =
            await getUserRole(user);


        if (role === "admin") {

            window.location.replace(
                ADMIN_DASHBOARD
            );

        } else {

            window.location.replace(
                CUSTOMER_DASHBOARD
            );

        }

    }

    catch (error) {

        console.error(
            "Redirect Error:",
            error
        );

        window.location.replace(
            CUSTOMER_DASHBOARD
        );

    }

}


// ============================================================
// EMAIL LOGIN
// ============================================================

async function loginWithEmail(
    email,
    password
) {

    try {

        setLoading(
            loginBtn,
            true
        );

        clearMessage(
            loginMessage
        );


        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            credential.user;


        await createOrUpdateUser(
            user,
            "email"
        );


        showMessage(
            loginMessage,
            "Login successful.",
            "success"
        );


        await redirectAfterLogin(
            user
        );


        return user;

    }

    catch (error) {

        showMessage(
            loginMessage,
            firebaseError(error),
            "error"
        );

        return null;

    }

    finally {

        setLoading(
            loginBtn,
            false
        );

    }

}


// ============================================================
// EMAIL SIGNUP
// ============================================================

async function signupWithEmail(data) {

    try {

        setLoading(
            signupBtn,
            true
        );

        clearMessage(
            signupMessage
        );


        const credential =
            await createUserWithEmailAndPassword(
                auth,
                data.email,
                data.password
            );


        const user =
            credential.user;


        await createOrUpdateUser(
            user,
            "email",
            data
        );


        showMessage(
            signupMessage,
            "Account created successfully.",
            "success"
        );


        await redirectAfterLogin(
            user
        );


        return user;

    }

    catch (error) {

        showMessage(
            signupMessage,
            firebaseError(error),
            "error"
        );

        return null;

    }

    finally {

        setLoading(
            signupBtn,
            false
        );

    }

}


// ============================================================
// GOOGLE / SOCIAL LOGIN
// ============================================================

async function socialLogin(
    provider,
    providerName,
    messageElement
) {

    try {

        if (messageElement) {

            clearMessage(
                messageElement
            );

        }


        const result =
            await signInWithPopup(
                auth,
                provider
            );


        const user =
            result.user;


        await createOrUpdateUser(
            user,
            providerName
        );


        if (messageElement) {

            showMessage(
                messageElement,
                "Login successful.",
                "success"
            );

        }


        await redirectAfterLogin(
            user
        );


        return user;

    }

    catch (error) {

        console.error(
            "Social Login Error:",
            error
        );


        if (messageElement) {

            showMessage(
                messageElement,
                firebaseError(error),
                "error"
            );

        }

        return null;

    }

}


// ============================================================
// LOGIN FORM
// ============================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                loginEmail?.value
                    ?.trim() ||
                "";


            const password =
                loginPassword?.value ||
                "";


            if (!validateEmail(email)) {

                showMessage(
                    loginMessage,
                    "Enter a valid email address."
                );

                return;

            }


            if (!password) {

                showMessage(
                    loginMessage,
                    "Enter your password."
                );

                return;

            }


            await loginWithEmail(
                email,
                password
            );

        }
    );

}


// ============================================================
// SIGNUP FORM
// ============================================================

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const data = {

                name:
                    signupName?.value
                        ?.trim() ||
                    "",

                email:
                    signupEmail?.value
                        ?.trim() ||
                    "",

                phone:
                    signupPhone?.value
                        ?.trim() ||
                    "",

                businessName:
                    businessName?.value
                        ?.trim() ||
                    "",

                businessType:
                    businessType?.value ||
                    "",

                websiteGoal:
                    websiteGoal?.value ||
                    "",

                password:
                    signupPassword?.value ||
                    "",

                confirmPassword:
                    confirmPassword?.value ||
                    "",

                referralCode:
                    referralCode?.value
                        ?.trim() ||
                    ""

            };


            if (!data.name) {

                showMessage(
                    signupMessage,
                    "Enter your name."
                );

                return;

            }


            if (!validateEmail(
                data.email
            )) {

                showMessage(
                    signupMessage,
                    "Enter a valid email."
                );

                return;

            }


            if (!validatePassword(
                data.password
            )) {

                showMessage(
                    signupMessage,
                    "Password must contain 8+ characters, uppercase, lowercase, number and special character."
                );

                return;

            }


            if (
                data.password !==
                data.confirmPassword
            ) {

                showMessage(
                    signupMessage,
                    "Passwords do not match."
                );

                return;

            }


            if (
                acceptTerms &&
                !acceptTerms.checked
            ) {

                showMessage(
                    signupMessage,
                    "Please accept Terms & Conditions."
                );

                return;

            }


            await signupWithEmail(
                data
            );

        }
    );

}


// ============================================================
// GOOGLE LOGIN
// ============================================================

if (googleLogin) {

    googleLogin.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            await socialLogin(
                googleProvider,
                "google",
                loginMessage
            );

        }
    );

}


if (googleSignup) {

    googleSignup.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            await socialLogin(
                googleProvider,
                "google",
                signupMessage
            );

        }
    );

}


// ============================================================
// FACEBOOK
// ============================================================

if (facebookLogin) {

    facebookLogin.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            await socialLogin(
                facebookProvider,
                "facebook",
                loginMessage
            );

        }
    );

}


if (facebookSignup) {

    facebookSignup.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            await socialLogin(
                facebookProvider,
                "facebook",
                signupMessage
            );

        }
    );

}


// ============================================================
// GITHUB
// ============================================================

if (githubLogin) {

    githubLogin.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            await socialLogin(
                githubProvider,
                "github",
                loginMessage
            );

        }
    );

}


if (githubSignup) {

    githubSignup.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            await socialLogin(
                githubProvider,
                "github",
                signupMessage
            );

        }
    );

}


// ============================================================
// MICROSOFT
// ============================================================

if (microsoftLogin) {

    microsoftLogin.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            await socialLogin(
                microsoftProvider,
                "microsoft",
                loginMessage
            );

        }
    );

}


if (microsoftSignup) {

    microsoftSignup.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            await socialLogin(
                microsoftProvider,
                "microsoft",
                signupMessage
            );

        }
    );

}


// ============================================================
// PASSWORD RESET
// ============================================================

async function resetPassword(email) {

    try {

        if (!validateEmail(email)) {

            throw new Error(
                "Enter a valid email address."
            );

        }


        await sendPasswordResetEmail(
            auth,
            email
        );


        alert(
            "Password reset email sent. Please check your inbox."
        );


        return true;

    }

    catch (error) {

        alert(
            firebaseError(error)
        );

        return false;

    }

}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    try {

        await signOut(auth);

        window.location.replace(
            LOGIN_PAGE
        );

    }

    catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    }

}


// ============================================================
// PROTECTED DASHBOARD CHECK
// ============================================================

function protectDashboard() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    const protectedPages = [

        CUSTOMER_DASHBOARD,

        ADMIN_DASHBOARD

    ];


    if (
        !protectedPages.includes(
            currentPage
        )
    ) {

        return;

    }


    onAuthStateChanged(
        auth,
        function (user) {

            if (!user) {

                window.location.replace(
                    LOGIN_PAGE
                );

            }

        }
    );

}


// ============================================================
// AUTH STATE
// IMPORTANT:
// Do NOT redirect automatically from login page.
// This prevents existing Firebase session from
// automatically opening dashboard.
// User must click Login / Google Login.
// ============================================================

protectDashboard();


// ============================================================
// GLOBAL API
// ============================================================

window.smileAuth = {

    logout,

    getCurrentUser:
        () => auth.currentUser,

    loginWithEmail,

    signupWithEmail,

    resetPassword,

    socialLogin,

    redirectAfterLogin

};


console.log(
    "✅ Smile AI Auth System Loaded"
);
