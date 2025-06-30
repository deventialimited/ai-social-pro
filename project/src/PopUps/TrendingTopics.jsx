import React, { useState } from "react";
import {
  X,
  TrendingUp,
  ArrowRight,
  Clock,
  Users,
  BarChart3,
  Hash,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const TrendsResultModal = ({
  inputData,
  trendsData,
  onClose,
  onGeneratePost,
}) => {
  const [expandedTrend, setExpandedTrend] = useState(null);

  const getEngagementColor = (engagement) => {
    switch (engagement) {
      case "High":
        return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
      case "Rising":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
      case "Medium":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Fitness":
      case "Business & Technology":
        return "💼";
      case "Entertainment & Pop Culture":
        return "🎭";
      case "Social & Cultural":
      case "Wellness":
        return "🌍";
      case "Lifestyle & Wellness":
        return "🌱";
      default:
        return "📈";
    }
  };

  const toggleExpanded = (trendId) => {
    setExpandedTrend(expandedTrend === trendId ? null : trendId);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-[900px] max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="relative px-8 py-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Trending Topics Analysis
                </h2>
                <p className="text-white/80 text-sm">
                  {inputData.platform} • {inputData.location || "Global"} •{" "}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {trendsData?.length || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Trending Topics
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {trendsData?.filter((t) => t.engagement === "High").length || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                High Engagement
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {trendsData?.filter((t) => t.longevity === "High").length || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Long-term Trends
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {new Set(trendsData?.map((t) => t.category)).size || 0}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Categories
              </div>
            </div>
          </div>
        </div>

        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 280px)" }}
        >
          <div className="space-y-4">
            {trendsData?.map((trend, index) => (
              <div
                key={trend.topic}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-green-500 dark:hover:border-green-400 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {trend.topic}
                        </h3>
                        <span className="text-lg">
                          {getCategoryIcon(trend.category)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getEngagementColor(
                            trend.engagement
                          )}`}
                        >
                          {trend.engagement}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {trend.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onGeneratePost(trend)}
                    className="ml-4 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Post
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Category:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {trend.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Audience:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {trend.audience.split(",")[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Duration:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {trend.longevity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Keywords:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {trend.related_keywords.length}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <button
                    onClick={() => toggleExpanded(trend.topic)}
                    className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                  >
                    {expandedTrend === trend.topic ? (
                      <>
                        Hide Details <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show Details <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {expandedTrend === trend.topic && (
                    <div className="mt-4 space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Related Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {trend.related_keywords.map((keyword, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md text-xs font-medium"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Analysis generated for {inputData.platform} •{" "}
              {inputData.location || "Global"}
              {inputData.specificAreas &&
                ` • Focus: ${inputData.specificAreas}`}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
