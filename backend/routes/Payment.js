const express = require("express");
const router = express.Router();
const { createCheckoutSession } = require("../controllers/Payment");
router.post("/createCheckoutSession", createCheckoutSession);
module.exports = router;