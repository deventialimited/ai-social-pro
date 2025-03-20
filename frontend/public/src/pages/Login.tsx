// @ts-nocheck
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AppContext"; // Assuming you have this context

const Login = () => {
  const navigate = useNavigate();
  const { setExtendedUser } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        "https://ai-social-pro.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token in localStorage instead of cookies
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("displayName", data.user.displayName);

      // Update user context with user data
      setExtendedUser(data.user);

      toast.success("Login successful!");
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Login Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    navigate("/signup");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#eff5ff] to-[#d1e8ff] p-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl max-w-md md:max-w-lg w-full transition duration-500">
        <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-10 text-center text-gray-800">
          Welcome Back!
        </h2>

        <button
          onClick={() => toast.error("Google Sign-In not available")}
          className="mb-6 md:mb-8 w-full py-3 md:py-4 border border-gray-300 text-black rounded-lg flex items-center justify-center hover:bg-gray-100 transition font-bold cursor-pointer"
          disabled={loading}
        >
          <FcGoogle className="w-5 h-5 mr-2" />
          Sign in with Google
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-gray-500">or</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 md:mb-8">
            <label
              htmlFor="email"
              className="block text-left mb-2 font-semibold text-gray-700"
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
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
              disabled={loading}
            />
          </div>
          <div className="mb-6 md:mb-8">
            <label
              htmlFor="password"
              className="block text-left mb-2 font-semibold text-gray-700"
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
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 transition"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 bg-[#4f46e5] text-white rounded-lg transition font-bold cursor-pointer ${
              loading ? "animate-pulse" : "hover:brightness-110"
            }`}
            disabled={loading}
          >
            {loading ? "Loading..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <button
            onClick={handleSignupRedirect}
            className="text-blue-500 hover:text-blue-700 cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
