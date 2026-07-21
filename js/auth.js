// ======================================================
// Smile AI Web Studio
// auth.js
// Part 1
// Firebase Authentication
// ======================================================

import {
auth,
db,

createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged,
sendPasswordResetEmail,
signInWithPopup,

GoogleAuthProvider,
FacebookAuthProvider,
GithubAuthProvider,
OAuthProvider,

doc,
setDoc,
getDoc,
updateDoc,
serverTimestamp

} from "./firebase-service.js";


// =======================================
// DOM
// =======================================

// LOGIN

const loginForm=document.getElementById("loginForm");
const loginEmail=document.getElementById("loginEmail");
const loginPassword=document.getElementById("loginPassword");
const loginBtn=document.getElementById("loginBtn");
const loginMessage=document.getElementById("loginMessage");
const rememberMe=document.getElementById("rememberMe");

// SIGNUP

const signupForm=document.getElementById("signupForm");

const signupName=document.getElementById("signupName");
const signupEmail=document.getElementById("signupEmail");
const signupPhone=document.getElementById("signupPhone");

const businessName=document.getElementById("businessName");
const businessType=document.getElementById("businessType");
const websiteGoal=document.getElementById("websiteGoal");

const signupPassword=document.getElementById("signupPassword");
const confirmPassword=document.getElementById("confirmPassword");

const referralCode=document.getElementById("referralCode");
const acceptTerms=document.getElementById("acceptTerms");

const signupBtn=document.getElementById("signupBtn");
const signupMessage=document.getElementById("signupMessage");

// SOCIAL

const googleLogin=document.getElementById("googleLogin");
const facebookLogin=document.getElementById("facebookLogin");
const githubLogin=document.getElementById("githubLogin");
const microsoftLogin=document.getElementById("microsoftLogin");

const googleSignup=document.getElementById("googleSignup");
const facebookSignup=document.getElementById("facebookSignup");
const githubSignup=document.getElementById("githubSignup");
const microsoftSignup=document.getElementById("microsoftSignup");


// =======================================
// Providers
// =======================================

const googleProvider=new GoogleAuthProvider();

const facebookProvider=new FacebookAuthProvider();

const githubProvider=new GithubAuthProvider();

const microsoftProvider=new OAuthProvider("microsoft.com");


// =======================================
// Helper Functions
// =======================================

function showMessage(element,message,type="error"){

if(!element) return;

element.innerHTML=message;

element.classList.remove("success","error");

element.classList.add(type);

}

function clearMessage(element){

if(!element) return;

element.innerHTML="";

element.classList.remove("success","error");

}

function setLoading(button,status){

if(!button) return;

button.disabled=status;

if(status){

button.dataset.oldText=button.innerHTML;

button.innerHTML="Please Wait...";

}else{

button.innerHTML=button.dataset.oldText;

}

}

function validateEmail(email){

return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}

function validatePassword(password){

const uppercase=/[A-Z]/.test(password);

const lowercase=/[a-z]/.test(password);

const number=/[0-9]/.test(password);

const special=/[^A-Za-z0-9]/.test(password);

return(

password.length>=8 &&

uppercase &&

lowercase &&

number &&

special

);

}


// =======================================
// Firebase Error Messages
// =======================================

function firebaseError(error){

switch(error.code){

case "auth/user-not-found":

return "Account not found.";

case "auth/wrong-password":

return "Wrong password.";

case "auth/email-already-in-use":

return "Email already registered.";

case "auth/invalid-email":

return "Invalid email.";

case "auth/network-request-failed":

return "Check internet connection.";

case "auth/too-many-requests":

return "Too many attempts. Try later.";

case "auth/weak-password":

return "Weak password.";

default:

return error.message;

}

}
// ======================================================
// PART 2
// EMAIL LOGIN / SIGNUP / RESET PASSWORD
// ======================================================


// ==============================
// LOGIN
// ==============================

async function loginWithEmail(email, password) {

    try {

        setLoading(loginBtn, true);
        clearMessage(loginMessage);

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user = userCredential.user;

        const userRef = doc(db, "users", user.uid);

        await updateDoc(userRef, {
            lastLogin: serverTimestamp()
        });

        showMessage(
            loginMessage,
            "Login Successful...",
            "success"
        );

        return user;

    } catch (error) {

        showMessage(
            loginMessage,
            firebaseError(error),
            "error"
        );

        return null;

    } finally {

        setLoading(loginBtn, false);

    }

}



// ==============================
// SIGNUP
// ==============================

