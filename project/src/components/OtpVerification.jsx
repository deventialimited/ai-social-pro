// components/OTPVerification.jsx
import React, { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { verifyOtp, sendEmailVerificationOtp } from "../libs/authService"; // Import from authService
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const OTPVerification = ({ email, tempUserData, onClose }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Timer state
  const [resendEnabled, setResendEnabled] = useState(false); // Resend button state
  const [currentToken, setCurrentToken] = useState(tempUserData?.token); // Track current token
  const navigate = useNavigate();

  // Set up the timer based on the token expiration
  useEffect(() => {
    if (currentToken) {
      try {
        const decoded = jwtDecode(currentToken);
        const expirationTime = decoded.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeDifference = Math.floor((expirationTime - currentTime) / 1000);
        setTimeLeft(timeDifference > 0 ? timeDifference : 0);
      } catch (error) {
        console.error("Error decoding token:", error);
        setTimeLeft(0);
        setResendEnabled(true);
      }
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setResendEnabled(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [currentToken]);

  // Format time left as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  };

  // Handle OTP submission
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await verifyOtp(currentToken, otp, "email");
      const { token, user } = response; // Adjust based on your backend response
      localStorage.setItem("token", JSON.stringify(token));
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("OTP verified successfully!");
      onClose(); // Close the modal
      navigate("/"); // Redirect to home page
    } catch (err) {
      console.error("OTP Verification Error:", err);
      toast.error(err || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    try {
      const data = await sendEmailVerificationOtp(email);
      toast.success("OTP resent to your email!");
      const newToken = data?.token; // Assuming the response includes a new token
      if (newToken) {
        setCurrentToken(newToken); // Update the token
        const decoded = jwtDecode(newToken);
        const expirationTime = decoded.exp * 1000;
        const currentTime = Date.now();
        const timeDifference = Math.floor((expirationTime - currentTime) / 1000);
        setTimeLeft(timeDifference > 0 ? timeDifference : 0);
        setResendEnabled(false); // Disable resend until timer expires again
        setOtp(""); // Clear the OTP input
      }
    } catch (error) {
      console.error("Resend OTP Error:", error);
      toast.error(error || "Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-[400px] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Verify OTP
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Enter the OTP sent to {email}
              </p>
            </div>
            
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <form onSubmit={handleOTPSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter 6-digit OTP"
                maxLength={6}
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex justify-between items-center">
              <span>
                Time remaining: <strong>{formatTimeLeft()}</strong>
              </span>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!resendEnabled || loading}
                className={`text-blue-600 dark:text-blue-400 hover:underline font-medium ${
                  !resendEnabled || loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Resend OTP
              </button>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};