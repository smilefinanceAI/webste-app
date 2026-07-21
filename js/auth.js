// ============================================================
// Smile AI Web Studio
// Authentication System
// Production Foundation
// ============================================================

import {

    auth,
    db,

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

    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp

} from "./firebase-service.js";


// ============================================================
// DOM ELEMENTS
// ============================================================

// Login

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginBtn =
    document.getElementById("loginBtn");

const loginMessage =
    document.getElementById("loginMessage");

const rememberMe =
    document.getElementById("rememberMe");


// Signup

const signupForm =
    document.getElementById("signupForm");

const signupName =
    document.getElementById("signupName");

const signupEmail =
    document.getElementById("signupEmail");

const signupPhone =
    document.getElementById("signupPhone");

const businessName =
    document.getElementById("businessName");

const businessType =
    document.getElementById("businessType");

const websiteGoal =
    document.getElementById("websiteGoal");

const signupPassword =
    document.getElementById("signupPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const referralCode =
    document.getElementById("referralCode");

const acceptTerms =
    document.getElementById("acceptTerms");

const signupBtn =
    document.getElementById("signupBtn");

const signupMessage =
    document.getElementById("signupMessage");


// Social Login

const googleLogin =
    document.getElementById("googleLogin");

const facebookLogin =
    document.getElementById("facebookLogin");

const githubLogin =
    document.getElementById("githubLogin");

const microsoftLogin =
    document.getElementById("microsoftLogin");


const googleSignup =
    document.getElementById("googleSignup");

const facebookSignup =
    document.getElementById("facebookSignup");

const githubSignup =
    document.getElementById("githubSignup");

const microsoftSignup =
    document.getElementById("microsoftSignup");


// ============================================================
// PROVIDERS
// ============================================================

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});

const facebookProvider =
    new FacebookAuthProvider();

const githubProvider =
    new GithubAuthProvider();

const microsoftProvider =
    new OAuthProvider("microsoft.com");


// ============================================================
// HELPERS
// ============================================================

function showMessage(
    element,
    message,
    type = "error"
) {

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


function setLoading(
    button,
    loading
) {

    if (!button) return;

    if (loading) {

        button.disabled = true;

        button.dataset.oldText =
            button.innerHTML;

        button.innerHTML =
            "Please Wait...";

    } else {

        button.disabled = false;

        if (button.dataset.oldText) {

            button.innerHTML =
                button.dataset.oldText;

        }

    }

}


function validateEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

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
// FIREBASE ERROR
// ============================================================

function getFirebaseError(error) {

    const errors = {

        "auth/user-not-found":
            "No account found with this email.",

        "auth/wrong-password":
            "Incorrect password.",

        "auth/invalid-credential":
            "Email or password is incorrect.",

        "auth/email-already-in-use":
            "This email is already registered.",

        "auth/invalid-email":
            "Please enter a valid email.",

        "auth/weak-password":
            "Password is too weak.",

        "auth/network-request-failed":
            "Network error. Please check your internet.",

        "auth/too-many-requests":
            "Too many attempts. Please try again later.",

        "auth/popup-closed-by-user":
            "Login popup was closed.",

        "auth/popup-blocked":
            "Popup was blocked by your browser.",

        "auth/account-exists-with-different-credential":
            "An account already exists with another login method."

    };

    return (

        errors[error.code] ||

        error.message ||

        "Something went wrong."

    );

}


// ============================================================
// USER PROFILE
// ============================================================

async function createUserProfile(
    user,
    extraData = {},
    provider = "email"
) {

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );

    const snapshot =
        await getDoc(userRef);


    if (!snapshot.exists()) {

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

                role: "customer",

                provider: provider,

                photoURL:
                    user.photoURL ||
                    "",

                status: "active",

                membership: "free",

                walletBalance: 0,

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

                lastLogin:
                    serverTimestamp(),

                photoURL:
                    user.photoURL ||
                    snapshot.data().photoURL ||
                    "",

                provider: provider

            }

        );

    }

}


// ============================================================
// GET USER ROLE
// ============================================================

async function getUserRole(user) {

    if (!user) return null;

    const userRef =
        doc(
            db,
            "users",
            user.uid
        );

    const snapshot =
        await getDoc(userRef);


    if (!snapshot.exists()) {

        return null;

    }


    return snapshot.data().role ||
        "customer";

}


// ============================================================
// ROLE REDIRECT
// ============================================================

async function redirectUser(user) {

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        const role =
            await getUserRole(user);


        if (role === "admin") {

            window.location.href =
                "admin-dashboard.html";

        } else {

            window.location.href =
                "customer-dashboard.html";

        }

    }

    catch (error) {

        console.error(
            "Role redirect error:",
            error
        );

        window.location.href =
            "login.html";

    }

}


// ============================================================
// EMAIL LOGIN
// ============================================================

