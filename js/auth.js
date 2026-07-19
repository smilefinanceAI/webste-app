// js/auth.js
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
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
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from './firebase-service.js';

// ============================================================
// DOM REFS
// ============================================================

// Login
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const loginMessage = document.getElementById('loginMessage');
const rememberMe = document.getElementById('rememberMe');

// Signup
const signupForm = document.getElementById('signupForm');
const signupName = document.getElementById('signupName');
const signupEmail = document.getElementById('signupEmail');
const signupPhone = document.getElementById('signupPhone');
const businessName = document.getElementById('businessName');
const businessType = document.getElementById('businessType');
const websiteGoal = document.getElementById('websiteGoal');
const signupPassword = document.getElementById('signupPassword');
const confirmPassword = document.getElementById('confirmPassword');
const referralCode = document.getElementById('referralCode');
const acceptTerms = document.getElementById('acceptTerms');
const signupBtn = document.getElementById('signupBtn');
const signupMessage = document.getElementById('signupMessage');

// Social buttons
const googleLoginBtn = document.getElementById('googleLogin');
const facebookLoginBtn = document.getElementById('facebookLogin');
const githubLoginBtn = document.getElementById('githubLogin');
const microsoftLoginBtn = document.getElementById('microsoftLogin');
const googleSignupBtn = document.getElementById('googleSignup');
const facebookSignupBtn = document.getElementById('facebookSignup');
const githubSignupBtn = document.getElementById('githubSignup');
const microsoftSignupBtn = document.getElementById('microsoftSignup');

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function showMessage(element, message, isError = true) {
  if (!element) return;
  element.textContent = message;
  element.className = 'message-area';
  if (isError) {
    element.classList.add('error');
  } else {
    element.classList.add('success');
  }
}

function clearMessage(element) {
  if (!element) return;
  element.textContent = '';
  element.className = 'message-area';
}

function setLoading(button, isLoading, originalText = '') {
  if (!button) return;
  if (isLoading) {
    button.disabled = true;
    const span = button.querySelector('span') || button;
    const text = span.textContent || button.textContent;
    button.dataset.originalText = text;
    span.innerHTML = '<span class="loader-spinner"></span> Processing…';
  } else {
    button.disabled = false;
    const span = button.querySelector('span') || button;
    span.textContent = originalText || button.dataset.originalText || 'Submit';
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  return password.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

function getErrorMessage(error) {
  const code = error.code || '';
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'Account already exists. Please sign in.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 8 characters with uppercase, lowercase, number, and special character.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup closed. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in cancelled. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account exists with the same email but different sign-in method.';
    default:
      return error.message || 'An unexpected error occurred.';
  }
}

// ============================================================
// CREATE / UPDATE FIRESTORE USER
// ============================================================

async function createOrUpdateUser(user, additionalData = {}) {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  const now = serverTimestamp();
  const baseData = {
    uid: user.uid,
    email: user.email,
    name: user.displayName || additionalData.name || '',
    photoURL: user.photoURL || '',
    provider: additionalData.provider || 'email',
    lastLogin: now,
    status: 'active'
  };

  if (!userDoc.exists()) {
    // New user
    const newUserData = {
      ...baseData,
      phone: additionalData.phone || '',
      businessName: additionalData.businessName || '',
      businessType: additionalData.businessType || '',
      websiteGoal: additionalData.websiteGoal || '',
      role: 'customer',
      referralCode: additionalData.referralCode || '',
      createdAt: now,
      createdVia: additionalData.provider || 'email'
    };
    await setDoc(userRef, newUserData);
    return { isNew: true, data: newUserData };
  } else {
    // Existing user
    await updateDoc(userRef, {
      lastLogin: now,
      status: 'active'
    });
    const existingData = userDoc.data();
    return { isNew: false, data: existingData };
  }
}

// ============================================================
// REDIRECT BASED ON ROLE
// ============================================================

function redirectToDashboard(userData) {
  const role = userData?.role || 'customer';
  if (role === 'admin') {
    window.location.href = 'admin-dashboard.html';
  } else {
    window.location.href = 'customer-dashboard.html';
  }
}

// ============================================================
// LOGIN WITH EMAIL / PASSWORD
// ============================================================

async function loginWithEmail(email, password, remember = false) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update lastLogin in Firestore
    await createOrUpdateUser(user, { provider: 'email' });
    
    // Get user data for role
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? userDoc.data() : { role: 'customer' };
    
    showMessage(loginMessage, '✅ Login successful! Redirecting…', false);
    setTimeout(() => {
      redirectToDashboard(userData);
    }, 800);
    
    return { success: true, user, userData };
  } catch (error) {
    showMessage(loginMessage, getErrorMessage(error), true);
    return { success: false, error };
  }
}

// ============================================================
// SIGNUP WITH EMAIL / PASSWORD
// ============================================================

