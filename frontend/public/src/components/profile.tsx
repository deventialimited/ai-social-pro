// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import axios from "axios";
// imported react 1werwer
const API_BASE_URL = "https://ai-social-pro.onrender.com"; //|| "http://localhost:5000"

const DEFAULT_BUSINESS_DATA = {
  name: "no data available",
  description: "no data available",
  industry: "no data available",
  niche: "no data available",
  colors: [] as string[], // Explicitly define it as a string array
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

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      console.log("No auth token found. Redirecting...");
      navigate("/");
      return;
    }

    const fetchBusinessData = async () => {
      try {
        let domainsData = JSON.parse(localStorage.getItem("domainforcookies"));

        if (!domainsData || Object.keys(domainsData).length === 0) {
          console.log("No data in localStorage, fetching from backend...");
          const response = await axios.get(
            "https://ai-social-pro.onrender.com/api/users/lastdomain",
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          domainsData = response.data.domain;
          console.log("Fetched from backend:", domainsData);

          // Optional: Save it to localStorage
          localStorage.setItem("domainforcookies", JSON.stringify(domainsData));
        } else {
          console.log("Loaded from localStorage:", domainsData);
        }

        if (!domainsData || Object.keys(domainsData).length === 0) {
          console.log("No business data found");
          setLoading(false);
          return;
        }

        const firstDomainPrefix = Object.keys(domainsData)[0];
        const businessData = domainsData[firstDomainPrefix];

        if (!businessData) {
          console.log("No business data found in the response structure");
          setLoading(false);
          return;
        }

        setBusiness({
          name: businessData.clientName || DEFAULT_BUSINESS_DATA.name,
          clientEmail:
            businessData.client_email || DEFAULT_BUSINESS_DATA.clientEmail,
          clientWebsite:
            businessData.clientWebsite || DEFAULT_BUSINESS_DATA.clientWebsite,
          clientName:
            businessData.clientName || DEFAULT_BUSINESS_DATA.clientName,
          description:
            businessData.clientDescription || DEFAULT_BUSINESS_DATA.description,
          industry: businessData.industry || DEFAULT_BUSINESS_DATA.industry,
          niche: businessData.niche || DEFAULT_BUSINESS_DATA.niche,
          colors:
            businessData.colors && businessData.colors !== "not found"
              ? Array.isArray(businessData.colors)
                ? businessData.colors
                : businessData.colors.replace(/\u00A0/g, " ").split(", ")
              : DEFAULT_BUSINESS_DATA.colors,
          coreValues: businessData.core_values
            ? Array.isArray(businessData.core_values)
              ? businessData.core_values
              : businessData.core_values
                  .split(", ")
                  .map((item: string) => item.trim())
            : DEFAULT_BUSINESS_DATA.coreValues,
          audience: businessData.audience
            ? Array.isArray(businessData.audience)
              ? businessData.audience
              : businessData.audience
                  .split(", ")
                  .map((item: string) => item.trim())
            : DEFAULT_BUSINESS_DATA.audience,
          audiencePains: businessData.audiencePains
            ? Array.isArray(businessData.audiencePains)
              ? businessData.audiencePains
              : businessData.audiencePains
                  .split(", ")
                  .map((item: string) => item.trim())
            : DEFAULT_BUSINESS_DATA.audiencePains,
          language: businessData.language || DEFAULT_BUSINESS_DATA.language,
          country: businessData.country || DEFAULT_BUSINESS_DATA.country,
          state: businessData.state || DEFAULT_BUSINESS_DATA.state,
          logoUrl: businessData.logoUrl || DEFAULT_BUSINESS_DATA.logoUrl,
        });
      } catch (err) {
        console.error("Error fetching business data:", err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [navigate]);

  // Function to open profile page - already on profile page, but needed for Sidebar prop
  const openProfile = () => {
    // Already on profile page, so this is just a placeholder
    console.log("Already on profile page");
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="flex fixed top-0 left-0 right-0 z-10">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isBusinessOpen={isBusinessOpen}
            toggleBusiness={() => setIsBusinessOpen(!isBusinessOpen)}
            openProfile={openProfile}
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
                  <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mb-6">
                    <h2 className="text-xl font-bold mb-2">Your Business</h2>
                    <p className="text-gray-500 mb-4">
                      Your business details will be referenced in your captions
                      and post designs.
                    </p>

                    {/* <div className="mb-4">
                    {business.logoUrl ? (
                      <img
                        src={business.logoUrl}
                        alt={business.name}
                        className="h-32 object-contain"
                      />
                    ) : (
                      <p className="text-gray-400">No logo available.</p>
                    )}
                  </div> */}

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
