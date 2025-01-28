// Import Firebase modules
import { auth, db } from "/static/firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Get reference to the registration form
const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    // Collect input values from the registration form
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const age = document.getElementById('age').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save the user's details to Firestore
        await addDoc(collection(db, "users"), {
            firstName: firstName,
            lastName: lastName,
            age: age,
            email: email,
            uid: user.uid, // Firebase Authentication UID
        });

        // Optionally, redirect the user after successful registration
        window.location.href = "main.html";
    } catch (error) {
        console.error("Error during registration:", error.message);
        alert("Error during registration: " + error.message); // Provide error feedback
    }
});
