// @ts-nocheck

// Make sure this file is imported BEFORE you use anything from it in other components

// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID,
// };

// // 1) Initialize the app
// export const firebaseApp = initializeApp(firebaseConfig);

// 2) Get the Auth instance from the initialized app
// export const auth = getAuth(firebaseApp);



// using to store the editor data -until the munawer wrote down the backemdcode for this 


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyBeIbV8znw8pcDC5h3zib8FZhYtNzoA5YQ",
  authDomain: "social-pro-editor.firebaseapp.com",
  projectId: "social-pro-editor",
  storageBucket: "social-pro-editor.firebasestorage.app",
  messagingSenderId: "158438381285",
  appId: "1:158438381285:web:4c5824e388270ef988660c",
  measurementId: "G-WC00M3M53N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to save post data
export const savePostData = async (postId, data) => {
  try {
    const existingData = await getPostData(postId);
    if (existingData) {
      const newData = { ...existingData, ...data };
      await setDoc(doc(db, "posts", postId), newData, { merge: true });
    } else {
      await setDoc(doc(db, "posts", postId), data);
    }
    console.log("Post data saved successfully");
  } catch (error) {
    console.error("Error saving post data: ", error);
  }
};

// Function to get post data
export const getLatestPostData = async (postId) => {
  try {
    const docRef = doc(db, "posts", postId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document for post ID:", postId);
      return null;
    }
  } catch (error) {
    console.error("Error getting the latest post data for post ID:", postId, error);
    return null;
  }
};

export { db };
