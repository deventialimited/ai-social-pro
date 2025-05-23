import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PostCard } from "../components/PostCard";
import { BusinessSection } from "../components/BusinessSection";
import { LeftMenu } from "../components/LeftMenu";
import { Header } from "../components/Header";
import { PostsLoader } from "../components/PostsLoader";
import { useThemeStore } from "../store/useThemeStore";
import { SocialsTab } from "../components/SocialsTab";
import { PostsHeader } from "../components/PostsHeader";
import { useDomains } from "../libs/domainService";
import { useSearchParams } from "react-router-dom";
import { SuccessPopup } from "./SuccessPopup";
import { CancelPopup } from "./CancelPopup";
import {
  useGetAllPostsByDomainId,
  useUpdatePostById,
  useDeletePostById,
} from "../libs/postService";
import toast from "react-hot-toast";
import axios from "axios";

export const Dashboard = () => {
  const { isDark } = useThemeStore();
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState({
    username: "",
  });
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?._id) {
      setUserId(storedUser._id);
      setUser({
        username: storedUser.username,
      });
    }
  }, []);
  const {
    data: domains,
    isDomainsLoading,
    isDomainsError,
    domainsError,
  } = useDomains(userId);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [currentTab, setCurrentTab] = useState("posts");
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("all");
  const [postsTab, setPostsTab] = useState("generated");
  const [isGeneratingPosts, setIsGeneratingPosts] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkoutStatus = searchParams.get("checkout");
  const [showPopup, setShowPopup] = useState(false);
  const handleClosePopup = () => {
    setShowPopup(false);
    // Remove the query params from URL without reload
    window.history.replaceState({}, document.title, window.location.pathname);
  };
  useEffect(() => {
    // Show popup if checkout status is present
    if (checkoutStatus) {
      setShowPopup(true);
    }
  }, [checkoutStatus]);
  const {
    data: posts,
    isPostsLoading,
    isPostsError,
    postsError,
  } = useGetAllPostsByDomainId(selectedWebsite);
  console.log(posts);
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

  const handleGeneratePosts = async (url) => {
    setIsGeneratingPosts(true);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    // setPosts((prevPosts) => [...prevPosts]);
    setIsGeneratingPosts(false);
    setCurrentTab("posts");
    setPostsTab("generated");
  };

  const handleNewPost = (post) => {
    // setPosts((prevPosts) => [post, ...prevPosts]);
    setCurrentTab("posts");
    setPostsTab("generated");
  };
  const updatePostMutation = useUpdatePostById();
  const handleEdit = (updatedPost, status) => {
    updatePostMutation.mutate(
      { id: updatedPost._id, postData: { ...updatedPost, status } },
      {
        onSuccess: () => {
          toast.success("Post updated successfully!");
        },
        onError: (error) => {
          toast.error(`Failed to update post: ${error}`);
        },
      }
    );
  };
  const deletePostMutation = useDeletePostById();

  const handleDelete = async (post) => {
    console.log("post from postCard", post);

    try {
      if (post.status === "scheduled") {
        console.log("post status:", post.status);
        const response = await axios.delete(
          "https://oneyearsocial.com/deleteMulti",
          {
            data: {
              uid: userId,
              postId: post.postId,
            },
          }
        );
        if (response.status !== 200) {
          toast.error("Failed to delete post from remote service");
          return;
        }
      }

      deletePostMutation.mutate(post._id, {
        onSuccess: () => {
          toast.success("Post deleted successfully!");
        },
        onError: (error) => {
          toast.error(`Failed to delete post: ${error}`);
        },
      });
    } catch (error) {
      console.error("Error deleting post:", error);
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
      case "socials":
        return <SocialsTab />;

      default:
        return <div>Dashboard Content</div>;
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
          userName={user.username || "guest"} // Pass the username from state
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
        {isGeneratingPosts && <PostsLoader />}
      </div>
    </div>
  );
};
