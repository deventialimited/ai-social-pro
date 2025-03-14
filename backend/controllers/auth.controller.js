/**
 * Authentication Controller
 * Handles user authentication and account creation
 */
import User from "../models/User.model.js"
import {generateToken} from "../config/jwt.js"
import {verifyGoogleToken} from "../utils/googleAuth.js"
import bcrypt from "bcrypt"

/**
 * Create a new user account or return existing one
 * @route GET /api/auth/createAccount
 */
export const createUserAccount = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      displayName: displayName || email.split("@")[0],
      password: hashedPassword,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        displayName: newUser.displayName,
      },
    });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};




export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({ success: true, token, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};




/**
 * Create or authenticate a user with Google
 * @route POST /api/auth/google
 */
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: "Google ID token is required" });
    }

    // Verify the Google token
    const googleUserInfo = await verifyGoogleToken(idToken);

    // Check if user exists in database
    let user = await User.findOne({ email: googleUserInfo.email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        email: googleUserInfo.email,
        googleId: googleUserInfo.googleId,
        displayName: googleUserInfo.displayName,
        createdTime: new Date(),
      });
    } else if (!user.googleId) {
      // Update googleId if user exists but doesn't have one
      user.googleId = googleUserInfo.googleId;
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error("Error in googleAuth:", error);
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
};