async function signupWithEmail(data){

    try{

        setLoading(signupBtn,true);

        clearMessage(signupMessage);

        const credential =
        await createUserWithEmailAndPassword(

            auth,

            data.email,

            data.password

        );

        const user=credential.user;

        await setDoc(

            doc(db,"users",user.uid),

            {

                uid:user.uid,

                name:data.name,

                email:data.email,

                phone:data.phone,

                businessName:data.businessName,

                businessType:data.businessType,

                websiteGoal:data.websiteGoal,

                referralCode:data.referralCode,

                role:"customer",

                provider:"email",

                status:"active",

                createdAt:serverTimestamp(),

                lastLogin:serverTimestamp()

            }

        );

        showMessage(

            signupMessage,

            "Account Created Successfully.",

            "success"

        );

        return user;

    }

    catch(error){

        showMessage(

            signupMessage,

            firebaseError(error),

            "error"

        );

        return null;

    }

    finally{

        setLoading(signupBtn,false);

    }

}



// ==============================
// PASSWORD RESET
// ==============================

async function resetPassword(email){

    try{

        await sendPasswordResetEmail(

            auth,

            email

        );

        alert(

            "Password reset email sent."

        );

    }

    catch(error){

        alert(

            firebaseError(error)

        );

    }

}



// ==============================
// LOGIN FORM
// ==============================

if(loginForm){

loginForm.addEventListener(

"submit",

async function(e){

e.preventDefault();

const email=loginEmail.value.trim();

const password=loginPassword.value;

if(!validateEmail(email)){

showMessage(

loginMessage,

"Enter valid email."

);

return;

}

if(password.length<8){

showMessage(

loginMessage,

"Password is invalid."

);

return;

}

const user=

await loginWithEmail(

email,

password

);

if(user){

window.location.href=

"customer-dashboard.html";

}

});

}



// ==============================
// SIGNUP FORM
// ==============================

if(signupForm){

signupForm.addEventListener(

"submit",

async function(e){

e.preventDefault();

const data={

name:signupName.value.trim(),

email:signupEmail.value.trim(),

phone:signupPhone.value.trim(),

businessName:businessName.value.trim(),

businessType:businessType.value,

websiteGoal:websiteGoal.value,

password:signupPassword.value,

confirmPassword:confirmPassword.value,

referralCode:referralCode.value.trim()

};

if(data.name==""){

showMessage(

signupMessage,

"Enter your name."

);

return;

}

if(!validateEmail(data.email)){

showMessage(

signupMessage,

"Invalid Email"

);

return;

}

if(!validatePassword(data.password)){

showMessage(

signupMessage,

"Password is weak."

);

return;

}

if(data.password!=data.confirmPassword){

showMessage(

signupMessage,

"Passwords do not match."

);

return;

}

if(!acceptTerms.checked){

showMessage(

signupMessage,

"Accept Terms & Conditions."

);

return;

}

const user=

await signupWithEmail(data);

if(user){

window.location.href=

"customer-dashboard.html";

}

});

}
// ======================================================
// PART 3
// SOCIAL LOGIN
// ======================================================


// =======================================
// CREATE / UPDATE USER
// =======================================

async function createOrUpdateSocialUser(user, providerName) {

    const userRef = doc(db, "users", user.uid);

    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {

        await setDoc(userRef, {

            uid: user.uid,

            name: user.displayName || "",

            email: user.email || "",

            phone: user.phoneNumber || "",

            businessName: "",

            businessType: "",

            websiteGoal: "",

            referralCode: "",

            role: "customer",

            provider: providerName,

            photoURL: user.photoURL || "",

            status: "active",

            createdAt: serverTimestamp(),

            lastLogin: serverTimestamp()

        });

    } else {

        await updateDoc(userRef, {

            lastLogin: serverTimestamp(),

            photoURL: user.photoURL || "",

            provider: providerName,

            status: "active"

        });

    }

}



// =======================================
// SOCIAL LOGIN
// =======================================

async function socialLogin(provider, providerName) {

    try {

        const result = await signInWithPopup(auth, provider);

        const user = result.user;

        await createOrUpdateSocialUser(

            user,

            providerName

        );

        window.location.href =

        "customer-dashboard.html";

    }

    catch(error){

        if(loginMessage){

            showMessage(

                loginMessage,

                firebaseError(error),

                "error"

            );

        }

        if(signupMessage){

            showMessage(

                signupMessage,

                firebaseError(error),

                "error"

            );

        }

    }

}