async function signupWithEmail(email, password, userData) {
  try {
    // Validate password strength
    if (!validatePassword(password)) {
      showMessage(signupMessage, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.', true);
      return { success: false };
    }

    // Check if user already exists (pre-check)
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        showMessage(signupMessage, 'Account already exists. Please sign in.', true);
        return { success: false };
      }
    } catch (e) {
      // Continue with signup if query fails
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save to Firestore
    await createOrUpdateUser(user, {
      ...userData,
      provider: 'email',
      name: userData.name || '',
      phone: userData.phone || '',
      businessName: userData.businessName || '',
      businessType: userData.businessType || '',
      websiteGoal: userData.websiteGoal || '',
      referralCode: userData.referralCode || ''
    });

    // Get user data for role
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const userDocData = userDoc.exists() ? userDoc.data() : { role: 'customer' };

    showMessage(signupMessage, '✅ Account created! Redirecting…', false);
    setTimeout(() => {
      redirectToDashboard(userDocData);
    }, 800);

    return { success: true, user, userData: userDocData };
  } catch (error) {
    showMessage(signupMessage, getErrorMessage(error), true);
    return { success: false, error };
  }
}

// ============================================================
// SOCIAL LOGIN / SIGNUP
// ============================================================

async function socialLogin(provider, isSignup = false, additionalData = {}) {
  const messageElement = isSignup ? signupMessage : loginMessage;
  const buttonElement = isSignup ? signupBtn : loginBtn;
  
  try {
    let authProvider;
    let providerName = 'social';
    
    if (provider === 'google') {
      authProvider = new GoogleAuthProvider();
      providerName = 'google';
    } else if (provider === 'facebook') {
      authProvider = new FacebookAuthProvider();
      providerName = 'facebook';
    } else if (provider === 'github') {
      authProvider = new GithubAuthProvider();
      providerName = 'github';
    } else if (provider === 'microsoft') {
      authProvider = new OAuthProvider('microsoft.com');
      providerName = 'microsoft';
    } else {
      throw new Error('Unsupported provider');
    }

    const result = await signInWithPopup(auth, authProvider);
    const user = result.user;

    // Create or update user in Firestore
    const userData = await createOrUpdateUser(user, {
      ...additionalData,
      provider: providerName,
      name: user.displayName || additionalData.name || '',
      phone: additionalData.phone || '',
      businessName: additionalData.businessName || '',
      businessType: additionalData.businessType || '',
      websiteGoal: additionalData.websiteGoal || '',
      referralCode: additionalData.referralCode || ''
    });

    // Get user data for role
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const userDocData = userDoc.exists() ? userDoc.data() : { role: 'customer' };

    showMessage(messageElement, `✅ Signed in with ${providerName}! Redirecting…`, false);
    setTimeout(() => {
      redirectToDashboard(userDocData);
    }, 800);

    return { success: true, user, userData: userDocData };
  } catch (error) {
    showMessage(messageElement, getErrorMessage(error), true);
    return { success: false, error };
  }
}

// ============================================================
// FORGOT PASSWORD
// ============================================================

async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent. Check your inbox.' };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
}

// ============================================================
// LOGOUT
// ============================================================

async function logout() {
  try {
    await signOut(auth);
    window.location.href = 'login.html';
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error };
  }
}

// ============================================================
// GET CURRENT USER
// ============================================================

function getCurrentUser() {
  return auth.currentUser;
}

// ============================================================
// CHECK AUTH STATE
// ============================================================

function checkAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : { role: 'customer' };
        callback({ user, userData, isAuthenticated: true });
      } catch (error) {
        console.error('Error fetching user data:', error);
        callback({ user, userData: null, isAuthenticated: true });
      }
    } else {
      callback({ user: null, userData: null, isAuthenticated: false });
    }
  });
}

// ============================================================
// EVENT LISTENERS
// ============================================================

// -------- LOGIN FORM --------
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage(loginMessage);
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    const remember = rememberMe ? rememberMe.checked : false;

    if (!email || !password) {
      showMessage(loginMessage, 'Please enter both email and password.', true);
      return;
    }

    if (!validateEmail(email)) {
      showMessage(loginMessage, 'Please enter a valid email address.', true);
      return;
    }

    setLoading(loginBtn, true);
    await loginWithEmail(email, password, remember);
    setLoading(loginBtn, false);
  });
}

// -------- SIGNUP FORM --------
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage(signupMessage);

    const name = signupName.value.trim();
    const email = signupEmail.value.trim();
    const phone = signupPhone.value.trim();
    const business = businessName.value.trim();
    const type = businessType.value;
    const goal = websiteGoal.value;
    const password = signupPassword.value;
    const confirm = confirmPassword.value;
    const referral = referralCode.value.trim();
    const terms = acceptTerms.checked;

    // Validation
    if (!name) { showMessage(signupMessage, 'Full name is required.', true); return; }
    if (!email || !validateEmail(email)) { showMessage(signupMessage, 'Valid email is required.', true); return; }
    if (!phone || phone.length < 10) { showMessage(signupMessage, 'Valid phone number is required.', true); return; }
    if (!business) { showMessage(signupMessage, 'Business name is required.', true); return; }
    if (!type) { showMessage(signupMessage, 'Please select business category.', true); return; }
    if (!goal) { showMessage(signupMessage, 'Please select website goal.', true); return; }
    if (!password) { showMessage(signupMessage, 'Password is required.', true); return; }
    if (!confirm) { showMessage(signupMessage, 'Please confirm your password.', true); return; }
    if (password !== confirm) { showMessage(signupMessage, 'Passwords do not match.', true); return; }
    if (!terms) { showMessage(signupMessage, 'You must accept Terms & Conditions.', true); return; }

    if (!validatePassword(password)) {
      showMessage(signupMessage, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.', true);
      return;
    }

    const userData = {
      name,
      phone,
      businessName: business,
      businessType: type,
      websiteGoal: goal,
      referralCode: referral,
      provider: 'email'
    };

    setLoading(signupBtn, true);
    await signupWithEmail(email, password, userData);
    setLoading(signupBtn, false);
  });
}

