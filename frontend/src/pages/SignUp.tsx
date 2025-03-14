// @ts-nocheck

import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AppContext"; // Adjust this path if different

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const SignUp = () => {
  const navigate = useNavigate();
  const { extendedUser, setExtendedUser } = useAuth();

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://ai-social-pro.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            displayName: formData.displayName,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Store token in localStorage
      localStorage.setItem("authToken", data.token);

      // Update user context
      setExtendedUser(data.user);

      toast.success("Sign Up Successful!");
      navigate("/home");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Sign Up Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#eff5ff] to-[#d1e8ff] p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white p-3 md:p-6 rounded-2xl shadow-2xl max-w-xs md:max-w-md w-full transform transition duration-500 hover:scale-105">
        <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6 text-center text-gray-800">
          Join Us!
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 md:mb-5">
            <label
              htmlFor="displayName"
              className="block text-left mb-1 font-semibold text-gray-700"
            >
              Display Name:
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
              disabled={loading}
            />
          </div>
          <div className="mb-3 md:mb-5">
            <label
              htmlFor="email"
              className="block text-left mb-1 font-semibold text-gray-700"
            >
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
              disabled={loading}
            />
          </div>
          <div className="mb-3 md:mb-5">
            <label
              htmlFor="password"
              className="block text-left mb-1 font-semibold text-gray-700"
            >
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
              disabled={loading}
            />
          </div>
          <div className="mb-3 md:mb-5">
            <label
              htmlFor="confirmPassword"
              className="block text-left mb-1 font-semibold text-gray-700"
            >
              Confirm Password:
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`w-full cursor-pointer py-2 md:py-2.5 bg-[#4f46e5] text-white rounded-lg transition font-bold ${
              loading
                ? "animate-pulse"
                : "bg-gradient-to-r from-[#3b3a9a] to-[#4f46e5] hover:from-[#5a0ea0] hover:to-[#6a55ff]"
            }`}
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <p className="text-gray-600 text-sm mt-4 text-center">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={handleLoginRedirect}
          >
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
