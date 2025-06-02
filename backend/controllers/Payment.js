  // routes/payment.js
  const express = require("express");
  const router = express.Router();
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const User = require("../models/User");


const PRICE_IDS = {
  starter: {
    tier: 1,
    monthly: "price_1ROclBP79eqFAJArwEPJdwz3",
    yearly: "price_1ROcm4P79eqFAJAryxcpGfLe",
    prices: { monthly: 59, yearly: 500 },
  },
  professional: {
    tier: 2,
    monthly: "price_1ROcn6P79eqFAJAr0P6ehAqv",
    yearly: "price_1ROcq8P79eqFAJArhr4OxyiK",
    prices: { monthly: 99, yearly: 2000 },
  },
};

// Create Checkout Session
exports.createCheckoutSession = async (req, res) => {
  const { planType, billingCycle, userId } = req.body;

  // Validate inputs
  if (!["starter", "professional"].includes(planType)) {
    return res.status(400).json({ error: "Invalid plan type" });
  }
  if (!["monthly", "yearly"].includes(billingCycle)) {
    return res.status(400).json({ error: "Invalid billing cycle" });
  }
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Find user in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check for existing active subscription
    if (user.subscriptionId && user.subscriptionStatus === "active") {
      return res.status(400).json({ 
        error: "User already has an active subscription",
        code: "ACTIVE_SUBSCRIPTION_EXISTS"
      });
    }

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      // Only update stripeCustomerId (no subscription data)
      await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId,
      line_items: [{
        price: PRICE_IDS[planType][billingCycle],
        quantity: 1,
      }],
      subscription_data: {
        metadata: {
          planType,
          billingCycle,
          userId: user._id.toString()
        }
      },
      success_url: `${process.env.Base_User_Url}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.Base_User_Url}/dashboard?checkout=cancel`,
      metadata: {
        userId: user._id.toString(),
        planType,
        billingCycle,
      },
    });

    res.json({ 
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({ 
      error: "Failed to create checkout session",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Verify Payment and Update Subscription
exports.verifySession = async (req, res) => {
  const { sessionId, userId } = req.body;

  if (!sessionId || !userId) {
    return res.status(400).json({ error: "Session ID and User ID are required" });
  }

  try {
    // First try - immediate check
    let session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer", "line_items"]
    });

    // If payment not complete, wait and retry (Stripe might be processing)
    if (session.payment_status !== "paid") {
      await new Promise(resolve => setTimeout(resolve, 2000));
      session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["subscription", "customer", "line_items"]
      });
    }

    // Validate session
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Check metadata in both session and subscription
    const metadataUserId = session.metadata?.userId || session.subscription?.metadata?.userId;
    if (metadataUserId !== userId.toString()) {
      return res.status(403).json({ 
        error: "Unauthorized session access",
        details: `Expected ${userId}, got ${metadataUserId}`
      });
    }

    if (session.payment_status !== "paid") {
      return res.status(402).json({ 
        error: "Payment not completed",
        status: session.payment_status
      });
    }

    if (!session.subscription) {
      return res.status(400).json({ 
        error: "No subscription created",
        sessionStatus: session.status
      });
    }

    // Get subscription details with fallbacks
    const subscription = session.subscription;
    const planType = session.metadata?.planType || subscription.metadata?.planType;
    const billingCycle = subscription.items?.data[0]?.price?.recurring?.interval;

    if (!planType || !billingCycle) {
      return res.status(400).json({
        error: "Could not determine plan details",
        metadata: session.metadata,
        subscriptionMetadata: subscription.metadata
      });
    }

    // Prepare subscription data
    const subscriptionData = {
      subscriptionStatus: subscription.status,
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer.id, // Use customer ID instead of object
      subscriptionId: subscription.id,
      plan: planType,
      billingCycle,
      nextBillingDate: new Date(subscription.current_period_end * 1000),
      lastPaymentDate: new Date(subscription.current_period_start * 1000)
    };

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      subscriptionData,
      { new: true }
    );

    return res.json({
      success: true,
      user: updatedUser,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        plan: planType,
        billingCycle
      }
    });

  } catch (error) {
    console.error("Session verification error:", error);
    return res.status(500).json({ 
      error: "Failed to verify session",
      details: error.message
    });
  }
};
exports.previewSubscriptionChange = async (req, res) => {
  const { userId, newPlanType, billingCycle } = req.body;
  if (!userId || !["starter", "professional"].includes(newPlanType) || !["monthly", "yearly"].includes(billingCycle)) {
    return res.status(400).json({ error: "Invalid input data" });
  }
  try {
    const user = await User.findById(userId);
    if (!user || !user.subscriptionId) {
      return res.status(404).json({ error: "No active subscription found" });
    }
    // Allow upgrades (higher tier or monthly-to-yearly) and downgrades
    const isUpgrade =
      PRICE_IDS[newPlanType].tier > PRICE_IDS[user.plan].tier ||
      (newPlanType === user.plan && billingCycle === "yearly" && user.billingCycle === "monthly");
    const isDowngrade =
      PRICE_IDS[newPlanType].tier < PRICE_IDS[user.plan].tier ||
      (newPlanType === user.plan && billingCycle === "monthly" && user.billingCycle === "yearly");
    const isValidTransition =
      isUpgrade ||
      isDowngrade ||
      (user.plan === "starter" && newPlanType === "professional" && user.billingCycle === "yearly" && billingCycle === "monthly");
    if (!isValidTransition) {
      return res.status(400).json({ error: "Invalid plan transition" });
    }
    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
    const prorationBehavior = isDowngrade ? "none" : "create_prorations";
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: user.stripeCustomerId,
      subscription: user.subscriptionId,
      subscription_items: [
        {
          id: subscription.items.data[0].id,
          price: PRICE_IDS[newPlanType][billingCycle],
        },
      ],
      subscription_proration_behavior: prorationBehavior,
    });
    const prorationDetails = invoice.lines.data.find(line => line.type === "invoiceitem" && line.amount < 0);
    const creditAmount = prorationDetails ? Math.abs(prorationDetails.amount) / 100 : 0;
    const amountDue = invoice.amount_due / 100;
    const remainingCredit = creditAmount > amountDue ? creditAmount - amountDue : 0;
    res.json({
      amountDue,
      creditApplied: creditAmount,
      remainingCredit,
      newPlanType,
      billingCycle,
      newPlanPrice: PRICE_IDS[newPlanType].prices[billingCycle],
      nextBillingDate: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null,
      isDowngrade,
    });
  } catch (error) {
    console.error("Error previewing subscription change:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateSubscription = async (req, res) => {
  const { userId, newPlanType, billingCycle } = req.body;
  if (!userId || !["starter", "professional"].includes(newPlanType) || !["monthly", "yearly"].includes(billingCycle)) {
    return res.status(400).json({ error: "Invalid input data" });
  }
  try {
    const user = await User.findById(userId);
    if (!user || !user.subscriptionId) {
      return res.status(404).json({ error: "No active subscription found" });
    }
    const isUpgrade =
      PRICE_IDS[newPlanType].tier > PRICE_IDS[user.plan].tier ||
      (newPlanType === user.plan && billingCycle === "yearly" && user.billingCycle === "monthly");
    const isDowngrade =
      PRICE_IDS[newPlanType].tier < PRICE_IDS[user.plan].tier ||
      (newPlanType === user.plan && billingCycle === "monthly" && user.billingCycle === "yearly");
    const isValidTransition =
      isUpgrade ||
      isDowngrade ||
      (user.plan === "starter" && newPlanType === "professional" && user.billingCycle === "yearly" && billingCycle === "monthly");
    if (!isValidTransition) {
      return res.status(400).json({ error: "Invalid plan transition" });
    }
    const subscription = await stripe.subscriptions.retrieve(user.subscriptionId);
    const prorationBehavior = isDowngrade ? "none" : "always_invoice";
    const updateData = {
      items: [
        {
          id: subscription.items.data[0].id,
          price: PRICE_IDS[newPlanType][billingCycle],
        },
      ],
      proration_behavior: prorationBehavior,
      payment_behavior: "allow_incomplete",
      metadata: { planType: newPlanType },
    };
    if (user.trialEnd && user.trialEnd > new Date()) {
      updateData.trial_end = "now"; // End trial for upgrades
    }
    const updatedSubscription = await stripe.subscriptions.update(user.subscriptionId, updateData);
    const updateFields = {
      subscriptionStatus: updatedSubscription.status,
      nextBillingDate: updatedSubscription.current_period_end
        ? new Date(updatedSubscription.current_period_end * 1000)
        : null,
    };
    if (isDowngrade) {
      // Schedule downgrade for next billing cycle
      updateFields.pendingPlan = newPlanType;
      updateFields.pendingBillingCycle = billingCycle;
    } else {
      // Apply upgrade immediately
      updateFields.plan = newPlanType;
      updateFields.billingCycle = billingCycle;
      updateFields.pendingPlan = null;
      updateFields.pendingBillingCycle = null;
      updateFields.subscribedDate = user.subscribedDate || new Date();
    }
    await User.updateOne({ _id: userId }, updateFields);
    res.json({ message: isDowngrade ? "Downgrade scheduled successfully" : "Subscription updated successfully" });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const user = await User.findById(userId);
    if (!user || !user.subscriptionId) {
      return res.status(404).json({ error: "No active subscription found" });
    }
    await stripe.subscriptions.cancel(user.subscriptionId);
    await User.updateOne(
      { _id: userId },
      {
        subscriptionStatus: "canceled",
        subscriptionId: null,
        plan: null,
        billingCycle: null,
        trialEnd: null,
        nextBillingDate: null,
        pendingPlan: null,
        pendingBillingCycle: null,
      }
    );
    res.json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.reactivateSubscription = async (req, res) => {
  const { userId, planType, billingCycle } = req.body;
  if (!userId || !["starter", "professional"].includes(planType) || !["monthly", "yearly"].includes(billingCycle)) {
    return res.status(400).json({ error: "Invalid input data" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.subscriptionId && user.subscriptionStatus !== "canceled") {
      return res.status(400).json({ error: "User already has an active subscription" });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: user.stripeCustomerId,
      line_items: [
        {
          price: PRICE_IDS[planType][billingCycle],
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        trial_settings: {
          end_behavior: {
            missing_payment_method: "cancel",
          },
        },
      },
      success_url: `${process.env.Base_User_Url}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.Base_User_Url}/dashboard?checkout=cancel`,
      metadata: {
        userId: user._id.toString(),
        planType,
      },
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createCustomerPortalSession = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: "User or Stripe customer not found" });
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.Base_User_Url}/dashboard?returnFromPortal=true
`,
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      "whsec_159MdofIxvIzJIdsx4uMiANY1IEQi9Ka"
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Received event type:", event.type);

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      console.log("Processing subscription event:", event.type);
      const subscription = event.data.object;
      console.log("Subscription ID:", subscription.id);
      console.log("Price ID:", subscription.items.data[0].price.id);
      console.log("Subscription metadata:", subscription.metadata);

      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      if (!user) {
        console.error("User not found for customer ID:", subscription.customer);
        return res.status(404).json({ error: "User not found" });
      }
      console.log("User found:", user);

      // Map price ID to planType
      const priceId = subscription.items.data[0].price.id;
      let planType = "unknown";
      for (const [plan, config] of Object.entries(PRICE_IDS)) {
        if (config.monthly === priceId || config.yearly === priceId) {
          planType = plan;
          break;
        }
      }
      if (planType === "unknown") {
        console.error("Unknown price ID:", priceId);
      }

      const billingCycle = subscription.items.data[0].price.recurring.interval;
      const updateFields = {
        subscriptionStatus: subscription.status,
        subscriptionId: subscription.id,
        plan: planType,
        billingCycle,
      };

      if (user.plan === "trial") {
        updateFields.trialStartedAt = null;
        updateFields.trialEndsAt = null;
        updateFields.hasUsedTrial = true;
      }

      console.log("Update fields:", updateFields);
      const result = await User.updateOne({ _id: user._id }, updateFields);
      console.log("Update result:", result);

      if (result.modifiedCount === 0) {
        console.warn("No fields updated for user:", user._id);
        const updatedUser = await User.findOne({ _id: user._id });
        console.log("Current user in DB:", updatedUser);
      } else {
        console.log(`Updated user ${user._id} with subscription data`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const deletedSubscription = event.data.object;
      const user = await User.findOne({ stripeCustomerId: deletedSubscription.customer });

      if (user) {
        const result = await User.updateOne(
          { _id: user._id },
          {
            subscriptionStatus: "canceled",
            subscriptionId: null,
            plan: null,
            billingCycle: null,
          }
        );
        console.log(`Canceled subscription for user ${user._id}`, result);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const user = await User.findOne({ stripeCustomerId: invoice.customer });

      if (user) {
        const result = await User.updateOne(
          { _id: user._id },
          {
            subscriptionStatus: "past_due",
            lastPaymentError: invoice.last_payment_error?.message || "Payment failed",
          }
        );
        console.log(`Payment failed for user ${user._id}`, result);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

exports.startTrial = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId in request body' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.hasUsedTrial) {
      return res.status(400).json({ error: 'Trial already used' });
    }

    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    user.trialStartedAt = now;
    user.trialEndsAt = trialEndsAt;
    user.hasUsedTrial = true;
    user.plan = 'trial';
    user.billingCycle = 'month';

    await user.save();

    res.status(200).json({ message: 'Trial started', user });
  } catch (error) {
    console.error('Start trial error:', error);
    res.status(500).json({ error: 'Server error while starting trial' });
  }
};
