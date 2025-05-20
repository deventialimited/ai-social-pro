// routes/payment.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");

exports.createCheckoutSession = async (req, res) => {
  const { planType, billingCycle, user } = req.body;
  const PRICE_IDS = {
    starter: {
      monthly: "price_1ROclBP79eqFAJArwEPJdwz3",
      yearly: "price_1ROcm4P79eqFAJAryxcpGfLe",
    },
    professional: {
      monthly: "price_1ROcn6P79eqFAJAr0P6ehAqv",
      yearly: "price_1ROcq8P79eqFAJArhr4OxyiK",
    },
  };

  const priceId = PRICE_IDS[planType][billingCycle];

  try {
    const Isuser = await User.findById(user._id);

    if (!Isuser) {
      return res.status(404).json({ error: "User not found" });
    }

    let customerId = Isuser.stripeCustomerId;
    console.log("Customer ID from DB", customerId);
    // If user doesn't already have a Stripe customer, create one
    if (!customerId) {
      console.log("Creating new Stripe customer");
      const customer = await stripe.customers.create({
        email: Isuser.email,
        name: Isuser.username,
      });

      customerId = customer.id;

      // Save the Stripe customer ID to the user in the DB
      await User.updateOne(
        { _id: Isuser._id },
        { stripeCustomerId: customerId }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId, // <== now reusing this
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.Base_User_Url}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.Base_User_Url}/dashboard?checkout=cancel`,
      metadata: {
        userId: Isuser._id,
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
    const { sessionId, userId } = req.body;
    console.log("Verifying session", sessionId, userId);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const planType = session.metadata?.planType || "unknown";
    const billingCycle =
      session.subscription.items.data[0].price.recurring.interval; // 'month' or 'year'

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionStatus: session.subscription.status,
        stripeCustomerId: session.customer,
        subscriptionId: session.subscription.id,
        plan: planType,
        billingCycle: billingCycle,
      },
      { new: true }
    );
    console.log(updatedUser, "User updated with subscription details");
    res.json({
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error verifying session", error);
    res.status(500).json({ error: error.message });
  }
};
