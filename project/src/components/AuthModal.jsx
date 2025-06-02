// components/AuthModal.jsx
import React, { useState } from "react";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { registerUser, loginUser } from "../libs/authService";
import { googleAuth } from "../libs/authService";
import toast from "react-hot-toast";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { OTPVerification } from "./OtpVerification"; // Import the new component
import { useNavigate } from "react-router-dom";

export const AuthModal = () => {
  const {
    setIsSignInPopup,
    isSignUpPopup,
    setUser,
    isSignInPopup,
    setIsSignUpPopup,
  } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isGLoading, setIsGLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [showOTP, setShowOTP] = useState(false); // State to toggle OTP component
  const [tempUserData, setTempUserData] = useState(null); // Store temp data for OTP
  const navigate = useNavigate();

  const validateForm = (email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!email) {
      toast.error("Email is required.");
      return false;
    }
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format.");
      return false;
    }
    if (!password) {
      toast.error("Password is required.");
      return false;
    }
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(formData.email, formData.password)) return;

    if (isSignUpPopup) {
      setLoading(true);
      try {
        const userData = await registerUser(
          formData.username,
          formData.email,
          formData.password
        );
        setTempUserData(userData); // Store temp data from backend
        setShowOTP(true); // Show OTP verification component
        toast.success("OTP sent to your email!");
      } catch (err) {
        console.error("Signup Error:", err);
        toast.error(err?.message || "Signup failed. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const userData = await loginUser(formData.email, formData.password);
        localStorage.setItem("token", JSON.stringify(userData?.token));
        setUser(userData?.user);
        toast.success("Signin successful!");
        setIsSignInPopup(false);
        navigate("/"); // Redirect to home after login
      } catch (err) {
        console.error("Signin Error:", err);
        toast.error(err?.message || "Signin failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLoginSuccess = async (tokenResponse) => {
    try {
      setIsGLoading(true);
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }
      );
      const { sub: googleId, name, email, picture } = response.data;
      const data = await googleAuth(googleId, name, email, picture);
      setUser(data?.user);
      toast.success("Google login successful!");
      setIsSignUpPopup(false);
      setIsSignInPopup(false);
      navigate("/"); // Redirect to home
    } catch (error) {
      console.log(error);
      toast.error("Google Auth Failed");
    } finally {
      setIsGLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    toast.error("Google login failed.");
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: handleGoogleLoginError,
  });

  const handleClose = () => {
    setIsSignInPopup(false);
    setIsSignUpPopup(false);
    setShowOTP(false);
  };

  return (
    <>
      {!showOTP ? (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-[400px] overflow-hidden shadow-xl">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isSignUpPopup ? "Create Account" : "Welcome Back"}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {isSignUpPopup
                      ? "Get started with OneYear Social"
                      : "Sign in to your account"}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex flex-wrap items-center justify-center w-full gap-4">
                <button
                  onClick={() => login()}
                  type="button"
                  disabled={isGLoading}
                  className="flex items-center justify-center gap-4 my-4 w-full text-[15px] border py-[7.5px] border-[#d1d0d0ce] rounded-lg px-4 hover:bg-[#74a2df13]"
                >
                  <div className="flex">
                    <img
                      src="/icon-google.svg"
                      alt="Google"
                      className="mr-2"
                      width={22}
                    />
                    Sign in with Google
                  </div>
                  {isGLoading && (
                    <div className="h-5 w-5 border-t border-black dark:border-white animate-spin rounded-full"></div>
                  )}
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUpPopup && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isSignUpPopup ? (
                    "Create Account"
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                {isSignUpPopup
                  ? "Already have an account?"
                  : "Don't have an account?"}{" "}
                <button
                  onClick={() => {
                    if (isSignUpPopup) {
                      setIsSignUpPopup(false);
                      setIsSignInPopup(true);
                    } else {
                      setIsSignUpPopup(true);
                      setIsSignInPopup(false);
                    }
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {isSignUpPopup ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <OTPVerification
          email={formData.email}
          tempUserData={tempUserData}
          onClose={handleClose}
        />
      )}
    </>
  );
};
