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
} from "../libs/postService";
import toast from "react-hot-toast";
import axios from "axios";
import SubscriptionManagement from "./SubscriptionManagement";
import { getUserInformation } from "../libs/authService";
import {useSocket} from '../store/useSocket'
import GeneratePostModal from "../PopUps/GenerateNewPost";

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const { isDark } = useThemeStore();
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState({ username: "" });
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [currentTab, setCurrentTab] = useState("posts");
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("all");
  const [postsTab, setPostsTab] = useState("generated");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isGeneratingPosts, setIsGeneratingPosts] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false); // New state for modal

  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState("");
const [isFetchingUserInfo, setIsFetchingUserInfo] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");
const socket=useSocket();
useEffect(() => {


  // Check for tab query parameter and set currentTab
  const tab = searchParams.get("tab");
  if (tab === "socials") {
    setCurrentTab("socials");
    // Clean up the URL by removing the tab query parameter
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}, [searchParams]);

  useEffect(()=>{
    if (!socket){
      console.log('socket not conected in the dashboard');
      return;
    }
    socket.on('postStatusUpdated',(updatedPost)=>{
      console.log("updated post in the dashboard",updatedPost)
      if (updatedPost.domainId === selectedWebsite) 
        {
          queryClient.invalidateQueries(['posts',updatedPost.domainId])
                  }
    })
  },[socket,queryClient,selectedWebsite])
useEffect(()=>{
  console.log('into the new USeeffect to check the returnFromPortal')
  const returnFromPortal = searchParams.get("returnFromPortal");
  const storedUser = JSON.parse(localStorage.getItem("user"));
if(returnFromPortal && storedUser._id){
      setIsFetchingUserInfo(true); // 👈 Start loader

  getUserInformation(storedUser._id)
      .then((updatedUser) => {
        console.log('new updated user',updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      })
      .catch(() => {
        console.warn("Error fetching user info:", err);
      })
      .finally(() => {
                setIsFetchingUserInfo(false); // 👈 Stop loader

        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      });
}

},[searchParams])

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
  } = useGetAllPostsByDomainId(selectedWebsite);

  useEffect(() => {
    const selectedWebsiteId = JSON.parse(
      localStorage.getItem("user")
    )?.selectedWebsiteId;
    if (domains?.length > 0) {
      const domainId = searchParams.get("domainId");
      if (domainId) {
        setSelectedWebsite(domainId);
      } else if (selectedWebsiteId) {
        setSelectedWebsite(selectedWebsiteId);
      } else {
        setSelectedWebsite(domains[0]?._id);
      }
    }
  }, [domains, searchParams]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
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

  const handleNewPost = (post) => {
    setCurrentTab("posts");
    setPostsTab("generated");
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
    const platforms = post.platforms?.map((p) => p.toLowerCase());
    const matchesFilter =
      filter === "all" || platforms.includes(filter.toLowerCase());
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
            <div className="px-6 py-4 flex justify-center">
              <button
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={()=>setIsGenerateModalOpen(true)}
              >
                <span className="mr-2 text-xl flex items-center justify-center w-6 h-6 bg-blue-500 rounded-sm">
                  +
                </span>
                Generate Post
              </button>
            </div>
          )}
          <div
            className={`max-w-[1200px] mx-auto px-4 sm:px-6 ${
              view === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                : "flex flex-col items-center space-y-6"
            }`}
          >
            {filteredPosts?.map((post) => (
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
          selectedWebsiteId={selectedWebsite}
          userId={userId}
          onEdit={handleBusinessEdit}
        />
      );
    case "subscription":
      return <SubscriptionManagement />;
    case "socials":
      return <SocialsTab />;
    default:
      return <div>Dashboard Contentsss</div>;
  }
};
  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <LeftMenu
          userId={userId}
          selectedWebsite={selectedWebsite}
          onWebsiteChange={setSelectedWebsite}
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
    <p className="text-sm text-gray-800 dark:text-gray-200">Fetching your updated subscription...</p>
  </div>
)}
 {isGenerateModalOpen && (
          <GeneratePostModal
            onClose={() => setIsGenerateModalOpen(false)}
            onGenerate={()=>{}}
          />
        )}

      </div>
    </div>
  );
  
};
