// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Helper function to get a cookie by name

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/** Attempt to refresh the ID token if it's expired. */

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
    // Pass the full post object to Editor
    if (onPost) {
      onPost({ image, topic, content, post_id, website, date, platform });
    }
  };

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <div className="w-full flex flex-col sm:grid sm:grid-cols-[1fr_450px_1fr] gap-x-0 gap-y-4 px-2">
      <div
        tabIndex="1"
        className="post-container relative px-6 group/card col-start-2 h-fit max-w-full"
      >
        <div className="w-full cursor-pointer shadow-lg rounded-lg mx-auto p-4 shadow-md bg-white">
          {/* Top-right button (3 dots) - if you want an actions menu */}
          <button
            type="button"
            className="ant-btn css-doxyl0 ant-btn-default ant-btn-icon-only !size-10 z-10 absolute right-2 top-1.5 ant-dropdown-trigger"
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
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path
                  d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2
                  2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2
                  2-.9 2-2-.9-2-2-2z"
                ></path>
              </svg>
            </span>
          </button>

          {/* Topic (title) */}
          <div className="text-center mt-2 mb-2">
            <h2 className="text-xl font-semibold">{topic}</h2>
          </div>

          {/* Image */}
          <div className="relative flex justify-center">
            <img
              loading="lazy"
              className="object-contain rounded border border-solid border-antd-colorBorder sm:w-[366px]"
              alt={topic}
              src={image}
            />
          </div>

          {/* Content (limited to 2 lines if not expanded) */}
          <div
            className={`text-xs mt-4 whitespace-pre-wrap ${
              expanded ? "" : "line-clamp-2 overflow-hidden"
            }`}
            style={{
              display: "-webkit-box",
              WebkitLineClamp: expanded ? "none" : "2",
              WebkitBoxOrient: "vertical",
            }}
          >
            {content}
          </div>
          {content.length > 100 && (
            <button
              className="text-blue-500 underline text-xs mt-1"
              onClick={toggleExpanded}
            >
              {expanded ? "Show Less" : "Show More"}
            </button>
          )}

          {/* Post details: post_id, website, date, platform */}
          <div className="mt-4 text-sm space-y-1">
            <div>
              <strong>Post ID:</strong> {post_id}
            </div>
            <div>
              <strong>Website:</strong> {website}
            </div>
            <div>
              <strong>Date:</strong> {date}
            </div>
            <div>
              <strong>Platform:</strong> {platform}
            </div>
          </div>

          {/* Actions at bottom (Edit, etc.) */}
          <div className="mt-5 flex flex-row gap-2 items-center justify-center">
            <div className="post-actions flex space-x-2">
              <button
                id="edit-post-btn"
                type="button"
                className="ant-btn css-doxyl0 ant-btn-default ant-btn-icon-only icon-btn"
                onClick={handleEditClick}
              >
                <span className="ant-btn-icon">
                  <span
                    role="img"
                    aria-label="edit"
                    className="anticon anticon-edit"
                  >
                    <svg
                      viewBox="64 64 896 896"
                      focusable="false"
                      data-icon="edit"
                      width="1em"
                      height="1em"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96
                          9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2
                          1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5
                          168.2a33.5 33.5 0 009.4
                          29.8c6.6 6.4 14.9 9.9 23.8
                          9.9zm67.4-174.4L687.8 215l73.3
                          73.3-362.7 362.6-88.9
                          15.7 15.6-89zM880 836H144c-17.7
                          0-32 14.3-32
                          32v36c0 4.4 3.6 8
                          8 8h784c4.4 0 8-3.6
                          8-8v-36c0-17.7-14.3-32-32-32z"
                      ></path>
                    </svg>
                  </span>
                </span>
              </button>
              {/* You can add more action buttons here if needed */}
            </div>
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

  // The domain selected from the dropdown
  const [selectedDomain, setSelectedDomain] = useState("");

  const navigate = useNavigate();

  // On mount, refresh token if needed, then fetch posts
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

        // 1) Store domain map
        if (data.domains) {
          setDomainMap(data.domains);

          // Convert encoded domain keys back to original format
          const keys = Object.keys(data.domains).map((key) =>
            key.replace(/___DOT___/g, ".")
          );
          setDomains(keys);
        }

        // 2) Store posts
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
    // Navigate to Editor, passing the full post
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

  // Filter posts by the "website" field if selectedDomain is set
  const filteredPosts = (() => {
    if (!selectedDomain) {
      // if no domain selected, show all
      return posts;
    }
    // else filter by matching post.website to selectedDomain
    return posts.filter(
      (p) =>
        p.website && p.website.toLowerCase() === selectedDomain.toLowerCase()
    );
  })();

  const handleDomainChange = (e) => {
    const val = e.target.value;
    setSelectedDomain(val);
    // optionally update the cookie so next time we open the page, that domain is chosen
    Cookies.set("websitename", val, { expires: 55 / 60 });
  };

  return (
    <div className="[grid-area:content] h-full flex flex-col overflow-auto bg-blue-50">
      <div className="min-h-0 flex-grow flex flex-col overflow-y-auto overflow-x-hidden pb-12">
        {/* Top Nav */}
        <div className="sticky top-0 z-[100]">
          <div className="flex fixed top-0 left-0 right-0 z-10">
            <div>
              <Sidebar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                toggleBusiness={toggleBusiness}
                isBusinessOpen={isBusinessOpen}
                openProfile={openProfile}
              />
            </div>
            <div className="w-full">
              <Navbar />
            </div>
          </div>
        </div>

        {/* Domain selection */}
        <div className="flex items-center justify-end mt-16 px-4 py-2 space-x-3">
          <label htmlFor="domainSelect" className="font-semibold text-gray-700">
            Select Website:
          </label>
          <select
            id="domainSelect"
            className="border border-gray-300 rounded px-2 py-1"
            value={selectedDomain}
            onChange={handleDomainChange}
          >
            <option value="">-- All Websites --</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Post container */}
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

        {/* Floating button and post count */}
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
