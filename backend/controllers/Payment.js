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

exports.createCheckoutSession = async (req, res) => {
  const { planType, billingCycle, user } = req.body;
  if (!["starter", "professional"].includes(planType) || !["monthly", "yearly"].includes(billingCycle)) {
    return res.status(400).json({ error: "Invalid plan type or billing cycle" });
  }
  if (!user || !user._id) {
    return res.status(400).json({ error: "User data is required" });
  }
  try {
    const Isuser = await User.findById(user._id);
    if (!Isuser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (Isuser.subscriptionId && Isuser.subscriptionStatus !== "canceled") {
      return res.status(400).json({ error: "User already has an active subscription" });
    }
    let customerId = Isuser.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: Isuser.email,
        name: Isuser.username,
      });
      customerId = customer.id;
      await User.updateOne({ _id: Isuser._id }, { stripeCustomerId: customerId });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: PRICE_IDS[planType][billingCycle],
          quantity: 1,
        },
      ],
     
      success_url: `${process.env.Base_User_Url}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.Base_User_Url}/dashboard?checkout=cancel`,
      metadata: {
        userId: Isuser._id.toString(),
        planType,
      },
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifySession = async (req, res) => {
  const { sessionId, userId } = req.body;
  if (!sessionId || !userId) {
    return res.status(400).json({ error: "Missing sessionId or userId" });
  }
  try {
    const user = await User.findById(userId);
    if (user.subscriptionId) {
      return res.status(400).json({ error: "Session already processed" });
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    if (session.metadata.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized session" });
    }
    const planType = session.metadata?.planType || "unknown";
    const billingCycle = session.subscription.items.data[0].price.recurring.interval;
    const trialEnd = session.subscription.trial_end ? new Date(session.subscription.trial_end * 1000) : null;
    const nextBillingDate = session.subscription.current_period_end
      ? new Date(session.subscription.current_period_end * 1000)
      : null;
    const subscribedDate = session.subscription.created
      ? new Date(session.subscription.created * 1000)
      : new Date();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionStatus: session.subscription.status,
        stripeCustomerId: session.customer,
        subscriptionId: session.subscription.id,
        plan: planType,
        billingCycle,
        trialEnd,
        nextBillingDate,
        subscribedDate,
      },
      { new: true }
    );
    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Error verifying session:", error);
    res.status(500).json({ error: error.message });
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
      return_url: `${process.env.Base_User_Url}/dashboard`,
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
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      const subscription = event.data.object;
      const user = await User.findOne({ stripeCustomerId: subscription.customer });
      if (user) {
        const planType = subscription.metadata?.planType || user.plan;
        const billingCycle = subscription.items.data[0].price.recurring.interval;
        const updateFields = {
          subscriptionStatus: subscription.status,
          subscriptionId: subscription.id,
          plan: planType,
          billingCycle,
          trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
          nextBillingDate: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
          subscribedDate: user.subscribedDate || new Date(subscription.created * 1000),
        };
        // Apply pending downgrade if billing cycle ended
        if (
          user.pendingPlan &&
          user.pendingBillingCycle &&
          subscription.current_period_end &&
          new Date(subscription.current_period_end * 1000) <= new Date()
        ) {
          updateFields.plan = user.pendingPlan;
          updateFields.billingCycle = user.pendingBillingCycle;
          updateFields.pendingPlan = null;
          updateFields.pendingBillingCycle = null;
        }
        await User.updateOne({ _id: user._id }, updateFields);
        console.log(`Updated user ${user._id} with status ${subscription.status}`);
      }
      break;
    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object;
      await User.updateOne(
        { stripeCustomerId: deletedSubscription.customer },
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
      console.log(`Canceled subscription for customer ${deletedSubscription.customer}`);
      break;
    case "invoice.payment_failed":
      const invoice = event.data.object;
      const userFailed = await User.findOne({ stripeCustomerId: invoice.customer });
      if (userFailed) {
        await User.updateOne(
          { _id: userFailed._id },
          {
            subscriptionStatus: "past_due",
            lastPaymentError: invoice.last_payment_error?.message,
            nextBillingDate: userFailed.nextBillingDate, // Preserve
          }
        );
        console.log(`Payment failed for user ${userFailed._id}: ${invoice.last_payment_error?.message}`);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
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
