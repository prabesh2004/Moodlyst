// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB33ybPk8P9nuhT9Lz70X5sJLhnH23qXzU",
  authDomain: "moodlyst-6f5c6.firebaseapp.com",
  projectId: "moodlyst-6f5c6",
  storageBucket: "moodlyst-6f5c6.firebasestorage.app",
  messagingSenderId: "1059819178965",
  appId: "1:1059819178965:web:e624b83293c042d2964b5c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
