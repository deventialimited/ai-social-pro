import { getAuth,createUserWithEmailAndPassword,GoogleAuthProvider, signInWithEmailAndPassword, signOut, UserCredential,signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc,getDoc } from "firebase/firestore";
import { app } from "../config/firebase";
import { User } from '../types/user';
import { genSalt, hash ,compare} from "bcryptjs";
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore
const provider = new GoogleAuthProvider();


  //Sign Up using Email And Password
  export const signUpWithEmailPassword = async (
    email: string,
    password: string,
  ): Promise<void> => {
    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User:", user);

      // Step 2: Generate a salt
      const saltRounds = 10; // Number of rounds (higher = more secure, but slower)
      const salt = await genSalt(saltRounds); // Generates a random salt

      // Step 3: Hash the password with the salt
      const hashedPassword = await hash(password, salt); // Hash password with salt

      // Step 4: Store user data in Firestore with hashed password
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        password: hashedPassword, // Hashed with salt
        createdAt: new Date(),
      });

    } catch (err: any) {
  console.error("Error:", err.code, err.message);
      // Handle specific Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        alert("This email is already registered. Please use a different email or sign in.");
      } else if (err.code === 'auth/invalid-email') {
        alert("Invalid email format. Please check your email.");
      } else if (err.code === 'auth/weak-password') {
        alert("Password is too weak. It should be at least 6 characters.");
      } else {
        alert(`Signup Failed: ${err.message}`);
      }  }
  };


  //SignInUsingEmailAndPassword
 export const logInWithEmailPassword = async (email: string, password: string): Promise<void> => {
  try {
    console.log("Email:", email, "Password:", password, "from logInWithEmailPassword");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Logged in User:", user);
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      throw new Error("User data not found in Firestore");
    }
    await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
  } catch (err: any) {
    console.error("Error:", err.code, err.message);
    if (err.code === 'auth/wrong-password') {
      alert("Invalid password");
    } else if (err.code === 'auth/user-not-found') {
      alert("User not found");
    } else {
      alert(`Signin Failed: ${err.message}`);
    }
    throw err; // Re-throw to be caught by caller
  }
};

//handle SignUp using Google Id:
export const GoogleSignUp = async () => {
    try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
      console.log("User:", user);
        await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: new Date(),
      });

        } catch (error:any) {
          console.error("Error:", error.code, error.message);
        }
}