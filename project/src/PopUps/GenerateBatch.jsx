import React, { useState } from "react";
import { X, Check, ArrowRight, Sparkles ,ClipboardList} from "lucide-react";
import { getDomainById } from "../libs/domainService";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useCreatePostViaPubSub } from "../libs/postService";
import { useQueryClient } from "@tanstack/react-query";

const GenerateBatchModal = ({ onClose, onGenerate, onLoadingChange }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: createPostViaPubSub, isLoading: isPubSubLoading } =
    useCreatePostViaPubSub();
  const [isLoading, setIsLoading] = useState(false);

  const [topicDescription, setTopicDescription] = useState(""); // NEW

  const [platforms, setPlatforms] = useState([
    {
      id: "facebook",
      name: "Facebook",
      icon: "https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/facebook.svg",
      enabled: true,
      postCount: 1,
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: "https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/instagram.svg",
      enabled: true,
      postCount: 1,
    },
    {
      id: "x",
      name: "X (Twitter)",
      icon: "https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/twitter.svg",
      enabled: true,
      postCount: 1,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: "https://raw.githubusercontent.com/danielcranney/profileme-dev/main/public/icons/socials/linkedin.svg",
      enabled: true,
      postCount: 1,
    },
  ]);

  const togglePlatform = (id) => {
    setPlatforms(
      platforms.map((platform) =>
        platform.id === id
          ? { ...platform, enabled: !platform.enabled }
          : platform
      )
    );
  };

  const updatePostCount = (id, count) => {
    setPlatforms(
      platforms.map((platform) =>
        platform.id === id ? { ...platform, postCount: count } : platform
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enabledPlatforms = platforms.filter((p) => p.enabled);
    if (enabledPlatforms.length === 0) {
      toast.error("Please select at least one platform.", {
        position: "top-right",
        duration: 4000,
      });
      return;
    }

    setIsLoading(true);
    onLoadingChange?.(true);
    onClose();

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const selectedWebsiteId = user?.selectedWebsiteId;

      if (!selectedWebsiteId) {
        throw new Error(
          "No website selected. Please select a website and try again."
        );
      }

      const domain = await getDomainById(selectedWebsiteId);
      if (!domain?.data) {
        throw new Error(
          "Unable to find website details. Please try again later."
        );
      }

      const basePayload = {
        client_email: domain.data.client_email,
        client_id: domain.data.client_id,
        website: domain.data.clientWebsite,
        name: domain.data.clientName || "Unknown",
        industry: domain.data.industry || "Unknown",
        niche: domain.data.niche || "Unknown",
        description: topicDescription || "", // REPLACED HERE
        core_values: domain.data.marketingStrategy?.core_values || [],
        target_audience: domain.data.marketingStrategy?.audience || [],
        audience_pain_points:
          domain.data.marketingStrategy?.audiencePains || [],
      };

      const postPromises = [];
      const postPlatforms = [];

      enabledPlatforms.forEach((platform) => {
        for (let i = 0; i < platform.postCount; i++) {
          const payload = {
            ...basePayload,
            post_platform: platform.id,
          };

          postPromises.push(
            axios.post(
              "https://social-api-107470285539.us-central1.run.app/generate-single-post",
              payload,
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            )
          );
          postPlatforms.push(platform.id);
        }
      });

      const responses = await Promise.all(postPromises);

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        const platform = postPlatforms[i];

        const pubsubPayload = {
          post_id: response.data.post_id,
          client_id: domain.data.client_id,
          domainId: selectedWebsiteId,
          userId: user._id,
          image: response.data.image || "",
          topic: response.data.topic,
          related_keywords: response.data.related_keywords || [],
          content: response.data.content,
          slogan: response.data.slogan,
          imageIdeas: response.data.imageIdeas || [],
          postDate: response.data.date,
          platform: response.data.platform,
        };

        await createPostViaPubSub(pubsubPayload);
      }

      toast.success(
        `Successfully generated ${responses.length} post${
          responses.length !== 1 ? "s" : ""
        }!`,
        {
          position: "top-right",
          duration: 4000,
        }
      );
      onGenerate();
      queryClient.invalidateQueries(["posts", selectedWebsiteId]);
    } catch (err) {
      let errorMessage =
        "Something went wrong while generating your posts. Please try again later.";

      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage =
              "Invalid input provided. Please check your inputs and try again.";
            break;
          case 401:
            errorMessage = "Authentication failed. Please log in again.";
            break;
          case 429:
            errorMessage =
              "Too many requests. Please wait a moment and try again.";
            break;
          case 500:
            errorMessage = "Server error occurred. Please try again later.";
            break;
          default:
            errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage, {
        position: "top-right",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
    }
  };

  const enabledPlatforms = platforms.filter((p) => p.enabled);
  const totalPosts = enabledPlatforms.reduce((sum, p) => sum + p.postCount, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl w-[600px] max-h-[90vh] flex flex-col overflow-hidden shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-8 pt-12 pb-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Generate Batch
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Create multiple posts across different platforms
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-8 space-y-6">
              {/* TEXTAREA INPUT */}
              <div>
                <label
                  htmlFor="topic-description"
                  className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  <ClipboardList className="w-4 h-4" />
                  Description (Required if no topic)
                </label>

                <textarea
                  id="topic-description"
                  rows={4}
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  placeholder="Describe what you want to post about..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
                />
              </div>

              {/* PLATFORM SELECTION */}
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                    platform.enabled
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => togglePlatform(platform.id)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                        platform.enabled
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-500"
                      }`}
                    >
                      {platform.enabled && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <img
                          src={platform.icon}
                          alt={platform.name}
                          className="w-5 h-5"
                        />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {platform.name}
                      </span>
                    </div>
                  </div>
                  {platform.enabled && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Posts:
                      </span>
                      <select
                        value={platform.postCount}
                        onChange={(e) =>
                          updatePostCount(platform.id, parseInt(e.target.value))
                        }
                        className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}

              {enabledPlatforms.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Batch Summary
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {enabledPlatforms.length} platform
                        {enabledPlatforms.length !== 1 ? "s" : ""} •{" "}
                        {totalPosts} total post
                        {totalPosts !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {totalPosts}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-8 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  id="generate-batch-button"
                  type="submit"
                  disabled={
                    enabledPlatforms.length === 0 ||
                    isLoading ||
                    isPubSubLoading
                  }
                  className={`px-6 py-2.5 rounded-lg flex items-center gap-2 transition-opacity ${
                    enabledPlatforms.length > 0 &&
                    !isLoading &&
                    !isPubSubLoading
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isLoading || isPubSubLoading
                    ? "Generating..."
                    : "Generate Batch"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GenerateBatchModal;
