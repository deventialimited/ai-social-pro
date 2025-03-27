import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { PostCard } from "../components/PostCard";
import { BusinessSection } from "../components/BusinessSection";
import { LeftMenu } from "../components/LeftMenu";
import { Header } from "../components/Header";
import { PostsLoader } from "../components/PostsLoader";
import { useThemeStore } from "../store/useThemeStore";
import { Post, BusinessData, Website } from "../types";
import { SocialsTab } from "../components/SocialsTab";
import { PostsHeader } from "../components/PostsHeader";

// Sample websites data
const sampleWebsites: Website[] = [
  {
    id: "site-1",
    name: "Kaz Routes",
    logo: "/kaz-routes-logo.png",
  },
  {
    id: "site-2",
    name: "Adventure Tours",
    logo: "/kaz-routes-logo.png",
  },
  {
    id: "site-3",
    name: "Local Experiences",
    logo: "/kaz-routes-logo.png",
  },
];

// Sample posts data
const samplePosts: Post[] = [
  // Facebook Posts
  {
    id: "post-1",
    text: "Experience the magic of Kazakh hospitality in our traditional yurt stays 🏕️ Book your authentic cultural experience today! #KazakhCulture #Travel",
    imageUrl:
      "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1000",
    scheduledDate: "2024-03-27T10:00:00Z",
    platforms: ["facebook"],
    businessLogo: "/kaz-routes-logo.png",
    status: "draft",
  },
  {
    id: "post-2",
    text: "Join us for a culinary journey through Kazakhstan's finest dishes! From traditional beshbarmak to modern fusion cuisine, let your taste buds explore 🍜 #KazakhFood #Foodie",
    imageUrl:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1000",
    scheduledDate: "2024-03-31T10:00:00Z",
    platforms: ["facebook"],
    businessLogo: "/kaz-routes-logo.png",
    status: "scheduled",
  },
  {
    id: "post-3",
    text: "Special summer discount! 🌞 Book your Kazakhstan adventure before May and get 20% off on all our premium tour packages. Tag a friend who needs this adventure! #SummerTravel #Discount",
    imageUrl:
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000",
    scheduledDate: "2024-04-01T08:00:00Z",
    platforms: ["facebook"],
    businessLogo: "/kaz-routes-logo.png",
    status: "generated",
  },

  // Twitter (X) Posts
  {
    id: "post-4",
    text: "🏔️ Did you know? The Tian Shan mountains in Kazakhstan are home to some of the world's most spectacular hiking trails! Plan your trek with us: https://kazroutes.com/tian-shan #Adventure #Hiking",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000",
    scheduledDate: "2024-03-28T14:00:00Z",
    platforms: ["x"],
    businessLogo: "/kaz-routes-logo.png",
    status: "published",
  },
  {
    id: "post-5",
    text: "🦅 The ancient art of eagle hunting is alive in Kazakhstan! Join our special cultural tour to witness this magnificent tradition firsthand. #CulturalHeritage #Travel",
    imageUrl:
      "https://images.unsplash.com/photo-1516054575922-f0b8eeadec1a?auto=format&fit=crop&w=1000",
    scheduledDate: "2024-03-29T16:00:00Z",
    platforms: ["x"],
    businessLogo: "/kaz-routes-logo.png",
    status: "scheduled",
  },
  {
    id: "post-6",
    text: "💫 New: Night sky photography tours in the Kazakh steppes! Capture the Milky Way like never before. Limited spots available for summer 2024. #Photography #NightSky",
    imageUrl:
      "https://images.unsplash.com/photo-1489549132488-d00b7eee80f1?auto=format&fit=crop&w=1000",
    scheduledDate: "2024-04-02T09:00:00Z",
    platforms: ["x"],
    businessLogo: "/kaz-routes-logo.png",
    status: "draft",
  },

  // LinkedIn Posts
  {
    id: "post-7",
    text: "Proud to announce our new sustainable tourism initiative! 🌱 Kaz Routes is partnering with local communities to develop eco-friendly travel experiences that preserve Kazakhstan's natural beauty while supporting local economies. #SustainableTourism #ResponsibleTravel",
    imageUrl:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000",
    scheduledDate: "2024-03-30T10:00:00Z",
    platforms: ["linkedin"],
    businessLogo: "/kaz-routes-logo.png",
    status: "generated",
  },
  {
    id: "post-8",
    text: "We're expanding our team! 🚀 Looking for experienced tour guides with a passion for Kazakhstan's culture and history. Join us in creating unforgettable travel experiences. #JobOpportunity #Tourism",
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000",
    scheduledDate: "2024-04-03T11:00:00Z",
    platforms: ["linkedin"],
    businessLogo: "/kaz-routes-logo.png",
    status: "scheduled",
  },
  {
    id: "post-9",
    text: "Milestone achieved! 🏆 Kaz Routes has been recognized as the leading cultural tourism provider in Central Asia for 2024. Thank you to our amazing team and partners who made this possible. #Achievement #TourismIndustry",
    imageUrl:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1000",
    scheduledDate: "2024-04-04T13:00:00Z",
    platforms: ["linkedin"],
    businessLogo: "/kaz-routes-logo.png",
    status: "draft",
  },
];

