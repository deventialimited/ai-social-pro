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

export const TrendsResultModal = ({ inputData, onClose, onGeneratePost }) => {
  const [expandedTrend, setExpandedTrend] = useState(null);

  const trendingTopics = [
    {
      id: "trend-1",
      name: "#AIRevolution2024",
      description:
        "Major breakthrough in artificial intelligence with new GPT models and autonomous systems gaining massive attention across tech communities.",
      category: "Business & Technology",
      engagement: "High",
      audience: "Tech professionals, Business leaders",
      longevity: "1 week+",
      insight:
        "Perfect opportunity for tech companies to showcase AI integration and thought leadership content.",
      keywords: [
        "#AI",
        "#Technology",
        "#Innovation",
        "#GPT",
        "#MachineLearning",
      ],
    },
    {
      id: "trend-2",
      name: "Remote Work Evolution",
      description:
        "Companies announcing permanent remote work policies and new digital collaboration tools trending as workplace transformation accelerates.",
      category: "Business & Technology",
      engagement: "Rising",
      audience: "Business professionals, HR leaders",
      longevity: "3 days",
      insight:
        "Great for B2B companies to share remote work solutions and productivity tips.",
      keywords: [
        "#RemoteWork",
        "#DigitalTransformation",
        "#Productivity",
        "#WorkFromHome",
      ],
    },
    {
      id: "trend-3",
      name: "#SustainableFuture",
      description:
        "Climate action initiatives and green technology solutions gaining viral momentum as environmental awareness peaks.",
      category: "Social & Cultural",
      engagement: "High",
      audience: "Millennials, Gen Z, Environmental advocates",
      longevity: "1 week+",
      insight:
        "Ideal for brands to showcase sustainability efforts and eco-friendly practices.",
      keywords: [
        "#Sustainability",
        "#ClimateAction",
        "#GreenTech",
        "#EcoFriendly",
        "#Environment",
      ],
    },
    {
      id: "trend-4",
      name: "Viral Productivity Hack",
      description:
        'New time management technique called "Focus Blocks" spreading rapidly among entrepreneurs and students for enhanced productivity.',
      category: "Lifestyle & Wellness",
      engagement: "Rising",
      audience: "Entrepreneurs, Students, Professionals",
      longevity: "24 hours",
      insight:
        "Perfect for productivity apps, coaching services, and educational content creators.",
      keywords: [
        "#ProductivityHack",
        "#TimeManagement",
        "#FocusBlocks",
        "#Efficiency",
      ],
    },
    {
      id: "trend-5",
      name: "#TechEarnings2024",
      description:
        "Major tech companies reporting record earnings with AI investments showing significant returns, driving market optimism.",
      category: "Business & Technology",
      engagement: "High",
      audience: "Investors, Business professionals, Tech enthusiasts",
      longevity: "3 days",
      insight:
        "Excellent for financial services and investment platforms to share market insights.",
      keywords: [
        "#TechEarnings",
        "#StockMarket",
        "#Investment",
        "#AI",
        "#TechStocks",
      ],
    },
    {
      id: "trend-6",
      name: "Viral Dance Challenge",
      description:
        "New dance trend #MoveItMonday taking over social platforms with millions of participants and celebrity endorsements.",
      category: "Entertainment & Pop Culture",
      engagement: "High",
      audience: "Gen Z, Millennials, Content creators",
      longevity: "1 week+",
      insight:
        "Great for lifestyle brands and entertainment companies to create engaging content.",
      keywords: [
        "#MoveItMonday",
        "#DanceChallenge",
        "#Viral",
        "#Entertainment",
        "#SocialMedia",
      ],
    },
    {
      id: "trend-7",
      name: "Mental Health Awareness",
      description:
        "Workplace mental health initiatives trending as companies prioritize employee wellbeing and stress management programs.",
      category: "Lifestyle & Wellness",
      engagement: "Medium",
      audience: "HR professionals, Healthcare workers, General public",
      longevity: "1 week+",
      insight:
        "Perfect for healthcare brands and wellness companies to share valuable resources.",
      keywords: [
        "#MentalHealth",
        "#Wellness",
        "#WorkplaceWellbeing",
        "#SelfCare",
        "#HealthyWorkplace",
      ],
    },
    {
      id: "trend-8",
      name: "#CryptoComeback",
      description:
        "Cryptocurrency markets showing strong recovery with new institutional adoption and regulatory clarity driving investor confidence.",
      category: "Business & Technology",
      engagement: "Rising",
      audience: "Crypto enthusiasts, Investors, Tech professionals",
      longevity: "3 days",
      insight:
        "Opportunity for fintech companies to educate about crypto investments and blockchain technology.",
      keywords: [
        "#Cryptocurrency",
        "#Bitcoin",
        "#Blockchain",
        "#Investment",
        "#FinTech",
      ],
    },
  ];

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
      case "Business & Technology":
        return "💼";
      case "Entertainment & Pop Culture":
        return "🎭";
      case "Social & Cultural":
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
                {trendingTopics.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Trending Topics
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {trendingTopics.filter((t) => t.engagement === "High").length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                High Engagement
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {trendingTopics.filter((t) => t.longevity === "1 week+").length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Long-term Trends
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {new Set(trendingTopics.map((t) => t.category)).size}
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
            {trendingTopics.map((trend, index) => (
              <div
                key={trend.id}
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
                          {trend.name}
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
                      {trend.keywords.length}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <button
                    onClick={() => toggleExpanded(trend.id)}
                    className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                  >
                    {expandedTrend === trend.id ? (
                      <>
                        Hide Details <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show Details <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {expandedTrend === trend.id && (
                    <div className="mt-4 space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Marketing Insight
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {trend.insight}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Target Audience
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {trend.audience}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Related Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {trend.keywords.map((keyword, i) => (
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
