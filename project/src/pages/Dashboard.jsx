import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PostCard } from "../components/PostCard";
import { BusinessSection } from "../components/BusinessSection";
import { LeftMenu } from "../components/LeftMenu";
import { Header } from "../components/Header";
import { PostsLoader } from "../components/PostsLoader";
import { useThemeStore } from "../store/useThemeStore";
import { SocialsTab } from "../components/SocialsTab";
import { PostsHeader } from "../components/PostsHeader";
import { useDomains } from "../libs/domainService";
import { SuccessPopup } from "./SuccessPopup";
import { CancelPopup } from "./CancelPopup";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAllPostsByDomainId,
  useUpdatePostById,
  useDeletePostById,
  useCreatePostViaPubSub,
} from "../libs/postService";
import { getDomainById } from "../libs/domainService";
import toast from "react-hot-toast";
import axios from "axios";
import SubscriptionManagement from "./SubscriptionManagement";
import { getUserInformation } from "../libs/authService";
import { useSocket } from "../store/useSocket";
import GeneratePostModal from "../PopUps/GenerateNewPost";
import GenerateBatchModal from "../PopUps/GenerateBatch";
import { TrendingUp } from "lucide-react";
import { TrendsInputModal } from "../PopUps/TrendsToPost";
import { TrendsResultModal } from "../PopUps/TrendingTopics";
import CharactersTab from "./CharacterPage";

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const { isDark } = useThemeStore();
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState({ username: "" });
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(null);
  const [currentTab, setCurrentTab] = useState("posts");
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("all");
  const [postsTab, setPostsTab] = useState("generated");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isGeneratingPosts, setIsGeneratingPosts] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isGenerateBatchModalOpen, setIsGenerateBatchModalOpen] =
    useState(false);
  const [isTrendsModalOpen, setIsTrendsModalOpen] = useState(false);
  const [isTrendsResultModalOpen, setIsTrendsResultModalOpen] = useState(false);
  const [trendInputData, setTrendInputData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState("");
  const [isFetchingUserInfo, setIsFetchingUserInfo] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");
  const socket = useSocket();
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [isGeneratingBatchPost, setIsGeneratingBatchPost] = useState(false);
  const [isGeneratingTrendPost, setIsGeneratingTrendPost] = useState(false);
  const [platform, setPlatform] = useState("Twitter");

  const { mutateAsync: createPostViaPubSub } = useCreatePostViaPubSub();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const domainId = searchParams.get("domainId");

    if (domainId) {
      setSelectedWebsiteId(domainId);
      navigate("/dashboard", { replace: true });
    } else {
      const storedWebsiteId = JSON.parse(
        localStorage.getItem("user")
      )?.selectedWebsiteId;
      if (storedWebsiteId) {
        setSelectedWebsiteId(storedWebsiteId);
      }
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "socials") {
      setCurrentTab("socials");
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!socket) {
      console.log("socket not connected in the dashboard");
      return;
    }
    socket.on("postStatusUpdated", (updatedPost) => {
      console.log("updated post in the dashboard", updatedPost);
      if (updatedPost.domainId === selectedWebsiteId) {
        queryClient.invalidateQueries(["posts", updatedPost.domainId]);
      }
    });
  }, [socket, queryClient, selectedWebsiteId]);

  useEffect(() => {
    console.log("into the new useEffect to check the returnFromPortal");
    const returnFromPortal = searchParams.get("returnFromPortal");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (returnFromPortal && storedUser._id) {
      setIsFetchingUserInfo(true);
      getUserInformation(storedUser._id)
        .then((updatedUser) => {
          console.log("new updated user", updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        })
        .catch((err) => {
          console.warn("Error fetching user info:", err);
        })
        .finally(() => {
          setIsFetchingUserInfo(false);
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        });
    }
  }, [searchParams]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?._id) {
      setUserId(storedUser._id);
      setUser({ username: storedUser.username });
    }
  }, []);

  const {
    data: domains,
    isDomainsLoading,
    isDomainsError,
    domainsError,
  } = useDomains(userId);

  const {
    data: posts,
    isPostsLoading,
    isPostsError,
    postsError,
  } = useGetAllPostsByDomainId(selectedWebsiteId);

  useEffect(() => {
    if (domains?.length > 0 && !selectedWebsiteId) {
      const storedWebsiteId = JSON.parse(
        localStorage.getItem("user")
      )?.selectedWebsiteId;
      if (storedWebsiteId) {
        setSelectedWebsiteId(storedWebsiteId);
      } else {
        setSelectedWebsiteId(domains[0]?._id);
      }
    }
  }, [domains, selectedWebsiteId]);

  useEffect(() => {
    document.documentElement.className = isDark ? "dark" : "";
  }, [isDark]);

  useEffect(() => {
    if (checkoutStatus) {
      setShowPopup(true);
    }
  }, [checkoutStatus]);

  const handleClosePopup = () => {
    setShowPopup(false);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleGeneratePosts = async () => {
    setIsGeneratingPosts(true);
    setGenerationError("");
    setGenerationProgress(0);

    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev < 95) return prev + 1;
        return prev;
      });
    }, 100);
    try {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      clearInterval(interval);
      setGenerationProgress(100);
      setTimeout(() => {
        setIsGeneratingPosts(false);
        setCurrentTab("posts");
        setPostsTab("generated");
      }, 500);
    } catch (error) {
      clearInterval(interval);
      setGenerationError("Failed to generate posts.");
      setTimeout(() => setIsGeneratingPosts(false), 2000);
    }
  };

  const handleSinglePostGeneration = async () => {
    // Implement single post generation logic here
  };

  const handleNewPost = (post) => {
    setCurrentTab("posts");
    setPostsTab("generated");
  };

  const handleGenerateTrendPost = async (trend) => {
    console.log("trend data to generate post:", trend);
    console.log("trendInputData:", trendInputData);
    setIsGeneratingTrendPost(true); // Start loading state for Trends To Post
    setIsTrendsResultModalOpen(false); // Close the modal immediately
    const domain = await getDomainById(selectedWebsiteId);
    if (!domain?.data) {
      throw new Error(
        "Unable to find website details. Please try again later."
      );
    }
    console.log("domain data:", domain.data);

    const clientData = {
      client_email: domain.data.client_email || "",
      client_id: domain.data.client_id,
      Website: domain.data.clientWebsite || "",
      Name: domain.data.clientName || "Unknown",
      industry: domain.data.industry || "Unknown",
      niche: trend.category || "Unknown",
      description: trend.description || "",
      core_values: domain.data.marketingStrategy?.core_values || [],
      target_audience: trend.audience || [],
      audience_pain_points: domain.data.marketingStrategy?.audiencePains || [],
    };

    const payload = {
      client_email: clientData.client_email,
      client_id: clientData.client_id,
      Website: clientData.Website,
      Name: clientData.Name,
      industry: clientData.industry,
      niche: clientData.niche,
      description: clientData.description,
      core_values: clientData.core_values,
      target_audience: clientData.target_audience,
      audience_pain_points: clientData.audience_pain_points,
      post_platform: platform || "Twitter",
    };

    console.log("Payload:", payload);

    try {
      const response = await axios.post(
        "https://social-api-107470285539.us-central1.run.app/generate-single-post",
        payload
      );
      if (response.status === 200) {
        const pubsubPayload = {
          post_id: response.data.post_id,
          client_id: domain.data.client_id,
          domainId: selectedWebsiteId,
          userId: userId,
          image: response.data.image || "",
          topic: response.data.topic,
          related_keywords: response.data.related_keywords || [],
          content: response.data.content,
          slogan: response.data.slogan,
          imageIdeas: response.data.imageIdeas || [],
          postDate: response.data.date,
          platform: response.data.platform,
        };

        await createPostViaPubSub(pubsubPayload); // Save via PubSub
        queryClient.invalidateQueries(["posts", selectedWebsiteId]);
        toast.success("Post generated and saved successfully!");
      } else {
        console.error("Error generating post:", response);
        toast.error("Failed to generate post: " + response.data.message);
      }
    } catch (error) {
      toast.error(
        "An error occurred while generating the post: " + error.message
      );
    } finally {
      setIsGeneratingTrendPost(false); // Stop loading state after completion
    }
  };

  const handleAnalyzeTrends = (formData) => {
    console.log("Form data received in handleAnalyzeTrends:", formData);
    setTrendInputData(formData);
    setIsTrendsModalOpen(false);
  };

  const handleApiResponse = (responseData) => {
    setTrendsData(responseData.data);
    setIsTrendsResultModalOpen(true);
  };

  const updatePostMutation = useUpdatePostById();
  const deletePostMutation = useDeletePostById();

  const handleEdit = (updatedPost, status) => {
    updatePostMutation.mutate(
      { id: updatedPost._id, postData: { ...updatedPost, status } },
      {
        onSuccess: () => toast.success("Post updated successfully!"),
        onError: (error) => toast.error(`Failed to update post: ${error}`),
      }
    );
  };

  const handleDelete = async (post) => {
    try {
      if (post.status === "scheduled") {
        const response = await axios.delete(
          "https://us-central1-socialmediabranding-31c73.cloudfunctions.net/api/deleteMulti",
          { data: { uid: userId, postId: post.postId } }
        );
        if (response.status !== 200) {
          toast.error("Failed to delete post from remote service");
          return;
        }
      }

      deletePostMutation.mutate(post._id, {
        onSuccess: () => toast.success("Post deleted successfully!"),
        onError: (error) => toast.error(`Failed to delete post: ${error}`),
      });
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handleReschedule = (id) => {
    console.log("Reschedule post:", id);
  };

  const handleBusinessEdit = (section) => {
    console.log("Edit business section:", section);
  };

  const filteredPosts = posts?.filter((post) => {
    const platform = post?.platform?.toLowerCase();
    const matchesFilter = filter === "all" || platform === filter.toLowerCase();
    const matchesTab = post.status === postsTab;
    return matchesFilter && matchesTab;
  });

  const renderContent = () => {
    switch (currentTab) {
      case "posts":
        return (
          <div className="space-y-6 mt-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <PostsHeader
                view={view}
                onViewChange={setView}
                filter={filter}
                onFilterChange={setFilter}
                currentTab={postsTab}
                onTabChange={setPostsTab}
                totalPosts={posts?.length}
                filteredPosts={filteredPosts?.length}
              />
            </div>
            {postsTab === "generated" && (
              <div className="px-6 py-4 flex justify-center space-x-20">
                <div className="flex flex-col items-center">
                  <button
                    className={`flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transform transition-transform hover:scale-105 active:scale-95 shadow-md ${
                      isGeneratingPost ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                    onClick={() => setIsGenerateModalOpen(true)}
                    disabled={isGeneratingPost}
                  >
                    <span className="mr-2 text-xl flex items-center justify-center w-6 h-6 bg-blue-500 rounded-sm">
                      {isGeneratingPost ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "+"
                      )}
                    </span>
                    {isGeneratingPost ? "Generating..." : "Generate Post"}
                  </button>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Create a single customized post <br /> with specific
                    settings and content
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    className={`flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transform transition-transform hover:scale-105 active:scale-95 shadow-md ${
                      isGeneratingTrendPost
                        ? "opacity-75 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() => {
                      setIsTrendsModalOpen(true);
                      setIsTrendsResultModalOpen(false);
                    }}
                    disabled={isGeneratingTrendPost}
                  >
                    <span className="mr-2 text-xl flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                      {" "}
                      {isGeneratingTrendPost ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrendingUp className="text-white w-5 h-5" />
                      )}
                      {/* Updated to match rounded style */}
                    </span>
                    {isGeneratingTrendPost ? "Generating..." : "Trends To Post"}
                  </button>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Generate posts from current <br /> trending topics and viral{" "}
                    <br /> content
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    className={`flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-pink-600 text-white rounded-lg hover:from-blue-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transform transition-transform hover:scale-105 active:scale-95 shadow-md ${
                      isGeneratingBatchPost
                        ? "opacity-75 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={() => setIsGenerateBatchModalOpen(true)}
                    disabled={isGeneratingBatchPost}
                  >
                    <span className="mr-2 text-xl flex items-center justify-center w-6 h-6 bg-blue-500 rounded-sm">
                      {isGeneratingBatchPost ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "+"
                      )}
                    </span>
                    {isGeneratingBatchPost ? "Generating..." : "Generate Batch"}
                  </button>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Generate multiple posts across <br /> different platforms at
                    once
                  </p>
                </div>
              </div>
            )}
            <div
              className={`max-w-[1200px] mx-auto px-4 sm:px-6 ${
                view === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                  : "flex flex-col items-center space-y-6"
              }`}
            >
              {filteredPosts
                ?.slice()
                .reverse()
                .map((post) => (
                  <div
                    key={post._id}
                    className={
                      view === "list" ? "w-full max-w-[680px]" : "w-full"
                    }
                  >
                    <PostCard
                      post={post}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onReschedule={handleReschedule}
                      view={view}
                    />
                  </div>
                ))}
            </div>
          </div>
        );
      case "business":
        return (
          <BusinessSection
            selectedWebsiteId={selectedWebsiteId}
            userId={userId}
            onEdit={handleBusinessEdit}
          />
        );
      case "subscription":
        return <SubscriptionManagement />;
      case "character":
        return <CharactersTab />;
      case "socials":
        return <SocialsTab />;
      default:
        return <div>Dashboard Contents</div>;
    }
  };

  const selectedDomain = domains?.find(
    (domain) => domain._id === selectedWebsiteId
  );
  const initialLanguage = selectedDomain?.language || "";
  const initialLocation = selectedDomain?.country || "";

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <LeftMenu
          userId={userId}
          selectedWebsite={selectedWebsiteId}
          onWebsiteChange={setSelectedWebsiteId}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onAddBusiness={handleGeneratePosts}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onNewPost={handleNewPost}
          navigate={navigate}
        />
        <Header
          userName={user.username || "guest"}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <div
          className={`transition-all duration-300 lg:ml-64 pt-20 pb-8 ${
            isMobileMenuOpen ? "ml-64" : "ml-0"
          }`}
        >
          {renderContent()}
        </div>
        {showPopup && checkoutStatus === "success" && (
          <SuccessPopup onClose={handleClosePopup} />
        )}
        {showPopup && checkoutStatus === "cancel" && (
          <CancelPopup onClose={handleClosePopup} />
        )}
        {isGeneratingPosts && (
          <PostsLoader progress={generationProgress} error={generationError} />
        )}
        {isFetchingUserInfo && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg shadow-md z-50">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              Fetching your updated subscription...
            </p>
          </div>
        )}
        {isGenerateModalOpen && !isGeneratingPost && (
          <GeneratePostModal
            onClose={() => setIsGenerateModalOpen(false)}
            onGenerate={() => {
              queryClient.invalidateQueries(["posts", selectedWebsiteId]);
            }}
            onLoadingChange={setIsGeneratingPost}
          />
        )}
        {isGenerateBatchModalOpen && !isGeneratingBatchPost && (
          <GenerateBatchModal
            onClose={() => setIsGenerateBatchModalOpen(false)}
            onGenerate={() => {
              queryClient.invalidateQueries(["posts", selectedWebsiteId]);
            }}
            onLoadingChange={setIsGeneratingBatchPost}
          />
        )}
        {isTrendsModalOpen && (
          <TrendsInputModal
            onClose={() => setIsTrendsModalOpen(false)}
            onContinue={handleAnalyzeTrends}
            onApiResponse={handleApiResponse}
            initialLanguage={initialLanguage}
            initialLocation={initialLocation}
            setPlatform={setPlatform}
          />
        )}
        {isTrendsResultModalOpen && trendsData && (
          <TrendsResultModal
            inputData={trendInputData}
            trendsData={trendsData}
            platform={platform}
            onClose={() => setIsTrendsResultModalOpen(false)}
            onGeneratePost={handleGenerateTrendPost}
            clientData={{
              client_email: selectedDomain?.client_email || "",
              client_id: selectedDomain?.client_id || "",
              clientWebsite: selectedDomain?.website || "",
              clientName: selectedDomain?.name || "Unknown",
              industry: selectedDomain?.industry || "Unknown",
              niche: selectedDomain?.niche || "Unknown",
              clientDescription: selectedDomain?.description || "",
              marketingStrategy: {
                core_values: selectedDomain?.core_values || [],
                audience: selectedDomain?.target_audience || [],
                audiencePains: selectedDomain?.audience_pain_points || [],
              },
            }}
          />
        )}
      </div>
    </div>
  );
};
