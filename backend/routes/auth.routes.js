/**
 * Authentication Routes
 */
import express from "express";
import {
  createUserAccount,
  googleAuth,
  loginUser,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Google authentication route
router.post("/google", googleAuth);

// Create account route (requires authentication)
router.post("/signup", createUserAccount);
router.post("/login", loginUser);

export default router;
