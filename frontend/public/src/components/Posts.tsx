// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { CiEdit } from "react-icons/ci";
import { MdSaveAlt } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa6";

const API_BASE_URL = "https://ai-social-pro.onrender.com"; // || "http://localhost:5000"

const PostCard = ({
  image = "",
  topic = "",
  content = "",
  post_id = "",
  website = "",
  date = "",
  platform = "",
  onPost,
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleEditClick = () => {
    if (onPost) {
      onPost({ image, topic, content, post_id, website, date, platform });
    }
  };

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <div className="w-full flex flex-col sm:grid sm:grid-cols-[2fr_800px_1fr] gap-x-0 gap-y-4 px-2">
      <div
        tabIndex="1"
        className="post-container relative px-6 group/card col-start-2 h-fit max-w-full"
      >
        <div className="w-full shadow-lg rounded-lg mx-auto p-0 bg-white px-8">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-purple-600 mr-3 flex-shrink-0 cursor-pointer">
                <img
                  src="/api/placeholder/40/40"
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium text-gray-800 cursor-pointer">
                  Anonymous User
                </div>
                <div className="text-xs text-gray-500">879,873 followers</div>
              </div>
            </div>
            <button className="text-gray-500">
              <span className="text-xl">...</span>
            </button>
          </div>

          <div className="shadow-[2px_2px_5px_rgba(0,0,0,0.1),-2px_-2px_5px_rgba(0,0,0,0.1)]">
            <div className="px-4 py-2">
              <p
                className={`text-gray-700 text-sm ${
                  expanded ? "" : "line-clamp-2"
                }`}
              >
                {content ||
                  "Hilma's move-in ready office made it easy to quickly take their business further. It's simplicity and growth made at WeWork."}
              </p>
              {content?.length > 100 && (
                <button
                  className="text-blue-500 text-xs mt-1 cursor-pointer"
                  onClick={toggleExpanded}
                >
                  {expanded ? "Show Less" : "Show More"}
                </button>
              )}
            </div>

            <div className="relative w-full">
              <img
                loading="lazy"
                className="w-full object-contain"
                alt={topic || "Post image"}
                src={image || "/api/placeholder/800/500"}
              />
            </div>

            <div className="flex border-gray-200 py-2 gap-8 w-[250px] mx-auto mt-4 h-auto">
              <button
                className="flex-1 flex justify-center items-center text-gray-600 cursor-pointer border border-gray-300 rounded-sm text-1xl px-3"
                onClick={handleEditClick}
              >
                <CiEdit />
              </button>

              <button className="flex-1 flex justify-center items-center text-gray-600 cursor-pointer border border-gray-300 rounded-sm text-1xl px-3">
                <MdSaveAlt />
              </button>
              <button className="flex-1 flex justify-center items-center text-gray-600 cursor-pointer border border-gray-300 rounded-sm text-1xl px-3">
                <MdDelete />
              </button>
              <button className="flex-1 flex justify-center items-center text-gray-600 cursor-pointer border border-gray-300 rounded-sm text-lg">
                Schedule
                <button className="flex items-center justify-center px-2 text-gray-600 cursor-pointer"></button>
                <button className="">
                  <span className="flex items-center justify-center px-2 text-gray-600 cursor-pointer ">
                    <FaAngleDown />
                  </span>
                </button>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 p-2 py-6">
            <div className="flex items-center">
              <span className="mr-2">📅 {date || "Mar 10, 2023"}</span>
              <span className="mr-2"># rechks</span>
              <span>{platform || "Facebook"}</span>
            </div>
            <div className="cursor-pointer">Post Analytics</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [domainMap, setDomainMap] = useState<any>({});

  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);

  const [selectedDomain, setSelectedDomain] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          navigate("/login");
          return;
        }

        setLoading(true);
        const resp = await fetch(`${API_BASE_URL}/api/posts/getuserposts`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!resp.ok) {
          throw new Error(`Error fetching posts: ${resp.statusText}`);
        }
        const data = await resp.json();

        if (data.domains) {
          setDomainMap(data.domains);

          const keys = Object.keys(data.domains).map((key) =>
            key.replace(/___DOT___/g, ".")
          );
          setDomains(keys);
        }

        if (data.posts) {
          setPosts(data.posts);
        }
      } catch (err) {
        console.error("Error fetching posts from API:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handlePost = (post) => {
    navigate("/editor", { state: post });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleBusiness = () => {
    setIsBusinessOpen(!isBusinessOpen);
  };

  const openProfile = () => {
    navigate("/profile");
  };

  const filteredPosts = (() => {
    if (!selectedDomain) {
      return posts;
    }
    return posts.filter(
      (p) =>
        p.website && p.website.toLowerCase() === selectedDomain.toLowerCase()
    );
  })();

  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    Cookies.set("websitename", domain, { expires: 55 / 60 });
  };

  return (
    <div className="[grid-area:content] h-full flex flex-col overflow-auto bg-blue-50">
      <div className="min-h-0 flex-grow flex flex-col overflow-y-auto overflow-x-hidden pb-12">
        <div className="sticky top-0 z-[100]">
          <div className="flex fixed top-0 left-0 right-0 z-10">
            <div>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                toggleBusiness={toggleBusiness}
                isBusinessOpen={isBusinessOpen}
                openProfile={openProfile}
                domains={domains}
                selectedDomain={selectedDomain}
                onDomainChange={handleDomainChange}
              />
            </div>
            <div className="w-full">
              <Navbar />
            </div>
          </div>
        </div>

        <div
          id="generated-post-container"
          className="flex flex-col gap-7 pt-4 items-center"
        >
          <div className="flex w-full justify-center relative py-4"></div>
          {loading ? (
            <div className="text-center text-lg">Loading posts...</div>
          ) : (
            <div className="w-full pb-8 space-y-20">
              {filteredPosts.map((post, index) => (
                <div
                  key={index}
                  className="max-sm:w-full"
                  style={{
                    transform: "translateY(0px) translateX(0px)",
                    opacity: 1,
                    willChange: "transform, opacity",
                  }}
                >
                  <PostCard
                    image={post.image || ""}
                    topic={post.topic || ""}
                    content={post.content || ""}
                    post_id={post.post_id || ""}
                    website={post.website || ""}
                    date={post.date || ""}
                    platform={post.platform || ""}
                    onPost={handlePost}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="generate-post-btn-container delay-300"
          style={{
            transform: "translateY(0px) translateX(0px)",
            opacity: 1,
            willChange: "transform, opacity",
          }}
        >
          <div className="flex gap-2">
            <button
              type="button"
              className="ant-btn css-doxyl0 ant-btn-default ant-btn-icon-only"
            >
              <span className="ant-btn-icon">
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  height="18"
                  width="18"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                  <path
                    d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7
                    9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"
                  ></path>
                </svg>
              </span>
            </button>
          </div>
          <p className="text-xs text-antd-colorTextSecondary mt-3 text-center">
            {filteredPosts.length} post{filteredPosts.length !== 1 && "s"} found
          </p>
        </div>
      </div>
    </div>
  );
};

export default Posts;
