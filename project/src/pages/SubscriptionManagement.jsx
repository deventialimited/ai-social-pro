import React, { useState, useEffect } from "react";
import {
  cancelSubscription,
  updateSubscription,
  createCustomerPortalSession,
  previewSubscriptionChange,
  reactivateSubscription,
} from "../libs/paymentService";
import toast from "react-hot-toast";

export default function SubscriptionManagement() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const handlePreview = async (newPlanType, billingCycle) => {
    setLoading(true);
    try {
      const data = await previewSubscriptionChange(user._id, newPlanType, billingCycle);
      setPreview(data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to preview upgrade");
    }
    setLoading(false);
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await updateSubscription(user._id, preview.newPlanType, preview.billingCycle);
      toast.success("Subscription upgraded successfully");
      const updatedUser = { ...user, plan: preview.newPlanType, billingCycle: preview.billingCycle };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setPreview(null);
    } catch (error) {
      toast.error("Failed to upgrade subscription");
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelSubscription(user._id);
      toast.success("Subscription canceled");
      const updatedUser = {
        ...user,
        subscriptionStatus: "canceled",
        plan: null,
        subscriptionId: null,
        billingCycle: null,
        trialEnd: null,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setShowCancelConfirm(false);
    } catch (error) {
      toast.error("Failed to cancel subscription");
    }
    setLoading(false);
  };

  const handleReactivate = async (planType, billingCycle) => {
    setLoading(true);
    try {
      const { url } = await reactivateSubscription(user._id, planType, billingCycle);
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to reactivate subscription");
    }
    setLoading(false);
  };

  const openCustomerPortal = async () => {
    try {
      const { url } = await createCustomerPortalSession(user._id);
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to open customer portal");
    }
  };

  if (!user) return <div>Loading...</div>;

  const upgradeOptions = [];
  if (user.plan === "starter") {
    if (user.billingCycle === "monthly") {
      upgradeOptions.push({ planType: "starter", billingCycle: "yearly", label: "Starter (Yearly)" });
      upgradeOptions.push({ planType: "professional", billingCycle: "monthly", label: "Professional (Monthly)" });
      upgradeOptions.push({ planType: "professional", billingCycle: "yearly", label: "Professional (Yearly)" });
    } else if (user.billingCycle === "yearly") {
      upgradeOptions.push({ planType: "professional", billingCycle: "monthly", label: "Professional (Monthly)" });
      upgradeOptions.push({ planType: "professional", billingCycle: "yearly", label: "Professional (Yearly)" });
    }
  } else if (user.plan === "professional" && user.billingCycle === "monthly") {
    upgradeOptions.push({ planType: "professional", billingCycle: "yearly", label: "Professional (Yearly)" });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Manage Subscription</h2>
      <div className="mt-4 border rounded-lg p-4">
        <h3 className="text-lg font-semibold">Subscription Details</h3>
        <p>Plan: {user.plan || "None"}</p>
        <p>Status: {user.subscriptionStatus || "Inactive"}</p>
        <p>Billing Cycle: {user.billingCycle || "N/A"}</p>
        {user.trialEnd && user.subscriptionStatus === "trialing" && (
          <div className="mt-2 p-2 bg-yellow-100 rounded">
            <p>Trial ends on {new Date(user.trialEnd).toLocaleDateString()}</p>
            <button
              onClick={openCustomerPortal}
              className="mt-1 text-blue-500 underline"
            >
              Add Payment Method
            </button>
          </div>
        )}
        {user.subscriptionStatus === "past_due" && (
          <div className="mt-2 p-2 bg-red-100 rounded">
            <p>Payment failed: {user.lastPaymentError || "Please update your payment method."}</p>
            <button
              onClick={openCustomerPortal}
              className="mt-1 text-blue-500 underline"
            >
              Update Payment Method
            </button>
          </div>
        )}
        {(user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing") && (
          <>
            {upgradeOptions.length > 0 && (
              <div className="mt-4 space-x-2">
                {upgradeOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handlePreview(option.planType, option.billingCycle)}
                    disabled={loading}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    Upgrade to {option.label}
                  </button>
                ))}
              </div>
            )}
            {preview && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <p>Upgrading to {preview.newPlanType} ({preview.billingCycle})</p>
                <p>New Plan Price: ${preview.newPlanPrice.toFixed(2)}/{preview.billingCycle}</p>
                <p>Credit from Unused Time: ${preview.creditApplied.toFixed(2)}</p>
                <p>Amount Due Now: ${preview.amountDue.toFixed(2)}</p>
                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Confirm Upgrade
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="mt-2 ml-2 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={loading}
              className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Cancel Subscription
            </button>
            {showCancelConfirm && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <p>Are you sure you want to cancel? You’ll lose access at the end of the billing period.</p>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="mt-2 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  {loading ? "Canceling..." : "Confirm Cancel"}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="mt-2 ml-2 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
                >
                  Nevermind
                </button>
              </div>
            )}
            <button
              onClick={openCustomerPortal}
              disabled={loading}
              className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Manage Billing
            </button>
          </>
        )}
        {user.subscriptionStatus === "canceled" && (
          <div className="mt-4">
            <button
              onClick={() => handleReactivate("starter", "monthly")}
              disabled={loading}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Reactivate Subscription (Starter, Monthly)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}