// -------- SOCIAL LOGIN (Login Page) --------
if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', () => socialLogin('google', false));
}
if (facebookLoginBtn) {
  facebookLoginBtn.addEventListener('click', () => socialLogin('facebook', false));
}
if (githubLoginBtn) {
  githubLoginBtn.addEventListener('click', () => socialLogin('github', false));
}
if (microsoftLoginBtn) {
  microsoftLoginBtn.addEventListener('click', () => socialLogin('microsoft', false));
}

// -------- SOCIAL SIGNUP (Signup Page) --------
if (googleSignupBtn) {
  googleSignupBtn.addEventListener('click', async () => {
    const name = signupName?.value.trim() || '';
    const phone = signupPhone?.value.trim() || '';
    const business = businessName?.value.trim() || '';
    const type = businessType?.value || '';
    const goal = websiteGoal?.value || '';
    const referral = referralCode?.value.trim() || '';
    const terms = acceptTerms?.checked || false;

    if (!terms) {
      showMessage(signupMessage, 'You must accept Terms & Conditions.', true);
      return;
    }

    const additionalData = { name, phone, businessName: business, businessType: type, websiteGoal: goal, referralCode: referral };
    await socialLogin('google', true, additionalData);
  });
}
if (facebookSignupBtn) {
  facebookSignupBtn.addEventListener('click', async () => {
    const name = signupName?.value.trim() || '';
    const phone = signupPhone?.value.trim() || '';
    const business = businessName?.value.trim() || '';
    const type = businessType?.value || '';
    const goal = websiteGoal?.value || '';
    const referral = referralCode?.value.trim() || '';
    const terms = acceptTerms?.checked || false;

    if (!terms) {
      showMessage(signupMessage, 'You must accept Terms & Conditions.', true);
      return;
    }

    const additionalData = { name, phone, businessName: business, businessType: type, websiteGoal: goal, referralCode: referral };
    await socialLogin('facebook', true, additionalData);
  });
}
if (githubSignupBtn) {
  githubSignupBtn.addEventListener('click', async () => {
    const name = signupName?.value.trim() || '';
    const phone = signupPhone?.value.trim() || '';
    const business = businessName?.value.trim() || '';
    const type = businessType?.value || '';
    const goal = websiteGoal?.value || '';
    const referral = referralCode?.value.trim() || '';
    const terms = acceptTerms?.checked || false;

    if (!terms) {
      showMessage(signupMessage, 'You must accept Terms & Conditions.', true);
      return;
    }

    const additionalData = { name, phone, businessName: business, businessType: type, websiteGoal: goal, referralCode: referral };
    await socialLogin('github', true, additionalData);
  });
}
if (microsoftSignupBtn) {
  microsoftSignupBtn.addEventListener('click', async () => {
    const name = signupName?.value.trim() || '';
    const phone = signupPhone?.value.trim() || '';
    const business = businessName?.value.trim() || '';
    const type = businessType?.value || '';
    const goal = websiteGoal?.value || '';
    const referral = referralCode?.value.trim() || '';
    const terms = acceptTerms?.checked || false;

    if (!terms) {
      showMessage(signupMessage, 'You must accept Terms & Conditions.', true);
      return;
    }

    const additionalData = { name, phone, businessName: business, businessType: type, websiteGoal: goal, referralCode: referral };
    await socialLogin('microsoft', true, additionalData);
  });
}

// ============================================================
// EXPOSE FUNCTIONS FOR GLOBAL USE
// ============================================================

window.auth = {
  logout,
  getCurrentUser,
  checkAuth,
  resetPassword,
  loginWithEmail,
  signupWithEmail,
  socialLogin,
  createOrUpdateUser
};

// ============================================================
// AUTO-REDIRECT IF ALREADY LOGGED IN (on login/signup pages)
// ============================================================

const isLoginPage = window.location.pathname.includes('login.html') || 
                     window.location.pathname === '/' || 
                     window.location.pathname === '/login';
const isSignupPage = window.location.pathname.includes('signup.html');

// Only check on login/signup pages to avoid loops
if (isLoginPage || isSignupPage) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.exists() ? userDoc.data() : { role: 'customer' };
        redirectToDashboard(userData);
      } catch (error) {
        console.error('Error redirecting:', error);
        // Still redirect even if firestore fails
        window.location.href = 'customer-dashboard.html';
      }
    }
  });
}

console.log('✅ auth.js loaded successfully');
