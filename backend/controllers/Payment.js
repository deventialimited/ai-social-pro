// routes/payment.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  const { planType, billingCycle, userId } = req.body;

  const PRICE_IDS = {
    starter: {
      monthly: "price_1ROclBP79eqFAJArwEPJdwz3", // Replace with real Stripe price IDs
      yearly: "price_1ROcm4P79eqFAJAryxcpGfLe",
    },
    professional: {
      monthly: "price_1ROcn6P79eqFAJAr0P6ehAqv",
      yearly: "price_1ROcq8P79eqFAJArhr4OxyiK",
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
      success_url: `${process.env.Base_User_Url}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.Base_User_Url}/cancel`,
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
};

exports.verifySession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Save to database
    await User.updateOne(
      { _id: req.user.id },
      {
        subscriptionStatus: "active",
        stripeCustomerId: session.customer,
        subscriptionId: session.subscription.id,
      }
    );

    res.json({
      status: session.status,
      subscriptionId: session.subscription.id,
    });
  } catch (error) {
    console.error("Error verifying session", error);
    res.status(500).json({ error: error.message });
  }
};
