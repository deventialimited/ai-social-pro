import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { verifyPayment } from "../libs/paymentService";

export default function StripeSuccess() {
  const [searchParams] = useSearchParams(); // ✅ Destructure the first element
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId)
        .then((data) => {
          console.log("Payment verified:", data);
          // Update user state or redirect
        })
        .catch((err) => console.error("Verification failed:", err));
    }
  }, [sessionId]);

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl font-extrabold text-green-600 mb-4">
        Payment Successful!
      </h1>
      <p className="text-lg text-gray-600">
        Thank you for subscribing. Your account has been upgraded.
      </p>
      <div className="mt-10">
        <a
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
