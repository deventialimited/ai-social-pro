"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const SuccessPage = () => {
  const router = useRouter();
  const { session_id } = router.query;
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [subscription, setSubscription] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;

    if (!session_id || !userId) {
      setStatus("error");
      setMessage("Missing session ID or user information. Please try again.");
      return;
    }

    const verifySession = async () => {
      try {
        const response = await axios.post(
          `http://localhost:4000/api/v1/payment/verify-session`,
          { sessionId: session_id, userId }
        );

        const updatedUser = response.data.user;
        if (!updatedUser) {
          throw new Error("No user data received");
        }

        // Save updated user to localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update subscription info for UI
        setSubscription({
          planType: updatedUser.plan,
          billingCycle: updatedUser.billingCycle,
          status: updatedUser.subscriptionStatus,
          trialEndsAt: updatedUser.trialEndsAt,
          nextBillingDate: updatedUser.nextBillingDate,
        });

        // Set message if session was already processed
        setMessage(response.data.message || "Thank you for subscribing!");

        setStatus("success");

        // Redirect to dashboard after 5 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 5000);
      } catch (error) {
        console.error("Verify session error:", error);
        if (error.response?.data?.error === "User already has an active subscription") {
          setMessage("You already have an active subscription. Redirecting to dashboard...");
          setStatus("success");
          setSubscription({
            planType: user.plan,
            billingCycle: user.billingCycle,
            status: user.subscriptionStatus,
            trialEndsAt: user.trialEndsAt,
            nextBillingDate: user.nextBillingDate,
          });
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        } else if (error.response?.data?.error) {
          setMessage(error.response.data.error);
          setStatus("error");
        } else {
          setMessage("An unexpected error occurred. Please try again.");
          setStatus("error");
        }
      }
    };

    verifySession();
  }, [session_id, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Processing your subscription...
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => router.push("/pricing")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {message.includes("already") ? "Subscription Active" : "Subscription Successful!"}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        {subscription && (
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Plan:</span>
              <span className="font-medium text-gray-800 dark:text-white capitalize">
                {subscription.planType}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Billing:</span>
              <span className="font-medium text-gray-800 dark:text-white capitalize">
                {subscription.billingCycle}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <span className="font-medium text-green-600 dark:text-green-400 capitalize">
                {subscription.status}
              </span>
            </div>
          </div>
        )}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;