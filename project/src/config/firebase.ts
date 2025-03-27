// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7cjCh5FWe9qHVeMfKr7Bf28bWU_wJLAY",
  authDomain: "ai-social-pro-ce719.firebaseapp.com",
  projectId: "ai-social-pro-ce719",
  storageBucket: "ai-social-pro-ce719.firebasestorage.app",
  messagingSenderId: "629745360416",
  appId: "1:629745360416:web:7bb63943185cf839ffe645",
  measurementId: "G-KZLBR986E6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);