import React, { useState, useEffect } from "react";
import { createCustomerPortalSession } from "../libs/paymentService";
import toast from "react-hot-toast";

export default function SubscriptionManagement() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  const openCustomerPortal = async () => {
    try {
      const { url } = await createCustomerPortalSession(user._id);
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to open customer portal");
    }
  };

  if (!user) return <div>Loading...</div>;

  const isTrial = user.plan === "trial";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Manage Subscription</h2>
      <div className="mt-4 border rounded-lg p-4">
        <h3 className="text-lg font-semibold">Subscription Details</h3>
        <p>Plan: {user.plan || "None"}</p>
        <p>Status: {user.subscriptionStatus || "Inactive"}</p>
        <p>Billing Cycle: {user.billingCycle || "N/A"}</p>
      </div>

      {!isTrial && (
        <div className="mt-6">
          <button
            onClick={openCustomerPortal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Open Customer Portal
          </button>
        </div>
      )}
    </div>
  );
}
