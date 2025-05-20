import React, { useEffect } from "react";
import { verifyPayment } from "../libs/paymentService";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

export const SuccessPopup = ({ onClose }) => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId)
        .then((data) => {
          console.log("Payment verified:", data);
          toast.success("Payment verified successfully!");
          const updatedUserData = data.user;
          localStorage.setItem("user", JSON.stringify(updatedUserData));
        })
        .catch((err) => {
          console.error("Verification failed:", err);
          toast.error("Payment verification failed");
        });
    }
  }, [sessionId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-green-500">
            Payment Successful!
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        <p className="mb-4">
          Thank you for subscribing. Your account has been upgraded.
        </p>
        <button
          onClick={onClose}
          className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};
