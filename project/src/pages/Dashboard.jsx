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
import { useGetAllPostsByDomainId } from "../libs/postService";


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
  const {
    data: posts,
    isPostsLoading,
    isPostsError,
    postsError,
  } = useGetAllPostsByDomainId(selectedWebsite);
  console.log(posts);
  useEffect(() => {
    if (domains?.length > 0) {
      const domainId = searchParams.get("domainId");
      if (domainId) {
        setSelectedWebsite(domainId);
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

  const handleEdit = (id) => {
    console.log("Edit post:", id);
  };

  const handleDelete = (id) => {
    console.log("Delete post:", id);
  };

  const handleReschedule = (id) => {
    console.log("Reschedule post:", id);
  };

  const handleSaveToDraft = (id) => {
    console.log("Save to draft:", id);
  };

  const handleBusinessEdit = (section) => {
    console.log("Edit business section:", section);
  };

  const filteredPosts = posts?.filter((post) => {
    const matchesFilter = filter === "all" || post.platforms.includes(filter);
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
                    onSaveToDraft={handleSaveToDraft}
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

        {isGeneratingPosts && <PostsLoader />}
      </div>
    </div>
  );
};
