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

/* ==========================================================
   DASHBOARD.JS
   PART 02
   Dashboard Statistics + Logout + Firestore
========================================================== */

/* ==========================================================
   DOM IDS
========================================================== */

const totalWebsites=document.getElementById("totalWebsites");
const totalVisitors=document.getElementById("totalVisitors");
const walletBalance=document.getElementById("walletBalance");
const membershipPlan=document.getElementById("membershipPlan");

const analyticsVisitors=document.getElementById("analyticsVisitors");
const analyticsLeads=document.getElementById("analyticsLeads");
const analyticsRevenue=document.getElementById("analyticsRevenue");

const notificationList=document.getElementById("notificationList");

/* ==========================================================
   LOAD DASHBOARD DATA
========================================================== */

async function loadDashboardData(){

try{

const userRef=doc(db,"users",currentUser.uid);

const snap=await getDoc(userRef);

if(!snap.exists()) return;

const data=snap.data();

if(walletBalance){

walletBalance.textContent="₹"+(data.wallet || 0);

}

if(membershipPlan){

membershipPlan.textContent=data.membership || "Free";

}

}
catch(error){

console.error(error);

}

}

/* ==========================================================
   LOAD USER WEBSITES
========================================================== */

async function loadWebsiteCount(){

try{

const q=query(

collection(db,"websites"),

where("userId","==",currentUser.uid)

);

const result=await getDocs(q);

if(totalWebsites){

totalWebsites.textContent=result.size;

}

}
catch(error){

console.error(error);

}

}

/* ==========================================================
   LOAD ANALYTICS
========================================================== */

async function loadAnalytics(){

try{

const analyticsRef=doc(db,"analytics",currentUser.uid);

const snap=await getDoc(analyticsRef);

if(!snap.exists()) return;

const data=snap.data();

if(analyticsVisitors){

analyticsVisitors.textContent=data.visitors || 0;

}

if(analyticsLeads){

analyticsLeads.textContent=data.leads || 0;

}

if(analyticsRevenue){

analyticsRevenue.textContent="₹"+(data.revenue || 0);

}

if(totalVisitors){

totalVisitors.textContent=data.visitors || 0;

}

}
catch(error){

console.error(error);

}

}

/* ==========================================================
   NOTIFICATIONS
========================================================== */

async function loadNotifications(){

try{

const q=query(

collection(db,"notifications"),

where("userId","==",currentUser.uid)

);

const result=await getDocs(q);

if(!notificationList) return;

notificationList.innerHTML="";

result.forEach(docItem=>{

const item=docItem.data();

notificationList.innerHTML+=`

<li>

${item.title}

</li>

`;

});

}
catch(error){

console.error(error);

}

}

/* ==========================================================
   LOGOUT
========================================================== */

if(logoutBtn){

logoutBtn.addEventListener("click",async()=>{

const confirmLogout=confirm("Are you sure you want to logout?");

if(!confirmLogout) return;

try{

await signOut(auth);

window.location.href="login.html";

}
catch(error){

console.error(error);

}

});

}

/* ==========================================================
   INITIALIZE
========================================================== */

async function initializeDashboard(){

await loadDashboardData();

await loadWebsiteCount();

await loadAnalytics();

await loadNotifications();

}

onAuthStateChanged(auth,async(user)=>{

if(user){

currentUser=user;

await initializeDashboard();

}

});

console.log("Dashboard JS Part 02 Loaded");

/* ==========================================================
   DASHBOARD.JS
   PART 03-A
   WEBSITE LIST MODULE
========================================================== */

const websiteTable = document.getElementById("websiteTable");
const websiteName = document.getElementById("websiteName");
const websiteDomain = document.getElementById("websiteDomain");
const websiteVisitors = document.getElementById("websiteVisitors");
const websiteLeads = document.getElementById("websiteLeads");
const websiteOrders = document.getElementById("websiteOrders");

/* ==========================================================
   LOAD USER WEBSITES
========================================================== */

async function loadUserWebsites(){

    try{

        const q = query(
            collection(db,"websites"),
            where("userId","==",currentUser.uid)
        );

        const snapshot = await getDocs(q);

        if(!websiteTable) return;

        websiteTable.innerHTML="";

        if(snapshot.empty){

            websiteTable.innerHTML=`
            <tr>
                <td colspan="5">No Website Found</td>
            </tr>
            `;

            return;

        }

        snapshot.forEach((docItem)=>{

            const data = docItem.data();

            websiteTable.innerHTML += `

            <tr>

                <td>${data.name || "-"}</td>

                <td>${data.domain || "-"}</td>

                <td>${data.status || "Draft"}</td>

                <td>${data.visitors || 0}</td>

                <td>

                    <button
                        class="primaryBtn previewWebsite"
                        data-id="${docItem.id}">
                        Preview
                    </button>

                </td>

            </tr>

            `;

        });

        attachPreviewEvents();

    }

    catch(error){

        console.error("Website Load Error:",error);

    }

}

/* ==========================================================
   WEBSITE PREVIEW
========================================================== */

function attachPreviewEvents(){

    document.querySelectorAll(".previewWebsite").forEach(btn=>{

        btn.addEventListener("click",()=>{

            const id=btn.dataset.id;

            previewWebsite(id);

        });

    });

}

async function previewWebsite(id){

    try{

        const ref=doc(db,"websites",id);

        const snap=await getDoc(ref);

        if(!snap.exists()){

            alert("Website Not Found");

            return;

        }

        const data=snap.data();

        websiteName.textContent=data.name || "Website";

        websiteDomain.textContent=data.domain || "-";

        websiteVisitors.textContent=data.visitors || 0;

        websiteLeads.textContent=data.leads || 0;

        websiteOrders.textContent=data.orders || 0;

    }

    catch(error){

        console.error(error);

    }

}

console.log("Dashboard JS Part 03-A Loaded");

/* ==========================================================
   DASHBOARD.JS
   PART 03-B
   CREATE WEBSITE MODULE
========================================================== */

const createWebsiteBtn =
document.getElementById("createWebsiteBtn");

const createNewWebsiteBtn =
document.getElementById("createNewWebsiteBtn");

/* ==========================================================
   CREATE WEBSITE
========================================================== */

async function createWebsite(){

try{

const websiteName=prompt("Website Name");

if(!websiteName) return;

const websiteDomain=prompt("Subdomain");

if(!websiteDomain) return;

const websiteData={

userId:currentUser.uid,

name:websiteName,

domain:websiteDomain+".smilefinancialsolution.com",

status:"Draft",

visitors:0,

leads:0,

orders:0,

published:false,

createdAt:serverTimestamp(),

updatedAt:serverTimestamp()

};

await addDoc(

collection(db,"websites"),

websiteData

);

alert("Website Created Successfully");

await loadUserWebsites();

await loadWebsiteCount();

}

catch(error){

console.error(error);

alert(error.message);

}

}

/* ==========================================================
   BUTTON EVENTS
========================================================== */

if(createWebsiteBtn){

createWebsiteBtn.addEventListener(

"click",

createWebsite

);

}

if(createNewWebsiteBtn){

createNewWebsiteBtn.addEventListener(

"click",

createWebsite

);

}

/* ==========================================================
   AUTO REFRESH
========================================================== */

async function refreshDashboard(){

await loadWebsiteCount();

await loadUserWebsites();

await loadDashboardData();

}

console.log("Dashboard JS Part 03-B Loaded");

