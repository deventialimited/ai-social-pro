// routes/payment.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession= async (req, res) => {
  const { planType, billingCycle, userId } = req.body;

  const PRICE_IDS = {
    starter: {
      monthly: "price_123...", // Replace with real Stripe price IDs
      yearly: "price_456...",
    },
    professional: {
      monthly: "price_789...",
      yearly: "price_101...",
    },
  };

  const priceId = PRICE_IDS[planType][billingCycle];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: req.user?.email, // Optional: If logged in user
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      metadata: {
        userId,
        planType,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error", error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = router;
