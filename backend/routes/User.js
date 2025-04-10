const express = require("express");
const {
  register,
  login,
  googleAuth,
  facebookAuth,
  sendEmailVerificationOtp,
  sendPhoneVerificationOtp,
  setupTwoFactorAuth,
  verifyTwoFactorAuth,
  verifyOtp,
  getAllUsers,
  forgotPassword,
  resetPassword,
  setPassword,
  editProfile,
  updateUserStatus,
  getUserAccountStatus,
  deleteUserByAdmin,
  updateSelectedDomain
} = require("../controllers/User");

const router = express.Router();
const multer = require("multer");

// Configure multer to store files in memory for easy upload to S3
const upload = multer({
  storage: multer.memoryStorage(),
});
// User registration route
router.post("/register", register);

// Email and Phone verification route
router.post("/verify-otp", verifyOtp);

// User login route
router.post("/login", login);

// Google authentication route
router.post("/google-auth", googleAuth);

// Facebook authentication route

// Send email OTP for verification
router.post("/send-email-verification-otp", sendEmailVerificationOtp);

// Send phone OTP for verification
router.post("/send-phone-verification-otp", sendPhoneVerificationOtp);

// Setup two-factor authentication
router.post("/setup-2fa/:id", setupTwoFactorAuth);

// Verify two-factor authentication code
router.post("/verify-2fa", verifyTwoFactorAuth);
//forgot-password
router.post("/forgot-password", forgotPassword);
//reset-password
router.post("/reset-password/:id", resetPassword);
//set-password
router.post("/set-password/:id", setPassword);

//edit profile
router.post("/edit-profile/:id", upload.single("profileImage"), editProfile);
// Get all users
router.get("/", getAllUsers);

router.post("/updateSelectedDomain", updateSelectedDomain);


module.exports = router;