async function loginWithEmail(
    email,
    password,
    remember = true
) {

    try {

        setLoading(
            loginBtn,
            true
        );

        clearMessage(
            loginMessage
        );


        await setPersistence(

            auth,

            remember

                ? browserLocalPersistence

                : browserSessionPersistence

        );


        const credential =

            await signInWithEmailAndPassword(

                auth,

                email,

                password

            );


        const user =
            credential.user;


        await createUserProfile(
            user
        );


        showMessage(

            loginMessage,

            "Login successful.",

            "success"

        );


        return user;

    }

    catch (error) {

        showMessage(

            loginMessage,

            getFirebaseError(error)

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

async function signupWithEmail(
    data
) {

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


        await createUserProfile(

            user,

            data,

            "email"

        );


        showMessage(

            signupMessage,

            "Account created successfully.",

            "success"

        );


        return user;

    }

    catch (error) {

        showMessage(

            signupMessage,

            getFirebaseError(error)

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
// PASSWORD RESET
// ============================================================

async function resetPassword(
    email
) {

    try {

        await sendPasswordResetEmail(

            auth,

            email

        );


        return {

            success: true,

            message:
                "Password reset email sent."

        };

    }

    catch (error) {

        return {

            success: false,

            message:
                getFirebaseError(error)

        };

    }

}


// ============================================================
// SOCIAL LOGIN
// ============================================================

async function socialLogin(

    provider,

    providerName

) {

    try {

        const result =

            await signInWithPopup(

                auth,

                provider

            );


        const user =
            result.user;


        await createUserProfile(

            user,

            {},

            providerName

        );


        await redirectUser(
            user
        );

    }

    catch (error) {

        const message =
            getFirebaseError(error);


        showMessage(
            loginMessage,
            message
        );

        showMessage(
            signupMessage,
            message
        );

    }

}


// ============================================================
// LOGIN FORM
// ============================================================

if (loginForm) {

    loginForm.addEventListener(

        "submit",

        async (event) => {

            event.preventDefault();


            const email =
                loginEmail.value.trim();


            const password =
                loginPassword.value;


            const remember =
                rememberMe
                    ? rememberMe.checked
                    : true;


            if (!validateEmail(email)) {

                showMessage(

                    loginMessage,

                    "Please enter a valid email."

                );

                return;

            }


            if (!password) {

                showMessage(

                    loginMessage,

                    "Please enter your password."

                );

                return;

            }


            const user =

                await loginWithEmail(

                    email,

                    password,

                    remember

                );


            if (user) {

                await redirectUser(
                    user
                );

            }

        }

    );

}


// ============================================================
// SIGNUP FORM
// ============================================================

if (signupForm) {

    signupForm.addEventListener(

        "submit",

        async (event) => {

            event.preventDefault();


            const data = {

                name:
                    signupName?.value.trim() ||
                    "",

                email:
                    signupEmail?.value.trim() ||
                    "",

                phone:
                    signupPhone?.value.trim() ||
                    "",

                businessName:
                    businessName?.value.trim() ||
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
                    referralCode?.value.trim() ||
                    ""

            };


            if (!data.name) {

                showMessage(

                    signupMessage,

                    "Please enter your name."

                );

                return;

            }


            if (!validateEmail(
                data.email
            )) {

                showMessage(

                    signupMessage,

                    "Please enter a valid email."

                );

                return;

            }


            if (!validatePassword(
                data.password
            )) {

                showMessage(

                    signupMessage,

                    "Password must contain 8 characters, uppercase, lowercase, number and special character."

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


            const user =

                await signupWithEmail(
                    data
                );


            if (user) {

                await redirectUser(
                    user
                );

            }

        }

    );

}


// ============================================================
// SOCIAL BUTTONS
// ============================================================

function bindSocialButton(
    element,
    provider,
    providerName
) {

    if (!element) return;

    element.addEventListener(

        "click",

        () => {

            socialLogin(

                provider,

                providerName

            );

        }

    );

}


bindSocialButton(
    googleLogin,
    googleProvider,
    "google"
);

bindSocialButton(
    googleSignup,
    googleProvider,
    "google"
);


bindSocialButton(
    facebookLogin,
    facebookProvider,
    "facebook"
);

bindSocialButton(
    facebookSignup,
    facebookProvider,
    "facebook"
);


bindSocialButton(
    githubLogin,
    githubProvider,
    "github"
);

bindSocialButton(
    githubSignup,
    githubProvider,
    "github"
);


bindSocialButton(
    microsoftLogin,
    microsoftProvider,
    "microsoft"
);

bindSocialButton(
    microsoftSignup,
    microsoftProvider,
    "microsoft"
);


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    try {

        await signOut(auth);

        window.location.href =
            "login.html";

    }

    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


// ============================================================
// PAGE PROTECTION
// ============================================================

const currentPage =

    window.location.pathname
        .split("/")
        .pop();


const isLoginPage =

    currentPage ===
    "login.html";


const isSignupPage =

    currentPage ===
    "signup.html";


const isCustomerDashboard =

    currentPage ===
    "customer-dashboard.html";


const isAdminDashboard =

    currentPage ===
    "admin-dashboard.html";


onAuthStateChanged(

    auth,

    async (user) => {

        // ------------------------------
        // Dashboard Protection
        // ------------------------------

        if (
            isCustomerDashboard ||
            isAdminDashboard
        ) {

            if (!user) {

                window.location.href =
                    "login.html";

                return;

            }


            const role =
                await getUserRole(user);


            if (
                isCustomerDashboard &&
                role === "admin"
            ) {

                window.location.href =
                    "admin-dashboard.html";

                return;

            }


            if (
                isAdminDashboard &&
                role !== "admin"
            ) {

                window.location.href =
                    "customer-dashboard.html";

                return;

            }

        }


        // ------------------------------
        // Login / Signup Page
        // ------------------------------

        if (
            isLoginPage ||
            isSignupPage
        ) {

            if (user) {

                await redirectUser(
                    user
                );

            }

        }

    }

);


// ============================================================
// GLOBAL API
// ============================================================

window.SmileAuth = {

    logout,

    getUserRole,

    redirectUser,

    loginWithEmail,

    signupWithEmail,

    socialLogin,

    resetPassword

};


console.log(
    "✅ Smile AI Authentication System Ready"
);
