/* ==========================================================
   Smile AI Web Studio
   dashboard.js
   Production Ready
   Part 01
========================================================== */

import {
    auth,
    db,
    onAuthStateChanged,
    signOut,
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp
} from "./firebase-service.js";

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let currentUser = null;
let currentUserData = null;

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userPhoto = document.getElementById("userPhoto");

const loader = document.getElementById("loader");

const logoutBtn = document.getElementById("logoutBtn");

const notificationBtn = document.getElementById("notificationBtn");

/* ==========================================================
   HELPER FUNCTIONS
========================================================== */

function showLoader() {

    if(loader){

        loader.style.display="flex";

    }

}

function hideLoader(){

    if(loader){

        loader.style.display="none";

    }

}

function showToast(message){

    alert(message);

}

/* ==========================================================
   LOAD USER PROFILE
========================================================== */

async function loadUserProfile(uid){

    try{

        const userRef = doc(db,"users",uid);

        const userSnap = await getDoc(userRef);

        if(!userSnap.exists()){

            showToast("User not found");

            return;

        }

        currentUserData=userSnap.data();

        if(userName){

            userName.textContent=currentUserData.name || "Customer";

        }

        if(userEmail){

            userEmail.textContent=currentUserData.email || "";

        }

        if(userPhoto){

            userPhoto.src=currentUserData.photoURL || "images/default-user.png";

        }

    }

    catch(error){

        console.error(error);

    }

}

/* ==========================================================
   AUTH CHECK
========================================================== */

onAuthStateChanged(auth,async(user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    currentUser=user;

    showLoader();

    await loadUserProfile(user.uid);

    hideLoader();

});

console.log("Dashboard JS Part 01 Loaded");

