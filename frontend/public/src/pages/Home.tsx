// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
const API_BASE_URL = "https://ai-social-pro.onrender.com"; // or "http://localhost:5000";

function checkTokenValidity(token) {
  try {
    const decoded = jwtDecode(token);
    const exp = (decoded.exp || 0) * 1000;
    return Date.now() < exp;
  } catch (error) {
    return false; // Invalid token
  }
}

/**
 * Recursively flattens the nested `domains` object from the server
 * into an array of domain objects: { domain: "www.abc.com", ...data }
 */
function flattenDomains(domainsObj) {
  const results = [];

  /**
   * @param {object} node - current sub-object in the domains structure
   * @param {string} path - accumulated path (partial domain)
   */
  function recurse(node, path) {
    if (typeof node !== "object" || node === null) return;

    // Gather keys
    const keys = Object.keys(node);

    // If there's exactly 1 key and it's an object, keep merging
    if (
      keys.length === 1 &&
      typeof node[keys[0]] === "object" &&
      !Array.isArray(node[keys[0]])
    ) {
      // Clean that key (remove weird placeholders, trailing slashes, etc.)
      let nextKey = sanitizeKey(keys[0]);
      const newPath = path ? `${path}.${nextKey}` : nextKey;
      recurse(node[keys[0]], newPath);
    } else {
      // We have arrived at a leaf-level object that presumably contains domain data
      // Clean up the current path
      let finalDomain = sanitizeKey(path);

      // Remove leading "http://" or "https://"
      finalDomain = finalDomain.replace(/^https?:\/\//, "");

      // Remove trailing slash if present
      finalDomain = finalDomain.replace(/\/+$/, "");

      // If we got an empty finalDomain, skip or handle accordingly
      if (!finalDomain) {
        console.warn("No valid domain extracted, skipping:", node);
        return;
      }

      // Create the final domain object
      const domainObj = {
        domain: finalDomain,
        ...node,
      };
      results.push(domainObj);
    }
  }

  // A small helper to transform _dot_, ___DOT___, etc. to '.' and remove extra slashes
  function sanitizeKey(str) {
    if (!str) return "";
    // Replace variations of underscores + 'dot' with '.'
    // e.g.  "___DOT___" => "."
    //       "_dot_" => "."
    //       "some___DOT___thing" => "some.thing"
    // also remove repeated underscores around 'dot'
    str = str.replace(/_+dot_+/gi, ".");
    str = str.replace(/___DOT___/g, ".");
    // In case there's leftover patterns, unify them:
    str = str.replace(/_dot_/g, ".");
    // Possibly we have partial trailing slash
    str = str.replace(/\/+$/, "");
    return str;
  }

  // Kick off recursion
  for (const topKey of Object.keys(domainsObj)) {
    const cleanKey = sanitizeKey(topKey);
    recurse(domainsObj[topKey], cleanKey);
  }

  return results;
}

const Home = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // On mount, check for token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || !checkTokenValidity(token)) {
      console.log("Invalid or missing token, redirecting to login...");
      navigate("/login");
    }
  }, [navigate]);

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    setIsValidUrl(validateUrl(value));
  };

  // Simple URL validation
  function validateUrl(v) {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" +
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" +
        "((\\d{1,3}\\.){3}\\d{1,3}))" +
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
        "(\\?[;&a-z\\d%_.~+=-]*)?" +
        "(\\#[-a-z\\d_]*)?$",
      "i"
    );
    return !!urlPattern.test(v);
  }

  function extractDomain(fullUrl) {
    try {
      const normalized = fullUrl.startsWith("http")
        ? fullUrl
        : `https://${fullUrl}`;
      return new URL(normalized).hostname;
    } catch (err) {
      console.error("Error extracting domain:", err);
      return null;
    }
  }

  const handleCreatePosts = async () => {
    const domain = extractDomain(url);
    if (!domain) {
      toast.error("Invalid domain. Please check your URL.");
      return;
    }
    setLoadingPosts(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token || !checkTokenValidity(token)) {
        toast.error("Authentication required. Please login again.");
        navigate("/login");
        return;
      }

      // Call your backend to fetch/parse domain data
      const response = await fetch(`${API_BASE_URL}/api/users/sitedata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        console.error(
          "Error from /api/users/sitedata:",
          response.status,
          await response.text()
        );
        toast.error("Failed to generate data. Please try again.");
        return;
      }

      // The server sends back something like:
      // { message: "Data saved successfully", domains: {...} }
      const data = await response.json();
      console.log("/api/users/sitedata response:", data);

      // Now flatten `data.domains` into an array of domain objects
      if (data.domains && typeof data.domains === "object") {
        const domainArray = flattenDomains(data.domains);
        // Save in localStorage
        localStorage.setItem("domainforcookies", JSON.stringify(domainArray));
      } else {
        console.warn("No domains object returned from server.");
      }
      Cookies.set("websitename", domain, { expires: 55 / 60 });
      // Also store the main domain we just processed
      localStorage.setItem("websiteName", domain);

      toast.success("Domain data processed successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error in handleCreatePosts:", error);
      toast.error("An error occurred while generating data.");
    } finally {
      setLoadingPosts(false);
    }
  };

  const goToProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 relative">
      {/* Dashboard Icon */}
      <div className="absolute top-4 right-4">
        <button
          onClick={goToProfile}
          className="text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-grid"
          >
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-link2 w-12 h-12 text-indigo-600"
            >
              <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
              <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
              <line x1="8" x2="16" y1="12" y2="12"></line>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Website to Social Media Content (v2.2)
          </h1>
          <p className="text-lg text-gray-600">
            Transform any website into engaging social media posts
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Website URL
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="url"
                id="url"
                placeholder="https://example.com"
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  isValidUrl ? "border-gray-300" : "border-red-500"
                } focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                value={url}
                onChange={handleUrlChange}
              />
              <button
                onClick={handleCreatePosts}
                className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  url && isValidUrl
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!url || !isValidUrl || loadingPosts}
              >
                {loadingPosts ? "Generating..." : "Create Posts"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
