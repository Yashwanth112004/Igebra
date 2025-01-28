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

// Handle comic form submission
comicForm.addEventListener("submit", async(e) => {
    e.preventDefault();

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
        document.getElementById("comic-script").textContent = data.script;
        const downloadLink = document.getElementById("download-link");
        downloadLink.href = data.pdf_url;
        downloadLink.style.display = "block";
        document.querySelector(".result").classList.remove("hidden");
    } catch (error) {
        console.error("Error:", error);
        alert(`Error: ${error.message}`);
    }
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
