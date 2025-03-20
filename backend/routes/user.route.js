import express from "express";
import {
  getUserData,
  updateUserData,
  getSiteData,
  getUserDomains,
  getLastAddedDomains,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get user data
router.get("/userdata", getUserData);

// Update user data
router.post("/update", updateUserData);

// Get site data for a domain
router.post("/sitedata", protect, getSiteData);
router.get("/userdomains", protect, getUserDomains);
router.get("/lastdomain", protect, getLastAddedDomains);

export default router;
