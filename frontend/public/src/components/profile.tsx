// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import { Upload } from "lucide-react";
const API_BASE_URL = "https://ai-social-pro.onrender.com"; // or "http://localhost:5000"

const DEFAULT_BUSINESS_DATA = {
  domain: "",
  name: "no data available",
  description: "no data available",
  industry: "no data available",
  niche: "no data available",
  colors: [] as string[],
  audience: ["no data available"],
  audiencePains: ["no data available"],
  coreValues: ["1. no data available"],
  logoUrl: "",
  clientEmail: "no data available",
  clientWebsite: "no data available",
  clientName: "no data available",
  language: "no data available",
  country: "no data available",
  state: "no data available",
};

const Profile = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);

  const [business, setBusiness] = useState(DEFAULT_BUSINESS_DATA);
  const [loading, setLoading] = useState(true);

  const [selectedDomain, setSelectedDomain] = useState("");

  // On mount, verify user is logged in, else redirect
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.log("No auth token found. Redirecting...");
      navigate("/");
      return;
    }

    // Grab the domain from the cookie
    const cookieDomain = Cookies.get("websitename") || "";
    setSelectedDomain(cookieDomain);
  }, [navigate]);

  /**
   * Called whenever we choose a domain from the Sidebar
   */
  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    // We also store it in the cookie here, to stay consistent
    Cookies.set("websitename", domain, { expires: 55 / 60 });
  };

  /**
   * Once we have `selectedDomain`, load domain data from localStorage array
   * If the array is empty or we can’t find matching domain, optionally fetch from backend.
   */
  useEffect(() => {
    const fetchDataForDomain = async () => {
      setLoading(true);
      try {
        // 1. Load domain array from localStorage
        let domainDataStr = localStorage.getItem("domainforcookies");
        let domainArray = [];
        if (domainDataStr) {
          try {
            domainArray = JSON.parse(domainDataStr); // array
          } catch (error) {
            console.error("Error parsing domainforcookies:", error);
            domainArray = [];
          }
        }

        // 2. If the array is empty, fallback to backend => /api/users/lastdomain
        if (domainArray.length === 0) {
          console.log(
            "No domain array found in localStorage => fetching last domain from backend..."
          );
          const authToken = localStorage.getItem("authToken");
          if (!authToken) {
            console.log("No authToken, cannot fetch lastdomain");
            setLoading(false);
            return;
          }
          const response = await axios.get(
            `${API_BASE_URL}/api/users/lastdomain`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
          const lastDomainObj = response.data.domain || {};
          // This `lastDomainObj` is typically { "domain.com": { ...data... } }
          // Convert it into an array of domain objects
          const convertedArray = Object.keys(lastDomainObj).map((dom) => {
            return {
              domain: dom,
              ...(lastDomainObj[dom] || {}),
            };
          });
          domainArray = convertedArray;
          // Store back in localStorage
          localStorage.setItem(
            "domainforcookies",
            JSON.stringify(convertedArray)
          );
        }

        // 3. Now, from domainArray, find the domain matching `selectedDomain`
        let foundDomain = null;
        if (selectedDomain) {
          foundDomain = domainArray.find(
            (d) => d.domain?.toLowerCase() === selectedDomain.toLowerCase()
          );
        }

        // 4. If we can’t find a match but the array is not empty, fallback to first
        if (!foundDomain && domainArray.length > 0) {
          foundDomain = domainArray[0];
        }

        // 5. If we still have no domain, we do a “no data available”
        if (!foundDomain) {
          setBusiness(DEFAULT_BUSINESS_DATA);
          setLoading(false);
          return;
        }

        // 6. Otherwise, fill our business state from foundDomain
        setBusiness({
          domain: foundDomain.domain || "",
          name: foundDomain.clientName || DEFAULT_BUSINESS_DATA.name,
          clientEmail:
            foundDomain.client_email || DEFAULT_BUSINESS_DATA.clientEmail,
          clientWebsite:
            foundDomain.clientWebsite || DEFAULT_BUSINESS_DATA.clientWebsite,
          clientName:
            foundDomain.clientName || DEFAULT_BUSINESS_DATA.clientName,
          description:
            foundDomain.clientDescription || DEFAULT_BUSINESS_DATA.description,
          industry: foundDomain.industry || DEFAULT_BUSINESS_DATA.industry,
          niche: foundDomain.niche || DEFAULT_BUSINESS_DATA.niche,
          colors:
            foundDomain.colors && foundDomain.colors !== "not found"
              ? Array.isArray(foundDomain.colors)
                ? foundDomain.colors
                : foundDomain.colors.replace(/\u00A0/g, " ").split(", ")
              : DEFAULT_BUSINESS_DATA.colors,
          coreValues: foundDomain.core_values
            ? Array.isArray(foundDomain.core_values)
              ? foundDomain.core_values
              : foundDomain.core_values
                  .split(", ")
                  .map((item: string) => item.trim())
            : DEFAULT_BUSINESS_DATA.coreValues,
          audience: foundDomain.audience
            ? Array.isArray(foundDomain.audience)
              ? foundDomain.audience
              : foundDomain.audience
                  .split(", ")
                  .map((item: string) => item.trim())
            : DEFAULT_BUSINESS_DATA.audience,
          audiencePains: foundDomain.audiencePains
            ? Array.isArray(foundDomain.audiencePains)
              ? foundDomain.audiencePains
              : foundDomain.audiencePains
                  .split(", ")
                  .map((item: string) => item.trim())
            : DEFAULT_BUSINESS_DATA.audiencePains,
          language: foundDomain.language || DEFAULT_BUSINESS_DATA.language,
          country: foundDomain.country || DEFAULT_BUSINESS_DATA.country,
          state: foundDomain.state || DEFAULT_BUSINESS_DATA.state,
          logoUrl: foundDomain.logoUrl || DEFAULT_BUSINESS_DATA.logoUrl,
        });
      } catch (err) {
        console.error("Error fetching domain data:", err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDataForDomain();
  }, [selectedDomain, navigate]);

  // function for the sidebar
  const openProfile = () => {
    console.log("Already on profile page");
  };

  // code for logo to store in local storage or fetch from database
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBusiness((prev) => ({ ...prev, logoUrl: imageUrl }));
    }
  };
  const [color, setColor] = useState("#000000");
  return (
    <>
      <div className="min-h-screen  bg-white">
        <div className="flex fixed top-0 left-0 right-0 z-10">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isBusinessOpen={isBusinessOpen}
            toggleBusiness={() => setIsBusinessOpen(!isBusinessOpen)}
            openProfile={openProfile}
            // pass these so user can select domain in the sidebar
            domains={[]} // If you want the domains from /api/posts, that’s separate. You can pass if needed
            selectedDomain={selectedDomain}
            onDomainChange={handleDomainChange}
          />
          <div className="w-full">
            <Navbar />
          </div>
        </div>

        <div className="flex flex-col md:flex-row mt-16">
          <div className="flex-1 bg-blue-50">
            <div className="hidden md:flex md:pl-6 pt-4 items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Profile</h2>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-center py-8">
                  <p>Loading business data...</p>
                </div>
              ) : (
                <>
                  <div
                    className="bg-white rounded-lg 
                  shadow-md p-6 pl-9 max-w-2xl mx-auto mb-6"
                  >
                    <h2 className="text-xl font-bold mb-2">Your Business</h2>
                    <p className="text-gray-500 mb-4">
                      Your business details will be referenced in your captions
                      and post designs.
                    </p>
                    {/* logo images */}
                    <div className="mb-4">
                      <div className="relative group h-28 w-28 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                        {business.logoUrl ? (
                          <img
                            src={business.logoUrl}
                            alt={business.name}
                            className="w-28 h-28 object-cover rounded-lg"
                          />
                        ) : (
                          <img
                            src="https://www.w3schools.com/w3images/avatar2.png"
                            alt="default avatar"
                            className="w-28 h-28 object-contain rounded-lg"
                          />
                        )}

                        {/* Overlay upload */}
                        <div
                          className="absolute bottom-0 left-0 w-full h-full bg-black/40 flex items-center justify-center 
          translate-y-full group-hover:translate-y-0 transition-all duration-300 ease-in-out"
                        >
                          <input
                            type="file"
                            id="logo-upload"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                          <label
                            htmlFor="logo-upload"
                            className="cursor-pointer text-white p-2 bg-white/20 rounded-full hover:bg-white/30"
                          >
                            <Upload size={20} />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* logo image div ended here */}
                    <div className="mb-2">
                      <strong className="block mb-1">Business Name:</strong>
                      <span className="text-gray-700">{business.name}</span>
                    </div>

                    <div className="mb-2">
                      <strong className="block mb-1">Description:</strong>
                      <span className="text-gray-700">
                        {business.description}
                      </span>
                    </div>

                    <div className="mb-2">
                      <strong className="block mb-1">Industry:</strong>
                      <span className="text-gray-700">{business.industry}</span>
                    </div>

                    <div className="mb-2">
                      <strong className="block mb-1">Niche:</strong>
                      <span className="text-gray-700">{business.niche}</span>
                    </div>

                    <div className="mb-2">
                      <strong className="block mb-1">Brand Colors:</strong>
                      <div className="flex items-center space-x-2">
                        {business.colors && business.colors.length > 0 ? (
                          business.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border border-gray-200"
                              style={{ backgroundColor: color }}
                            />
                          ))
                        ) : (
                          <span className="text-gray-500">
                            No data available
                          </span>
                        )}
                        <div>
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                          />
                          <p>Selected Color: {color}</p>
                          <div
                            style={{
                              width: "100px",
                              height: "100px",
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <strong className="block mb-1">Client Email:</strong>
                      <span className="text-gray-700">
                        {business.clientEmail}
                      </span>
                    </div>

                    <div className="mb-2">
                      <strong className="block mb-1">Website:</strong>
                      <span className="text-gray-700">
                        {business.clientWebsite}
                      </span>
                    </div>

                    <div className="mb-2">
                      <strong className="block mb-1">Language:</strong>
                      <span className="text-gray-700">{business.language}</span>
                    </div>

                    <div className="mb-2">
                      <strong className="block mb-1">Country:</strong>
                      <span className="text-gray-700">{business.country}</span>
                    </div>

                    <div className="mb-2">
                      <strong className="block mb-1">State/Region:</strong>
                      <span className="text-gray-700">{business.state}</span>
                    </div>
                  </div>

                  {/* MARKETING STRATEGY SECTION */}
                  <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold mb-2">
                      Marketing Strategy
                    </h2>

                    <h3 className="font-bold mb-2">Audience</h3>
                    <ul className="list-disc pl-5 mb-4">
                      {business.audience.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>

                    <h3 className="font-bold mb-2">Audience Pains</h3>
                    <ul className="list-disc pl-5 mb-4">
                      {business.audiencePains.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>

                    <h3 className="font-bold mb-2">Core Values</h3>
                    <ul className="list-disc pl-5 mb-4">
                      {business.coreValues.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
