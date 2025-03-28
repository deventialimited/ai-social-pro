// @ts-nocheck

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { AuthModal } from "../components/AuthModal";
import {
  Globe,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  LayoutDashboard,
  Calendar,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
//
function extractDomain(fullUrl) {
  try {
    const normalized = fullUrl.startsWith("http")
      ? fullUrl
      : `https://${fullUrl}`;
    return new URL(normalized).hostname;
  } catch (err) {
    console.error("Error extracting domain:", err);
    return null;
  }
}

const generateCompanyData = async (domain) => {
  try {
    // Second API call
    const secondResponse = await fetch(
      `https://hook.us2.make.com/yljp8ebfpmyb7qxusmkxmh89cx3dt5zo?clientWebsite=${domain}`
    );

    if (!secondResponse.ok) {
      throw new Error(
        `Second API call failed with status: ${secondResponse.status}`
      );
    }

    // Parse second response and return
    const secondData = await secondResponse.json();
    // return secondData;
    console.log(secondData);
  } catch (error) {
    console.log("Error in AI App data:", error);
    return null;
  }
};
export const HomePage: React.FC = () => {
  const {setIsSignInPopup,isSignUpPopup,isSignInPopup,setIsSignUpPopup}=useAuthStore()
  const [url, setUrl] = useState("");
  const navigate = useNavigate();
 console.log(isSignInPopup)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = localStorage.getItem("user"); // Check if user exists in localStorage
    if (url) {
      if (user) {
        await generateCompanyData(url);
      } else {
        setIsSignInPopup(true);
      }
    }
    
  };

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="/oneyear-logo.svg"
                alt="OneYear Social"
                className="w-8 h-8"
              />
              <span className="font-semibold text-gray-900 dark:text-white">
                OneYear Social
              </span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setIsSignInPopup(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignUpPopup(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Social Media Content Creation
          </div>

          <div className="space-y-4 mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Your Website to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {" "}
                365 Days{" "}
              </span>
              of Social Posts
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Enter your website URL and let AI create a year's worth of
              engaging social media content, perfectly tailored to your brand
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-website.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2 text-lg font-medium shadow-lg shadow-blue-500/20 whitespace-nowrap"
                >
                  Generate Posts
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-600 dark:text-gray-400">
              {[
                {
                  icon: <Calendar className="w-4 h-4" />,
                  text: "365 days of content",
                },
                {
                  icon: <Zap className="w-4 h-4" />,
                  text: "Generated in minutes",
                },
                {
                  icon: <Shield className="w-4 h-4" />,
                  text: "AI-powered optimization",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {item.icon}
                  {item.text}
                </div>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "Smart Content Creation",
                description:
                  "Our AI analyzes your website and creates engaging posts that match your brand voice",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Year-Round Coverage",
                description:
                  "Get 365 days of social media content generated in just minutes",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Multi-Platform Ready",
                description:
                  "Posts are automatically optimized for each social media platform",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(isSignInPopup||isSignUpPopup) && (
        <AuthModal/>
      )}
    </div>
  );
};
