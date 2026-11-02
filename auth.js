
import { auth } from "./firebase-config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// ======================================
// DOM ELEMENTS
// ======================================

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const confirmPassword = document.getElementById("confirmPassword");

const logoutBtn = document.getElementById("logoutBtn");

const authMessage = document.getElementById("authMessage");

// ======================================
// SHOW MESSAGE
// ======================================

function showMessage(message, type = "success") {

    if (!authMessage) {
        alert(message);
        return;
    }

    authMessage.textContent = message;

    authMessage.className = "auth-message " + type;

}

// ======================================
// EMAIL VALIDATION
// ======================================

function isValidEmail(email) {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(email);

}

// ======================================
// USER REGISTRATION
// ======================================

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value;
        const confirm = confirmPassword.value;

        if (!name || !email || !password || !confirm) {

            showMessage(
                "Please fill in all fields.",
                "error"
            );

            return;
        }

        if (!isValidEmail(email)) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            return;
        }

        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;
        }

        if (password !== confirm) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;
        }

        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            await updateProfile(
                userCredential.user,
                {
                    displayName: name
                }
            );

            showMessage(
                "Account created successfully!",
                "success"
            );

            registerForm.reset();

            setTimeout(() => {

                window.location.href = "index.html";

            }, 1500);

        } catch (error) {

            showMessage(
                getAuthErrorMessage(error.code),
                "error"
            );

        }

    });

}

// ======================================
// USER LOGIN
// ======================================

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        if (!email || !password) {

            showMessage(
                "Please enter email and password.",
                "error"
            );

            return;
        }

        if (!isValidEmail(email)) {

            showMessage(
                "Please enter a valid email.",
                "error"
            );

            return;
        }

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            showMessage(
                "Login successful!",
                "success"
            );

            loginForm.reset();

            setTimeout(() => {

                window.location.href = "index.html";

            }, 1000);

        } catch (error) {

            showMessage(
                getAuthErrorMessage(error.code),
                "error"
            );

        }

    });

}

// ======================================
// USER LOGOUT
// ======================================

if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

        try {

            await signOut(auth);

            localStorage.removeItem("loggedInUser");

            showMessage(
                "Logged out successfully!",
                "success"
            );

            setTimeout(() => {

                window.location.href = "login.html";

            }, 1000);

        } catch (error) {

            showMessage(
                getAuthErrorMessage(error.code),
                "error"
            );

        }

    });

}

// ======================================
// AUTH STATE CHECK
// ======================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        localStorage.setItem(
            "loggedInUser",
            JSON.stringify({
                uid: user.uid,
                name: user.displayName || "Shop Smart User",
                email: user.email
            })
        );

        const profileName =
            document.getElementById("profileName");

        const profileEmail =
            document.getElementById("profileEmail");

        if (profileName) {

            profileName.textContent =
                user.displayName || "Shop Smart User";

        }

        if (profileEmail) {

            profileEmail.textContent =
                user.email || "";

        }

    } else {

        localStorage.removeItem("loggedInUser");

    }

});

// ======================================
// FIREBASE AUTH ERROR HANDLING
// ======================================

function getAuthErrorMessage(errorCode) {

    const errorMessages = {

        "auth/email-already-in-use":
            "This email is already registered.",

        "auth/invalid-email":
            "Invalid email address.",

        "auth/weak-password":
            "Please choose a stronger password.",

        "auth/invalid-credential":
            "Incorrect email or password.",

        "auth/user-not-found":
            "No account found with this email.",

        "auth/wrong-password":
            "Incorrect password.",

        "auth/too-many-requests":
            "Too many attempts. Please try again later.",

        "auth/network-request-failed":
            "Network error. Please check your internet connection."

    };

    return errorMessages[errorCode] ||
        "Something went wrong. Please try again.";

}
