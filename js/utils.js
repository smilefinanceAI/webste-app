// ======================================================
// Smile AI Web Studio
// utils.js
// Global Utility Functions
// ======================================================

"use strict";

// ===============================
// DOM Helpers
// ===============================

export const $ = (selector) => document.querySelector(selector);

export const $$ = (selector) => document.querySelectorAll(selector);

export const byId = (id) => document.getElementById(id);

// ===============================
// Create Element
// ===============================

export function createElement(tag, className = "", html = "") {

    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (html) {
        element.innerHTML = html;
    }

    return element;
}

// ===============================
// Random ID Generator
// ===============================

export function generateId(prefix = "") {

    return (
        prefix +
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8)
    );

}

// ===============================
// Current Date Time
// ===============================

export function currentDate() {

    return new Date();

}

export function currentTimestamp() {

    return Date.now();

}

// ===============================
// Delay
// ===============================

export function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}

// ===============================
// Deep Clone
// ===============================

export function deepClone(data) {

    return JSON.parse(JSON.stringify(data));

}

// ===============================
// Capitalize
// ===============================

export function capitalize(text = "") {

    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1);

  // ======================================================
// Validation Functions
// ======================================================

// Email Validation
export function isValidEmail(email = "") {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email.trim());

}

// Phone Validation (India)
export function isValidPhone(phone = "") {

    const cleaned = phone.replace(/\D/g, "");

    return /^[6-9]\d{9}$/.test(cleaned);

}

// Password Validation
export function isStrongPassword(password = "") {

    return (

        password.length >= 8 &&

        /[A-Z]/.test(password) &&

        /[a-z]/.test(password) &&

        /\d/.test(password) &&

        /[!@#$%^&*(),.?":{}|<>]/.test(password)

    );

}

// Website URL Validation
export function isValidURL(url = "") {

    try {

        new URL(url);

        return true;

    }

    catch {

        return false;

    }

}



// ======================================================
// Formatters
// ======================================================

// Currency
export function formatCurrency(amount = 0) {

    return new Intl.NumberFormat("en-IN", {

        style: "currency",

        currency: "INR",

        maximumFractionDigits: 2

    }).format(amount);

}

// Number
export function formatNumber(number = 0) {

    return new Intl.NumberFormat("en-IN").format(number);

}

// Percentage
export function formatPercent(value = 0) {

    return `${Number(value).toFixed(2)}%`;

}

// File Size
export function formatFileSize(bytes = 0) {

    if (bytes === 0) return "0 Bytes";

    const k = 1024;

    const sizes = [

        "Bytes",

        "KB",

        "MB",

        "GB",

        "TB"

    ];

    const i = Math.floor(

        Math.log(bytes) / Math.log(k)

    );

    return (

        parseFloat(

            (bytes / Math.pow(k, i)).toFixed(2)

        ) +

        " " +

        sizes[i]

    );

}



// ======================================================
// Date Formatter
// ======================================================

export function formatDate(date) {

    if (!date) return "-";

    const d = new Date(date);

    return d.toLocaleDateString(

        "en-IN",

        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }

    );

}

export function formatDateTime(date) {

    if (!date) return "-";

    const d = new Date(date);

    return d.toLocaleString(

        "en-IN"

    );

}

// ======================================================
// Advanced Utility Functions
// ======================================================

// ===============================
// Debounce
// ===============================

export function debounce(callback, delay = 300) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            callback(...args);

        }, delay);

    };

}

// ===============================
// Throttle
// ===============================

export function throttle(callback, delay = 300) {

    let waiting = false;

    return (...args) => {

        if (waiting) return;

        callback(...args);

        waiting = true;

        setTimeout(() => {

            waiting = false;

        }, delay);

    };

}

// ===============================
// Copy To Clipboard
// ===============================

export async function copyToClipboard(text = "") {

    try {

        await navigator.clipboard.writeText(text);

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

}

// ===============================
// Local Storage
// ===============================

export const storage = {

    set(key, value) {

        localStorage.setItem(

            key,

            JSON.stringify(value)

        );

    },

    get(key) {

        const value = localStorage.getItem(key);

        return value ? JSON.parse(value) : null;

    },

    remove(key) {

        localStorage.removeItem(key);

    },

    clear() {

        localStorage.clear();

    }

};

// ===============================
// Session Storage
// ===============================

export const session = {

    set(key, value) {

        sessionStorage.setItem(

            key,

            JSON.stringify(value)

        );

    },

    get(key) {

        const value = sessionStorage.getItem(key);

        return value ? JSON.parse(value) : null;

    },

    remove(key) {

        sessionStorage.removeItem(key);

    },

    clear() {

        sessionStorage.clear();

    }

};

// ===============================
// Query Parameter
// ===============================

export function getQueryParam(name) {

    const params = new URLSearchParams(

        window.location.search

    );

    return params.get(name);

}

// ===============================
// Smooth Scroll
// ===============================

export function scrollToTop() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

export function scrollToElement(selector) {

    const element = document.querySelector(selector);

    if (!element) return;

    element.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}

// ===============================
// UUID Generator
// ===============================

export function uuid() {

    return crypto.randomUUID();

}

// ======================================================
// Production Utility Functions
// ======================================================

// ===============================
// Network Status
// ===============================

export function isOnline() {
    return navigator.onLine;
}

export function onOnline(callback) {
    window.addEventListener("online", callback);
}

export function onOffline(callback) {
    window.addEventListener("offline", callback);
}

// ===============================
// Device Detection
// ===============================

export function isMobile() {
    return window.innerWidth <= 768;
}

export function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

export function isDesktop() {
    return window.innerWidth > 1024;
}

// ===============================
// Browser Detection
// ===============================

export function getBrowser() {

    const ua = navigator.userAgent;

    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Edg")) return "Edge";

    return "Unknown";

}

// ===============================
// Dark Mode
// ===============================

export function enableDarkMode() {

    document.body.classList.add("dark-mode");

    localStorage.setItem(
        "theme",
        "dark"
    );

}

export function disableDarkMode() {

    document.body.classList.remove("dark-mode");

    localStorage.setItem(
        "theme",
        "light"
    );

}

export function loadTheme() {

    const theme =
        localStorage.getItem("theme");

    if (theme === "dark") {

        enableDarkMode();

    } else {

        disableDarkMode();

    }

}

// ===============================
// Fullscreen
// ===============================

export function enterFullscreen(element = document.documentElement) {

    if (element.requestFullscreen) {

        element.requestFullscreen();

    }

}

export function exitFullscreen() {

    if (document.fullscreenElement) {

        document.exitFullscreen();

    }

}

// ===============================
// Download File
// ===============================

export function downloadFile(filename, content) {

    const blob = new Blob(

        [content],

        {

            type: "text/plain"

        }

    );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download = filename;

    a.click();

    URL.revokeObjectURL(url);

}

// ===============================
// Image Preview
// ===============================

export function previewImage(file, imageElement) {

    if (!file || !imageElement) return;

    const reader = new FileReader();

    reader.onload = function (event) {

        imageElement.src =
            event.target.result;

    };

    reader.readAsDataURL(file);

}

// ===============================
// Error Logger
// ===============================

export function logError(error) {

    console.error(

        "[Smile AI]",

        error

    );

}

// ===============================
// Retry Helper
// ===============================

export async function retry(callback, attempts = 3) {

    let lastError;

    for (let i = 0; i < attempts; i++) {

        try {

            return await callback();

        }

        catch (error) {

            lastError = error;

        }

    }

    throw lastError;

}


}
