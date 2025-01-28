// Import Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyC18tEaCRGdLcazYrOV-hOTh5xMOk9xGqs",
    authDomain: "sample-app-26111.firebaseapp.com",
    projectId: "sample-app-26111",
    storageBucket: "sample-app-26111.appspot.com",
    messagingSenderId: "868442822428",
    appId: "1:868442822428:web:99c12bd61c8668c4204cd9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Handle Sign Up form submission
const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const age = document.getElementById('age').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Create a new user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user details in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            firstName: firstName,
            lastName: lastName,
            age: age,
            email: email,
        });

        // Display success message
        const message = document.createElement('div');
        message.textContent = 'Account created successfully!';
        message.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow';
        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
            window.location.href = 'index.html'; // Redirect to login page
        }, 2000);
    } catch (error) {
        console.error('Error:', error.message);
        alert('Error: ' + error.message);
    }
});
