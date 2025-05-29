import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyPayment } from "../libs/paymentService";

export const SuccessPopup = ({ onClose }) => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) {
        toast.error("User not logged in");
        setLoading(false);
        return;
      }
      verifyPayment(sessionId, storedUser._id)
        .then((data) => {
          console.log("Payment verified:", data);
          toast.success("Payment verified successfully!");
          const updatedUserData = data.user;
          localStorage.setItem("user", JSON.stringify(updatedUserData));
          setUser(updatedUserData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Verification failed:", err);
          toast.error("Payment verification failed");
          setLoading(false);
        });
    }
  }, [sessionId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-green-500">
            {loading ? "Verifying Payment..." : "Payment Successful!"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        {!loading && user && (
          <>
            <p className="mb-4">
              Thank you for subscribing. Your account has been upgraded.
              {user.trialEnd && (
                <span>
                  {" "}
                  Your 14-day free trial ends on{" "}
                  {new Date(user.trialEnd).toLocaleDateString()}.
                </span>
              )}
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Continue to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};