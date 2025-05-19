const express = require("express");
const router = express.Router();
const {
  createCheckoutSession,
  verifySession,
} = require("../controllers/Payment");
router.post("/createCheckoutSession", createCheckoutSession);
router.post("/verify-session", verifySession);
module.exports = router;