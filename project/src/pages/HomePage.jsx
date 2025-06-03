"use client"

// @ts-nocheck
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ThemeToggle } from "../components/ThemeToggle"
import { AuthModal } from "../components/AuthModal"
import { Loader2, Globe, ArrowRight, Sparkles, Zap, Shield, LayoutDashboard, Calendar, Check } from "lucide-react"
import { useAuthStore } from "../store/useAuthStore"
import toast from "react-hot-toast"
import { useAddDomainMutation } from "../libs/domainService"
import axios from "axios"
import { BusinessModal } from "../NewUIComponents/Modal"
import { useSocket } from "../store/useSocket"

export function extractDomain(fullUrl) {
  try {
    const trimmedUrl = fullUrl.trim()
    const normalized = trimmedUrl.startsWith("http") ? trimmedUrl : `https://${trimmedUrl}`
    const urlObj = new URL(normalized)
    return urlObj.hostname
  } catch (err) {
    console.error("Error extracting domain:", err.message)
    return null
  }
}

export const HomePage = () => {
  const { setIsSignInPopup, isSignUpPopup, isSignInPopup, setIsSignUpPopup } = useAuthStore()
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [showBusinessPopup, setShowBusinessPopup] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [clientData, setClientData] = useState({
    client_email: "",
    clientWebsite: "",
    clientName: "",
    clientDescription: "",
    industry: "",
    niche: "",
    client_id: "",
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
  })

  const steps = [
    {
      title: "Scanning Website",
      description: "Analyzing content and structure",
      icon: "🔍",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Extracting Business Data",
      description: "Identifying key business information",
      icon: "💼",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Analyzing Brand",
      description: "Detecting colors, style, and tone",
      icon: "🎨",
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Building Strategy",
      description: "Creating marketing approach",
      icon: "🎯",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Generating Ideas",
      description: "Crafting engaging content suggestions",
      icon: "✨",
      color: "from-indigo-500 to-violet-500",
    },
  ]

  const [isModalOpen, setisModalOpen] = useState(false)
  const navigate = useNavigate()
  const addDomain = useAddDomainMutation()
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const socket = useSocket()

  const generateCompanyData = async (domain, user) => {
    try {
      if (!domain) {
        throw new Error("Invalid domain extracted from URL.")
      }

      // Start animation immediately
      setProgress(0)
      setCurrentStep(0)

      // Start API request
      const apiPromise = axios.post("https://social-api-107470285539.us-central1.run.app/create-client", {
        user_email: user?.email,
        client_Website: domain,
      })

      // Track API response status
      let dataReceived = false
      let apiResponse = null
      let apiError = null

      // Handle API response
      const handleApiResponse = async () => {
        try {
          apiResponse = await apiPromise
          dataReceived = true
        } catch (error) {
          console.error("API error:", error)
          apiError = error
          dataReceived = true // Set to true to stop animation
        }
      }

      // Start API call in background
      const responsePromise = handleApiResponse()

      // Animation loop with immediate completion on API response
      let animationRunning = true
      const animateProgress = async () => {
        for (let i = 0; i < steps.length && animationRunning; i++) {
          setCurrentStep(i)

          for (let p = 0; p <= 100 && animationRunning; p += 3) {
            const currentProgress = (i * 100 + p) / steps.length
            setProgress(currentProgress)

            // If API response received, immediately jump to 100%
            if (dataReceived) {
              animationRunning = false
              setProgress(100)
              setCurrentStep(steps.length - 1)
              break
            }

            await sleep(50)
          }
        }
      }

      // Start animation
      const animationPromise = animateProgress()

      // Wait for API response
      await responsePromise

      // Stop animation and set to 100%
      animationRunning = false
      setProgress(100)
      setCurrentStep(steps.length - 1)

      // Small delay to show 100% completion
      await sleep(300)

      // Handle API error
      if (apiError) {
        setIsLoading(false)
        if (axios.isAxiosError(apiError)) {
          const errorMessage = apiError?.response?.data?.error || "Failed to generate company data."
          toast.error(errorMessage)
        } else {
          toast.error(apiError?.message || "Failed to generate company data.")
        }
        return
      }

      // Handle successful response
      const responseData = apiResponse.data
      if (responseData.code === "DUPLICATE_CLIENT") {
        toast.error(`Try another website`)
        setIsLoading(false)
        return
      }

      const result = await addDomain.mutateAsync({
        ...responseData,
        userId: user?._id,
      })

      socket.emit(
        "JoinRoom",
        {
          userId: user?._id,
          domainId: result?._id,
        },
        (response) => {
          if (response.success) {
            console.log("Joined room successfully")
          }
        },
      )

      setClientData({
        id: result?._id,
        client_email: result?.client_email || "",
        clientWebsite: result?.clientWebsite || "",
        clientName: result?.clientName || "",
        clientDescription: result?.clientDescription || "",
        industry: result?.industry || "",
        niche: result?.niche || "",
        colors: result.colors,
        language: result?.language || "",
        country: result?.country || "",
        state: result?.state || "",
        userId: result?.userId || "",
        siteLogo: result?.siteLogo || "",
        marketingStrategy: {
          audience: Array.isArray(result?.marketingStrategy?.audience) ? result.marketingStrategy.audience : [],
          audiencePains: Array.isArray(result?.marketingStrategy?.audiencePains)
            ? result.marketingStrategy.audiencePains
            : [],
          core_values: Array.isArray(result?.marketingStrategy?.core_values)
            ? result.marketingStrategy.core_values
            : [],
        },
      })

      toast.success("Domain successfully added!")
      setIsLoading(false)
      setisModalOpen(true)
    } catch (error) {
      console.error("Error in generateCompanyData:", error)
      setIsLoading(false)
      if (axios.isAxiosError(error)) {
        const apiError = error?.response?.data?.error || "Failed to generate company data."
        toast.error(apiError)
      } else {
        toast.error(error?.message || "Failed to generate company data.")
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem("user"))

    if (!url) {
      toast.error("Please enter a URL.")
      return
    }

    const domain = extractDomain(url)

    if (!domain) {
      toast.error("Please enter a valid URL (e.g., binance.com).")
      return
    }

    if (user) {
      setIsLoading(true)
      await generateCompanyData(domain, user)
    } else {
      setIsSignInPopup(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/oneyear-logo.svg" alt="OneYear Social" className="w-8 h-8" />
              <span className="font-semibold text-gray-900 dark:text-white">OneYear Social</span>
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
              Enter your website URL and let AI create a year's worth of engaging social media content, perfectly
              tailored to your brand
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
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      Generate Posts
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
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
                description: "Our AI analyzes your website and creates engaging posts that match your brand voice",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Year-Round Coverage",
                description: "Get 365 days of social media content generated in just minutes",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Multi-Platform Ready",
                description: "Posts are automatically optimized for each social media platform",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(isSignInPopup || isSignUpPopup) && <AuthModal />}

      {/* Loading Animation */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full shadow-xl">
            <div className="space-y-6">
              <div className="flex flex-col items-end">
                <p>{url}</p>
                <div className="flex space-x-1 mt-3">
                  <span className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce" />
                </div>
              </div>

              <div className="relative h-6">
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient relative"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 bg-white dark:bg-gray-800 rounded-full px-2 py-0.5 shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1"
                  style={{
                    left: `${Math.min(Math.max(progress, 3), 97)}%`,
                    transform: `translate(-50%, -50%)`,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{Math.round(progress)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`transform transition-all duration-500 ${
                      index === currentStep
                        ? "scale-100 opacity-100"
                        : index < currentStep
                          ? "scale-95 opacity-50"
                          : "scale-95 opacity-30"
                    }`}
                  >
                    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl
                                ${
                                  index <= currentStep
                                    ? `bg-gradient-to-r ${step.color}`
                                    : "bg-gray-100 dark:bg-gray-700"
                                }`}
                      >
                        {index < currentStep ? <Check className="w-5 h-5 text-white" /> : <span>{step.icon}</span>}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{step.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Modal */}
      <BusinessModal isOpen={isModalOpen} clientData={clientData} onClose={() => setisModalOpen(false)} />
    </div>
  )
}
