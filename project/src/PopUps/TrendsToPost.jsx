import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  MapPin,
  Languages,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

export const TrendsInputModal = ({
  onClose,
  onContinue,
  onApiResponse,
  initialLanguage,
  setPlatform,
  initialLocation,
}) => {
  const [formData, setFormData] = useState({
    platform: "",
    location: "",
    specificAreas: "",
    postLanguage: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Set initial values from domain data when component mounts
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      postLanguage: initialLanguage || prev.postLanguage,
      location: initialLocation || prev.location,
    }));
  }, [initialLanguage, initialLocation]);

  const platforms = [
    {
      value: "X",
      label: "X (Twitter)",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
    },
    {
      value: "Instagram",
      label: "Instagram",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
    },
    {
      value: "Facebook",
      label: "Facebook",
      logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    },
    {
      value: "LinkedIn",
      label: "LinkedIn",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.platform) {
      toast.error("Please select a platform to analyze trends.");
      return;
    }
    setPlatform(formData.platform);
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://social-api-107470285539.us-central1.run.app/trends-to-post",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform: formData.platform.toLowerCase(),
            language: formData.postLanguage,
            location: formData.location,
            focus_areas: formData.specificAreas,
          }),
        }
      );
      const result = await response.json();
      if (result.status === "success") {
        onApiResponse(result);
        onContinue(formData);
      } else {
        console.error("API error:", result);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.platform; // Only platform is required

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-[600px] h-[700px] flex flex-col overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="relative px-8 py-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg animate-pulse"
            style={{ animationDelay: "2s" }}
          />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Discover Trending Topics
                </h2>
                <p className="text-white/80 text-sm">
                  Find viral content and hot topics to create engaging posts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Platform Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Languages className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Select Platform
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose the social media platform to analyze trends from
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {platforms.map((platform) => (
                  <button
                    key={platform.value}
                    type="button"
                    onClick={() =>
                      !isLoading &&
                      setFormData((prev) => ({
                        ...prev,
                        platform: platform.value,
                      }))
                    }
                    className={`group relative p-4 text-left rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                      formData.platform === platform.value
                        ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 shadow-lg shadow-green-500/25"
                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                    }`}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-600 p-1.5 flex items-center justify-center shadow-sm">
                        <img
                          src={platform.logo}
                          alt={platform.label}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = platform.value.charAt(0);
                              parent.className +=
                                " text-gray-600 dark:text-gray-300 font-bold text-sm";
                            }
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {platform.label}
                        </div>
                      </div>
                    </div>
                    {formData.platform === platform.value && (
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl" />
                    )}
                  </button>
                ))}
              </div>

              {!formData.platform && (
                <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  Platform selection is required
                </p>
              )}
            </div>

            {/* Post Language */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center">
                  <Languages className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Post Language
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    (Optional)
                  </p>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.postLanguage}
                  onChange={(e) =>
                    !isLoading &&
                    setFormData((prev) => ({
                      ...prev,
                      postLanguage: e.target.value,
                    }))
                  }
                  placeholder="e.g., English, Spanish, French..."
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                  disabled={isLoading}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Languages className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Location Input */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Location
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    (Optional)
                  </p>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    !isLoading &&
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="e.g., United States, London, Global, Brazil, India, New York City..."
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300"
                  disabled={isLoading}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Specific Areas */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Specific Areas{" "}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      (Optional)
                    </span>
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Focus on specific topics, industries, or interests
                  </p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={formData.specificAreas}
                  onChange={(e) =>
                    !isLoading &&
                    setFormData((prev) => ({
                      ...prev,
                      specificAreas: e.target.value,
                    }))
                  }
                  placeholder="e.g., Technology, Business, Entertainment, Sports, Health, Politics, Gaming..."
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 resize-none"
                  rows={3}
                  disabled={isLoading}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {formData.specificAreas.length}/200
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Analysis Settings Preview
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Platform:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.platform || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Post Language:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.postLanguage || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Location:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.location || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Focus Areas:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.specificAreas || "All topics"}
                  </span>
                </div>
              </div>

              {isFormValid && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">
                      Ready to analyze trends!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium"
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
              className={`group relative px-8 py-3 rounded-xl font-semibold flex items-center gap-3 shadow-lg transition-all duration-300 transform ${
                isFormValid && !isLoading
                  ? "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02]"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 opacity-20 rounded-xl" />
              )}
              <TrendingUp className="w-5 h-5 relative z-10" />
              <span className="relative z-10">
                {isLoading ? "Analyzing Trends..." : "Analyze Trends"}
              </span>
              <ArrowRight
                className={`w-5 h-5 relative z-10 transition-transform ${
                  isFormValid && !isLoading ? "group-hover:translate-x-1" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
