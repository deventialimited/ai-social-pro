// @ts-nocheck is at the top, but let's fix the type issues properly
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Cookies from "js-cookie";
import { CiEdit } from "react-icons/ci";
import { MdSaveAlt } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa6";

const API_BASE_URL = "https://ai-social-pro.onrender.com"; // or "http://localhost:5000"

interface DomainData {
  domain: string;
  logoUrl?: string;
  clientName?: string;
  [key: string]: any;
}

interface PostData {
  image?: string;
  topic?: string;
  content?: string;
  post_id?: string;
  website?: string;
  date?: string;
  platform?: string;
}

interface ClientBusinessData {
  domains?: Record<string, any>;
  posts?: PostData[];
  [key: string]: any;
}

/** Flatten nested domains object => array of { domain: "example.com", ...data } */
function flattenDomains(domainsObj: Record<string, any>): DomainData[] {
  const results: DomainData[] = [];

  function recurse(node: any, path: string) {
    if (typeof node !== "object" || node === null) return;
    const keys = Object.keys(node);

    // If exactly one key and it's an object, keep merging (avoids Mongo . replacements).
    if (
      keys.length === 1 &&
      typeof node[keys[0]] === "object" &&
      !Array.isArray(node[keys[0]])
    ) {
      const nextKey = sanitizeKey(keys[0]);
      const newPath = path ? `${path}.${nextKey}` : nextKey;
      recurse(node[keys[0]], newPath);
    } else {
      // Leaf node
      let finalDomain = sanitizeKey(path);
      // remove protocols
      finalDomain = finalDomain.replace(/^https?:\/\//, "");
      // remove trailing slash
      finalDomain = finalDomain.replace(/\/+$/, "");
      if (!finalDomain) return;

      results.push({
        domain: finalDomain,
        ...node,
      });
    }
  }

  function sanitizeKey(str: string) {
    if (!str) return "";
    return str
      .replace(/_+dot_+/gi, ".")
      .replace(/___dot___/gi, ".")
      .replace(/___DOT___/g, ".")
      .replace(/_dot_/g, ".")
      .replace(/\/+$/, "");
  }

  for (const topKey of Object.keys(domainsObj)) {
    const cleanTop = sanitizeKey(topKey);
    recurse(domainsObj[topKey], cleanTop);
  }
  return results;
}

interface PostCardProps {
  image?: string;
  topic?: string;
  content?: string;
  post_id?: string;
  website?: string;
  date?: string;
  platform?: string;
  onPost?: (post: PostData) => void;
  logoUrl?: string;
  clientName?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  image = "",
  topic = "",
  content = "",
  post_id = "",
  website = "",
  date = "",
  platform = "",
  onPost,
  logoUrl = "",
  clientName = "",
}) => {
  const [expanded, setExpanded] = useState(false);
  const [clientDetails, setClientDetails] = useState<{
    logoUrl: string;
    clientName: string;
  }>({
    logoUrl: logoUrl || "",
    clientName: clientName || "Anonymous User",
  });

  useEffect(() => {
    // Get the client domain details from localStorage
    try {
      const storedDetails = localStorage.getItem("clientDomainDetails");
      if (storedDetails) {
        const clientDomainDetails = JSON.parse(storedDetails);

        // Find the client details that match the current post's website
        const matchingClient = clientDomainDetails.find(
          (client: any) => client.domain === website
        );

        if (matchingClient) {
          setClientDetails({
            logoUrl: matchingClient.logoUrl || "",
            clientName: matchingClient.clientName || "Anonymous User",
          });
        }
      }
    } catch (error) {
      console.error("Error retrieving client details:", error);
    }
  }, [website]);

  const handleEditClick = () => {
    if (onPost) {
      onPost({ image, topic, content, post_id, website, date, platform });
    }
  };

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <div className="w-full flex flex-col sm:grid sm:grid-cols-[2fr_800px_1fr] gap-x-0 gap-y-4 px-2">
      <div
        tabIndex={1}
        className="post-container relative px-6 group/card col-start-2 h-fit max-w-full"
      >
        <div className="w-full shadow-lg rounded-lg mx-auto p-0 bg-white px-8">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-purple-600 mr-3 flex-shrink-0 cursor-pointer">
                <img
                  src={
                    clientDetails.logoUrl ||
                    "https://www.w3schools.com/w3images/avatar2.png"
                  }
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium text-gray-800 cursor-pointer">
                  {clientDetails.clientName || "Anonymous User"}
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
              <span className="mr-2"> {post_id} </span>

              <span>{platform || "Facebook"}</span>
            </div>
            <div className="cursor-pointer">Post Analytics</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Posts: React.FC = () => {
  const navigate = useNavigate();

  // We add a refreshToken to trigger the sidebar to re-run localStorage reading
  const [refreshToken, setRefreshToken] = useState(0);

  const [posts, setPosts] = useState<PostData[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);
  const [clientBusiness, setClientBusiness] = useState<ClientBusinessData>({});

  // Re-trigger the sidebar's effect to read localStorage
  function refreshSidebar() {
    setRefreshToken((prev) => prev + 1);
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    const year = date.getFullYear();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const day = `0${date.getDate()}`.slice(-2);
    const hours = `0${date.getHours()}`.slice(-2);
    const minutes = `0${date.getMinutes()}`.slice(-2);
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  useEffect(() => {
    (async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          navigate("/login");
          return;
        }

        const cookieDomain = Cookies.get("websitename");
        if (cookieDomain) {
          setSelectedDomain(cookieDomain);
        }

        setLoading(true);
        const resp = await fetch(`${API_BASE_URL}/api/posts/getuserposts`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!resp.ok) {
          throw new Error(`Error fetching posts: ${resp.statusText}`);
        }
        const data = await resp.json();

        if (data.domains && typeof data.domains === "object") {
          const domainEntries = Object.entries(data.domains);

          const domainDetails = domainEntries.map(
            ([domain, values]: [string, any]) => {
              return {
                domain,
                logoUrl: values.logoUrl,
                clientName: values.clientName,
              };
            }
          );

          console.log(domainDetails);

          // Example: Save or use the extracted data
          localStorage.setItem(
            "clientDomainDetails",
            JSON.stringify(domainDetails)
          );
        }

        setClientBusiness(data);
        console.log(" CLIENT DATA IS ", clientBusiness, "DATA IS ", data);

        // Flatten the user domains object
        if (data.domains && typeof data.domains === "object") {
          const flattened = flattenDomains(data.domains);

          // Save the entire flattened array in localStorage
          localStorage.setItem("domainforcookies", JSON.stringify(flattened));

          // Also provide a simple array of domain strings
          const domainNames = flattened.map((obj) => obj.domain);
          setDomains(domainNames);

          // This is where we can trigger the Sidebar to update if we want
          refreshSidebar();
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

  const handlePost = (post: PostData) => {
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

  const filteredPosts = !selectedDomain
    ? posts
    : posts.filter(
        (p) =>
          p.website && p.website.toLowerCase() === selectedDomain.toLowerCase()
      );

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    Cookies.set("websitename", domain, { expires: 55 / 60 });
  };

  return (
    <>
      <div className="[grid-area:content] h-full flex flex-col overflow-auto bg-blue-50">
        <div className="min-h-0 flex-grow flex flex-col overflow-y-auto overflow-x-hidden pb-12">
          <div className="sticky top-0 z-[100]">
            <div className="flex fixed top-0 left-0 right-0 z-10">
              <div>
                {/* 
                  NOTE: we pass refreshToken to the Sidebar so it re-runs 
                  its effect whenever we call refreshSidebar(). 
                */}
                <Sidebar
                  refreshToken={refreshToken}
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
                      date={formatDate(post.date || "")}
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
            <div className="flex gap-2 ">
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
              {filteredPosts.length} post{filteredPosts.length !== 1 && "s"}{" "}
              found
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Posts;
