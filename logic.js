// Import Firebase modules
import { auth } from "/static/firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

// Get reference to the login form
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    // Collect input values from the login form
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Sign in the user with email and password
        await signInWithEmailAndPassword(auth, email, password);

        // Redirect to main page after successful login
        window.location.href = "main.html";
    } catch (error) {
        console.error("Error during login:", error.message);
        alert("Error during login: " + error.message);
    }
});
