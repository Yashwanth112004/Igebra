import { auth } from "/static/firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

// Get references to the elements
const authButton = document.getElementById("authButton");
const logoutButton = document.getElementById("logoutButton");
const userEmail = document.getElementById("userEmail");
const userInfo = document.getElementById("userInfo");
const Home = document.getElementById("Home");
const Comic = document.getElementById("Comic");
const Buddy = document.getElementById("Buddy");

// Function to handle comic form submission
const handleComicFormSubmit = async(event) => {
    event.preventDefault();

    // Get input values
    const topic = document.getElementById("topic").value;
    const targetAudience = document.getElementById("target_audience").value;
    const objective = document.getElementById("objective").value;

    try {
        const response = await fetch("/generate_comic", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ topic, target_audience: targetAudience, objective }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to generate comic.");
        }

        const data = await response.json();

        // Display the script and PDF link
        const scriptOutput = document.getElementById("comic-script");
        const downloadLink = document.getElementById("download-link");

        scriptOutput.textContent = data.script;
        downloadLink.href = data.pdf_url;
        downloadLink.style.display = "block";
        document.querySelector(".result").classList.remove("hidden");
    } catch (error) {
        console.error("Error:", error);
        alert(`Error: ${error.message}`);
    }
};

// Function to handle authentication state changes
const handleAuthStateChange = (user) => {
    if (user) {
        // User is logged in
        userEmail.textContent = user.email;
        userInfo.classList.remove("hidden"); // Show user info section
        authButton.classList.add("hidden"); // Hide login/signup button
        logoutButton.classList.remove("hidden"); // Show logout button
    } else {
        // User is logged out
        userInfo.classList.add("hidden"); // Hide user info section
        authButton.classList.remove("hidden"); // Show login/signup button
        logoutButton.classList.add("hidden"); // Hide logout button
    }
};

// Function to handle logout
const handleLogout = async() => {
    try {
        await signOut(auth);
        window.location.href = "main.html"; // Redirect to the main page after logout
    } catch (error) {
        console.error("Error during logout:", error.message);
    }
};

// Navigation event handlers
const handleNavigation = (url) => {
    window.location.href = url;
};

// Add event listeners after DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
    // Form submission listener
    const comicForm = document.getElementById("comic-form");
    if (comicForm) {
        comicForm.addEventListener("submit", handleComicFormSubmit);
    }

    // Navigation button listeners
    if (Home) Home.addEventListener("click", () => handleNavigation("main.html"));
    if (Comic) Comic.addEventListener("click", () => handleNavigation("/templates/Comic.html"));
    if (Buddy) Buddy.addEventListener("click", () => handleNavigation("/templates/Buddy.html"));

    // Login/Signup button
    if (authButton) authButton.addEventListener("click", () => handleNavigation("index.html"));

    // Logout button
    if (logoutButton) logoutButton.addEventListener("click", handleLogout);

    // Firebase auth state listener
    onAuthStateChanged(auth, handleAuthStateChange);
});
