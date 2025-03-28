import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { registerUser } from "../libs/authService";
import toast from "react-hot-toast";
export const AuthModal = () => {
  const { setIsSignInPopup, isSignUpPopup, isSignInPopup, setIsSignUpPopup } =
    useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
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
      try {
        const userData = await registerUser(formData.email, formData.password);
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Signup successful!");
      } catch (err) {
        console.error("Signup Error:", err);
        toast.error(err || "Signup failed. Please try again.");
      }
    } else {
      try {
        const userData = await loginUser(formData.email, formData.password);
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Signin successful!");
      } catch (err) {
        console.error("Signin Error:", err);
        toast.error(err || "Signin failed. Please try again.");
      }
    }
  };

  // const handleGoogleLogin = async () => {

  //   try {
  //     // Assuming you get user info from Google OAuth response
  //     const googleUser = {
  //       googleId: "GOOGLE_ID",
  //       name: "User Name",
  //       email: "user@gmail.com",
  //       picture: "profile.jpg",
  //       referral: null,
  //     };

  //     const userData = await googleAuth(
  //       googleUser.googleId,
  //       googleUser.name,
  //       googleUser.email,
  //       googleUser.picture,
  //       googleUser.referral
  //     );
  //     localStorage.setItem("user", JSON.stringify(userData));
  //     toast.success("Google Sign-in successful!");
  //   } catch (error) {
  //     console.error("Google Sign-in Error:", error);
  //     toast.error(error?.error || "Google Sign-in failed. Please try again.");
  //   }
  // };

  return (
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
              onClick={() => {
                setIsSignInPopup(false);
                setIsSignUpPopup(false);
              }}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              // onClick={handleGoogleLogin}
              type="button"
              className="w-full py-2.5 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Continue with Google
              </span>
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
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              {isSignUpPopup ? "Create Account" : "Sign In"}
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
  );
};