// =======================================
// GOOGLE
// =======================================

if(googleLogin){

googleLogin.addEventListener(

"click",

()=>{

socialLogin(

googleProvider,

"google"

);

}

);

}

if(googleSignup){

googleSignup.addEventListener(

"click",

()=>{

socialLogin(

googleProvider,

"google"

);

}

);

}



// =======================================
// FACEBOOK
// =======================================

if(facebookLogin){

facebookLogin.addEventListener(

"click",

()=>{

socialLogin(

facebookProvider,

"facebook"

);

}

);

}

if(facebookSignup){

facebookSignup.addEventListener(

"click",

()=>{

socialLogin(

facebookProvider,

"facebook"

);

}

);

}



// =======================================
// GITHUB
// =======================================

if(githubLogin){

githubLogin.addEventListener(

"click",

()=>{

socialLogin(

githubProvider,

"github"

);

}

);

}

if(githubSignup){

githubSignup.addEventListener(

"click",

()=>{

socialLogin(

githubProvider,

"github"

);

}

);

}



// =======================================
// MICROSOFT
// =======================================

if(microsoftLogin){

microsoftLogin.addEventListener(

"click",

()=>{

socialLogin(

microsoftProvider,

"microsoft"

);

}

);

}

if(microsoftSignup){

microsoftSignup.addEventListener(

"click",

()=>{

socialLogin(

    microsoftProvider,
    
    "microsoft"
    
    );
    
    }
    
    );
    
    }
    // ======================================================
    // PART 4
    // SESSION | LOGOUT | AUTH CHECK | ROLE REDIRECT
    // ======================================================
    
    
    // =======================================
    // LOGOUT
    // =======================================
    
    async function logout() {
    
        try {
    
            await signOut(auth);
    
            window.location.href = "login.html";
    
        }
    
        catch (error) {
    
            console.error(error);
    
        }
    
    }
    
    
    
    // =======================================
    // CURRENT USER
    // =======================================
    
    function getCurrentUser() {
    
        return auth.currentUser;
    
    }
    
    
    
    // =======================================
    // CHECK AUTH
    // =======================================
    
    function checkAuth() {
    
        return new Promise((resolve) => {
    
            onAuthStateChanged(auth, (user) => {
    
                resolve(user);
    
            });
    
        });
    
    }
    
    
    
    // =======================================
    // ROLE BASED REDIRECT
    // =======================================
    
    async function redirectUser(user) {
    
        if (!user) {
    
            window.location.href = "login.html";
    
            return;
    
        }
    
        try {
    
            const userRef = doc(db, "users", user.uid);
    
            const snapshot = await getDoc(userRef);
    
            if (!snapshot.exists()) {
    
                window.location.href = "customer-dashboard.html";
    
                return;
    
            }
    
            const data = snapshot.data();
    
            if (data.role === "admin") {
    
                window.location.href = "admin-dashboard.html";
    
            }
    
            else {
    
                window.location.href = "customer-dashboard.html";
    
            }
    
        }
    
        catch (error) {
    
            console.error(error);
    
            window.location.href = "customer-dashboard.html";
    
        }
    
    }
    
    
    
    // =======================================
    // AUTO SESSION
    // =======================================
    
    const page = window.location.pathname;
    
    
    
    const isLoginPage =
    
    page.includes("login.html");
    
    
    
    const isSignupPage =
    
    page.includes("signup.html");
    
    
    
    if (isLoginPage || isSignupPage) {
    
        onAuthStateChanged(
    
            auth,
    
            async (user) => {
    
                if (user) {
    
                    await redirectUser(user);
    
                }
    
            }
    
        );
    
    }
    
    
    
    // =======================================
    // PROTECT DASHBOARD
    // =======================================
    
    const protectedPages = [
    
    "customer-dashboard.html",
    
    "admin-dashboard.html"
    
    ];
    
    
    
    const currentPage =
    
    page.split("/").pop();
    
    
    
    if (protectedPages.includes(currentPage)) {
    
        onAuthStateChanged(
    
            auth,
    
            async (user) => {
    
                if (!user) {
    
                    window.location.href =
    
                    "login.html";
    
                }
    
            }
    
        );
    
    }
    
    
    
    // =======================================
    // GLOBAL EXPORT
    // =======================================
    
    window.auth = {
    
    logout,
    
    getCurrentUser,
    
    checkAuth,
    
    loginWithEmail,
    
    signupWithEmail,
    
    resetPassword
    
    };
    
    
    
    console.log("✅ auth.js loaded successfully");