// Sample business data
const sampleBusinessData: BusinessData = {
  name: "Kaz Routes",
  description:
    "A company that provides travel and tourism-related services, specializing in routes and guided experiences across Kazakhstan.",
  industry: "Travel & Tourism",
  niche: "Kazakhstan Travel Routes & Guided Tours",
  logo: "/kaz-routes-logo.png",
  logoBackground: "white",
  headshot: "",
  brandColor: "#FF6B6B",
  backgroundColor: "#FFFFFF",
  textColor: "#000000",
  website: "kazroutes.com",
  language: "English",
  country: "Kazakhstan",
  region: "Central Asia",
  marketingStrategy: {
    audience: [
      "Adventure seekers exploring unique routes",
      "Travel enthusiasts seeking guided tours",
      "Cultural explorers interested in local experiences",
    ],
    audiencePains: [
      "Difficulty finding reliable travel routes",
      "Language barriers when navigating",
      "Limited access to authentic experiences",
    ],
    coreValues: [
      "Authentic Local Experiences",
      "Customer-Centric Service",
      "Sustainable Tourism",
    ],
  },
};

export const Dashboard: React.FC = () => {
  const { isDark } = useThemeStore();
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [selectedWebsite, setSelectedWebsite] = useState(sampleWebsites[0].id);
  const [currentTab, setCurrentTab] = useState("posts");
  const [view, setView] = useState<"grid" | "list">("list");
  const [filter, setFilter] = useState<string>("all");
  const [postsTab, setPostsTab] = useState<
    "generated" | "draft" | "scheduled" | "published"
  >("generated");
  const [isGeneratingPosts, setIsGeneratingPosts] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleGeneratePosts = async (url: string) => {
    setIsGeneratingPosts(true);
    await new Promise((resolve) => setTimeout(resolve, 4000));
    setPosts((prevPosts) => [...prevPosts]);
    setIsGeneratingPosts(false);
    setCurrentTab("posts");
    setPostsTab("generated");
  };

  const handleNewPost = (post: Post) => {
    setPosts((prevPosts) => [post, ...prevPosts]);
    setCurrentTab("posts");
    setPostsTab("generated");
  };

  const handleEdit = (id: string) => {
    console.log("Edit post:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete post:", id);
  };

  const handleReschedule = (id: string) => {
    console.log("Reschedule post:", id);
  };

  const handleSaveToDraft = (id: string) => {
    console.log("Save to draft:", id);
  };

  const handleBusinessEdit = (section: string) => {
    console.log("Edit business section:", section);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesFilter =
      filter === "all" || post.platforms.includes(filter as any);
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
                totalPosts={posts.length}
                filteredPosts={filteredPosts.length}
              />
            </div>
            <div
              className={`max-w-[1200px] mx-auto px-4 sm:px-6 ${
                view === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                  : "flex flex-col items-center space-y-6"
              }`}
            >
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
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
            data={sampleBusinessData}
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
          websites={sampleWebsites}
          selectedWebsite={selectedWebsite}
          onWebsiteChange={setSelectedWebsite}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onAddBusiness={handleGeneratePosts}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onNewPost={handleNewPost}
        />
        <Header
          userName="John Doe"
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
