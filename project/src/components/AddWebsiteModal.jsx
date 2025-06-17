"use client"

import { useState } from "react"
import { X, Globe, Loader2, Briefcase, Palette, Target, Check, ArrowRight } from "lucide-react"
import { useAddDomainMutation } from "../libs/domainService"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import axios from "axios"
import { updateSelectedDomain } from "../libs/authService.js"

export function extractDomain(fullUrl) {
  const trimmedUrl = fullUrl.trim()
  const normalized = trimmedUrl.startsWith("http") ? trimmedUrl : `https://${trimmedUrl}`
  const urlObj = new URL(normalized)
  console.log("Extracted domain:", urlObj.hostname) // Debug log
  return urlObj.hostname
}

export const AddWebsiteModal = ({ onClose, onGenerate }) => {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [businessData, setBusinessData] = useState(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState(null)

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

  const addDomain = useAddDomainMutation()
  const navigate = useNavigate()
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const generateCompanyData = async (domain, user) => {
    try {
      if (!domain) throw new Error("Invalid domain extracted from URL.")
      console.log("Generating data for domain:", domain)

      // Start animation immediately
      setProgress(0)
      setCurrentStep(0)

      // Track API response status
      let dataReceived = false
      let apiResponse = null
      let apiError = null

      // Start API request but don't await yet
      const apiPromise = axios.post("https://social-api-107470285539.us-central1.run.app/create-client", {
        user_email: user?.email,
        client_Website: domain,
      })

      // Handle API response in background
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

            await sleep(30)
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

      // Handle API updateSelectedDomain
      if (apiError) {
        console.log("hello i am error",apiError.response.data.error)
        setError(apiError.response.data.error || "Failed to generate company data.")
        toast.error(apiError.response.data.error || "Failed to generate company data.")
        return
      }

      const Data = apiResponse.data
      console.log("API Response:", Data)

      // Handle existing client case
      if (Data.message === "Client already exists") {
        toast.error("Try another website")
        return
      }

      // Check essential data
      const { client_email, clientWebsite, clientDescription } = Data
      if (!client_email || !clientWebsite || !clientDescription) {
        if (!client_email) toast.error("Client email is required.")
        if (!clientWebsite) toast.error("Client website is required.")
        if (!clientDescription) toast.error("Client description is required.")
        return
      }

      // Save domain in DB
      const result = await addDomain.mutateAsync({
        ...Data,
        userId: user?._id,
      })

      toast.success("Domain successfully added!")
      console.log("Domain saved:", result)

      try {
        const updateSelectedDom = await updateSelectedDomain(user?._id, result?._id)
        console.log(updateSelectedDom)
      } catch (err) {
        console.log(err)
      }

      navigate(`/dashboard?domainId=${result?._id}`)
    } catch (error) {
      console.error("Error in generateCompanyData:", error)
      setError(error.message || "Failed to generate company data.")
      toast.error(error.message || "Failed to generate company data.")
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
    console.log("Domain after extraction:", domain) // Debug log

    if (!domain) {
      toast.error("Please enter a valid URL (e.g., binance.com).")
      return
    }

    if (user) {
      setIsLoading(true)
      setError(null) // Reset any previous errors
      await generateCompanyData(domain, user)
      setUrl("")
      setIsLoading(false)
      onClose()
    } else {
      toast.error("Please sign in to add a website.")
    }
  }

  const renderBusinessCard = (title, icon, content, className) => (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {content}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl w-[900px] max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add New Business
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {!businessData && !isLoading && (
              <div className="max-w-2xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                  <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">Enter your website URL</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We'll analyze your website and create a year's worth of engaging social media content tailored to your
                  brand.
                </p>
                <div className="relative mt-6">
                  <input
                    type="text" // Changed to "text" for flexibility
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="your-website.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-lg"
                    required
                  />
                  <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
            )}

            {isLoading && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex flex-col items-end">
                  <p>{url}</p>
                  <div className="flex space-x-1 mt-3">
                    <span className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-300 rounded-full animate-bounce" />
                  </div>
                </div>
                <div className="relative h-6">
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
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
                          ${index <= currentStep ? `bg-gradient-to-r ${step.color}` : "bg-gray-100 dark:bg-gray-700"}`}
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
            )}

            {businessData && (
              <div className="grid grid-cols-2 gap-6">
                {renderBusinessCard(
                  "Business Profile",
                  <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Name", value: businessData.name },
                        { label: "Industry", value: businessData.industry },
                        { label: "Country", value: businessData.country },
                        { label: "Language", value: businessData.language },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <div className="text-sm text-gray-500 dark:text-gray-400">{item.label}</div>
                          <div className="text-gray-900 dark:text-white font-medium">{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="text-sm text-gray-500 dark:text-gray-400">Description</div>
                      <div className="text-gray-900 dark:text-white">{businessData.description}</div>
                    </div>
                  </div>,
                  "col-span-2",
                )}

                {renderBusinessCard(
                  "Brand Identity",
                  <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
                  <div className="space-y-4">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <img
                          src={businessData.logo || "/placeholder.svg"}
                          alt="Logo"
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                      <div className="flex gap-3">
                        {[
                          { color: businessData.brandColor, label: "Brand" },
                          {
                            color: businessData.backgroundColor,
                            label: "Background",
                          },
                          { color: businessData.textColor, label: "Text" },
                        ].map((item, i) => (
                          <div key={i} className="text-center">
                            <div
                              className="w-12 h-12 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>,
                )}

                {renderBusinessCard(
                  "Marketing Strategy",
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />,
                  <div className="space-y-4">
                    {[
                      {
                        title: "Target Audience",
                        items: businessData.marketingStrategy.audience,
                        className: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                      },
                      {
                        title: "Pain Points",
                        items: businessData.marketingStrategy.audiencePains,
                        className: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                      },
                      {
                        title: "Core Values",
                        items: businessData.marketingStrategy.coreValues,
                        className: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                      },
                    ].map((section, i) => (
                      <div key={i}>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{section.title}</h5>
                        <div className="flex flex-wrap gap-2">
                          {section.items.map((item, j) => (
                            <span key={j} className={`px-3 py-1 rounded-full text-sm ${section.className}`}>
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>,
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              {businessData ? (
                <>
                  <button
                    type="button"
                    onClick={() => setBusinessData(null)}
                    className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                  >
                    Generate Posts
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      Create Posts
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
