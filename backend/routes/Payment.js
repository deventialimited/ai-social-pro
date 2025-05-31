const express = require("express");
const router = express.Router();
const {
  createCheckoutSession,
  verifySession,
  cancelSubscription,
  updateSubscription,
  createCustomerPortalSession,
  handleWebhook,
  reactivateSubscription,
  previewSubscriptionChange,
  startTrial
} = require("../controllers/Payment");
router.post("/createCheckoutSession", createCheckoutSession);
router.post("/verify-session", verifySession);
router.post("/cancel-subscription", cancelSubscription);
router.post("/update-subscription",  updateSubscription);
router.post("/create-portal-session",  createCustomerPortalSession);
router.post("/reactivate-subscription",  reactivateSubscription);
router.post("/preview-subscription-change", previewSubscriptionChange);
router.post("/startTrial", startTrial);

// router.post('/webhook',handleWebhook  )
module.exports = router;