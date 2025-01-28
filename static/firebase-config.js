// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC18tEaCRGdLcazYrOV-hOTh5xMOk9xGqs",
    authDomain: "sample-app-26111.firebaseapp.com",
    projectId: "sample-app-26111",
    storageBucket: "sample-app-26111.appspot.com",
    messagingSenderId: "868442822428",
    appId: "1:868442822428:web:99c12bd61c8668c4204cd9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
