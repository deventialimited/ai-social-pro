// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { AuthModal } from "../components/AuthModal";
import { Loader2 } from "lucide-react";
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
import toast from "react-hot-toast";
import { useAddDomainMutation } from "../libs/domainService";
import axios from "axios";
//extra
import { AnalyzeLoader } from "../NewUIComponents/LoaderAnimation"; // use the correct named export
import { BusinessSectionDummy } from "../NewUIComponents/businessDumy";
import { BusinessModal } from "../NewUIComponents/Modal";
export function extractDomain(fullUrl) {
  try {
    // Trim whitespace and normalize input
    const trimmedUrl = fullUrl.trim();
    const normalized = trimmedUrl.startsWith("http")
      ? trimmedUrl
      : `https://${trimmedUrl}`;
    const urlObj = new URL(normalized);
    console.log("Extracted domain:", urlObj.hostname); // Debug log
    return urlObj.hostname;
  } catch (err) {
    console.error("Error extracting domain:", err.message); // Debug log
    return null;
  }
}

export const HomePage = () => {
  const { setIsSignInPopup, isSignUpPopup, isSignInPopup, setIsSignUpPopup } =
    useAuthStore();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBusinessPopup, setShowBusinessPopup] = useState(false);
  const [clientData, setClientData] = useState({
    client_email: "",
    clientWebsite: "",
    clientName: "",
    clientDescription: "",
    industry: "",
    niche: "",
    colors: [],
    language: "",
    country: "",
    state: "",
    siteLogo: "",
    userId: "",
    marketingStrategy: {
      audience: [],
      audiencePains: [],
      core_values: [],
    },
  });
  //extra
  const [isModalOpen, setisModalOpen] = useState(false);
  const navigate = useNavigate();
  const addDomain = useAddDomainMutation();
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateCompanyData = async (domain, user) => {
    try {
      if (!domain) {
        throw new Error("Invalid domain extracted from URL.");
      }

      console.log("Generating data for domain:", domain); // Debug log
      const firstResponse = await axios.post(
        "https://social-api-107470285539.us-central1.run.app/create-client",
        {
          user_email: user?.email,
          client_Website: domain,
        }
      );
      console.log("first res message:", firstResponse.data.message); // Debug log
      if (firstResponse.data.message == "Client already exists") {
        console.error("Error in first API response:", firstResponse.status); // Debug log
        toast.error(`Try another website`);
        setisModalOpen(false);
        return;
      }

      await sleep(5000);

      const Data = firstResponse.data;

      console.log("first API response  data:", Data); // Debug log
      const { client_email, clientWebsite, clientDescription } = Data;

      if (!client_email || !clientWebsite || !clientDescription) {
        if (!client_email) toast.error("Client email is required.");
        if (!clientWebsite) toast.error("Client website is required.");
        if (!clientDescription) toast.error("Client description is required.");
        return;
      }

      const result = await addDomain.mutateAsync({
        ...Data,
        userId: user?._id,
      });
      console.log("result:", result); // Debug log

      // setClientData({
      //   client_email: result?.client_email,
      //   clientWebsite: result.clientWebsite,
      //   clientName:
      //     result.clientName || "Not provided,, setted null in the home jsx", // Providing defaults if not available
      //   clientDescription:
      //     result.clientDescription ||
      //     "Not provided setted null in the home jsx",
      //   industry: result.industry || "General setted null in the home jsx",
      //   niche: result.niche || "General setted null in the home jsx",
      //   colors: result.colors || ["#6B818C"],
      //   language: result.language || "English setted null in the home jsx",
      //   country: result.country || "Worldwide setted null in the home jsx",
      //   state: result.state || "Unknown setted null in the home jsx",
      //   userId: result.userId || "setted null in the home jsx",
      //   siteLogo: result.siteLogo,
      //   marketingStrategy: Data.marketingStrategy || {
      //     audience: [],
      //     audiencePains: [],
      //     core_values: [],
      //   },
      // });

      setClientData({
        id:result?._id,
        client_email: result?.client_email || "dummy data",
        clientWebsite: result?.clientWebsite || "dummy site",
        clientName: result?.clientName || "dummy ",
        clientDescription: result?.clientDescription || "dummy",
        industry: result?.industry || "dumy",
        niche: result?.niche || "dummy",
        colors: result.colors,
        language: result?.language || "Dummy",
        country: result?.country || "dummy",
        state: result?.state || "dummy",
        userId: result?.userId || "dummy set",
        siteLogo: result?.siteLogo || "",
        marketingStrategy: {
          audience: Array.isArray(result?.marketingStrategy?.audience)
            ? result.marketingStrategy.audience
            : Array.isArray(Data?.marketingStrategy?.audience)
            ? Data.marketingStrategy.audience
            : [],
          audiencePains: Array.isArray(result?.marketingStrategy?.audiencePains)
            ? result.marketingStrategy.audiencePains
            : Array.isArray(Data?.marketingStrategy?.audiencePains)
            ? Data.marketingStrategy.audiencePains
            : [],
          core_values: Array.isArray(result?.marketingStrategy?.core_values)
            ? result.marketingStrategy.core_values
            : Array.isArray(Data?.marketingStrategy?.core_values)
            ? Data.marketingStrategy.core_values
            : [],
        },
      });
      toast.success("Domain successfully added!");
      // navigate(`/dashboard?domainId=${result?._id}`);
    } catch (error) {
      console.error("Error in generateCompanyData:", error);
      toast.error(error || "Failed to generate company data.");
    }
  };

  const handleSubmit = async (e) => {
    // setisModalOpen(true);
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    if (!url) {
      toast.error("Please enter a URL.");
      return;
    }

    const domain = extractDomain(url);
    console.log("Domain after extraction:", domain); // Debug log

    if (!domain) {
      toast.error("Please enter a valid URL (e.g., binance.com).");
      return;
    }

    if (user) {
      setisModalOpen(true);
      await generateCompanyData(domain, user);
    } else {
      setIsSignInPopup(true);
    }
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
              {localStorage?.getItem("user") && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
              )}
              {!localStorage?.getItem("user") && (
                <>
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
                </>
              )}
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
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="your-website.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white rounded-xl transition-opacity flex items-center gap-2 text-lg font-medium shadow-lg shadow-blue-500/20 whitespace-nowrap"
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

      {(isSignInPopup || isSignUpPopup) && <AuthModal />}

      <BusinessModal
        isOpen={isModalOpen}
        clientData={clientData}
        onClose={() => {}}
      />
    </div>
  );
};
