import { auth } from "./static/firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

// References to elements
const authButton = document.getElementById("authButton");
const logoutButton = document.getElementById("logoutButton");
const userEmail = document.getElementById("userEmail");
const userInfo = document.getElementById("userInfo");
const Home = document.getElementById("Home");
const Comic = document.getElementById("Comic");
const Buddy = document.getElementById("Buddy");
const comicForm = document.getElementById("comic-form");

// Navigation handlers
authButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

Home.addEventListener("click", () => {
    window.location.href = "main.html";
});

Comic.addEventListener("click", () => {
    window.location.href = "/templates/Comic.html";
});

Buddy.addEventListener("click", () => {
    window.location.href = "/templates/Buddy.html";
});


// Firebase authentication state listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        userEmail.textContent = user.email;
        userInfo.classList.remove("hidden"); // Show user info section
        authButton.classList.add("hidden"); // Hide login/signup button
        logoutButton.classList.remove("hidden"); // Show logout button
    } else {
        userInfo.classList.add("hidden"); // Hide user info section
        authButton.classList.remove("hidden"); // Show login/signup button
        logoutButton.classList.add("hidden"); // Hide logout button
    }
});

// Logout handler
logoutButton.addEventListener("click", async() => {
    try {
        await signOut(auth);
        window.location.href = "main.html"; // Redirect to main page after logout
    } catch (error) {
        console.error("Error during logout:", error.message);
    }
});
