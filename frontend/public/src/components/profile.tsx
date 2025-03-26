// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import axios from "axios";
import Cookies from "js-cookie";
import { Upload } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext"; // Import the theme context

const API_BASE_URL = "https://ai-social-pro.onrender.com"; // or "http://localhost:5000"

const DEFAULT_BUSINESS_DATA = {
  domain: "",
  name: "no data available",
  description: "no data available",
  industry: "no data available",
  niche: "no data available",
  colors: ["#000000", "#FFFFFF", "#000000"],
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
  const { theme } = useTheme(); // Access the current theme
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);
  const [business, setBusiness] = useState(DEFAULT_BUSINESS_DATA);
  const [editedBusiness, setEditedBusiness] = useState(business);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState("");

  useEffect(() => {
    setEditedBusiness(business);
  }, [business]);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      navigate("/");
      return;
    }
    const cookieDomain = Cookies.get("websitename") || "";
    setSelectedDomain(cookieDomain);
  }, [navigate]);

  useEffect(() => {
    const fetchDataForDomain = async () => {
      setLoading(true);
      try {
        let domainDataStr = localStorage.getItem("domainforcookies");
        let domainArray = [];
        if (domainDataStr) {
          domainArray = JSON.parse(domainDataStr);
        }

        if (domainArray.length === 0) {
          const authToken = localStorage.getItem("authToken");
          if (!authToken) {
            setLoading(false);
            return;
          }
          const response = await axios.get(`${API_BASE_URL}/api/users/lastdomain`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          const lastDomainObj = response.data.domain || {};
          const convertedArray = Object.keys(lastDomainObj).map((dom) => ({
            domain: dom,
            ...(lastDomainObj[dom] || {}),
          }));
          domainArray = convertedArray;
          localStorage.setItem("domainforcookies", JSON.stringify(convertedArray));
        }

        let foundDomain = null;
        if (selectedDomain) {
          foundDomain = domainArray.find(
            (d) => d.domain?.toLowerCase() === selectedDomain.toLowerCase()
          );
        }
        if (!foundDomain && domainArray.length > 0) {
          foundDomain = domainArray[0];
        }

        if (!foundDomain) {
          setBusiness(DEFAULT_BUSINESS_DATA);
          setLoading(false);
          return;
        }

        const colors = foundDomain.colors && foundDomain.colors !== "not found"
          ? foundDomain.colors.replace(/\u00A0/g, " ").split(", ")
          : DEFAULT_BUSINESS_DATA.colors;

        setBusiness({
          domain: foundDomain.domain || "",
          name: foundDomain.clientName || DEFAULT_BUSINESS_DATA.name,
          clientEmail: foundDomain.client_email || DEFAULT_BUSINESS_DATA.clientEmail,
          clientWebsite: foundDomain.clientWebsite || DEFAULT_BUSINESS_DATA.clientWebsite,
          clientName: foundDomain.clientName || DEFAULT_BUSINESS_DATA.clientName,
          description: foundDomain.clientDescription || DEFAULT_BUSINESS_DATA.description,
          industry: foundDomain.industry || DEFAULT_BUSINESS_DATA.industry,
          niche: foundDomain.niche || DEFAULT_BUSINESS_DATA.niche,
          colors: colors.length >= 3 
            ? [colors[0], colors[1], colors[2]]
            : [...colors, ...DEFAULT_BUSINESS_DATA.colors.slice(colors.length, 3)],
          coreValues: foundDomain.core_values
            ? Array.isArray(foundDomain.core_values)
              ? foundDomain.core_values
              : foundDomain.core_values.split(", ").map((item) => item.trim())
            : DEFAULT_BUSINESS_DATA.coreValues,
          audience: foundDomain.audience
            ? Array.isArray(foundDomain.audience)
              ? foundDomain.audience
              : foundDomain.audience.split(", ").map((item) => item.trim())
            : DEFAULT_BUSINESS_DATA.audience,
          audiencePains: foundDomain.audiencePains
            ? Array.isArray(foundDomain.audiencePains)
              ? foundDomain.audiencePains
              : foundDomain.audiencePains.split(", ").map((item) => item.trim())
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

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    Cookies.set("websitename", domain, { expires: 55 / 60 });
  };

  const openProfile = () => {
    console.log("Already on profile page");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setEditedBusiness((prev) => ({ ...prev, logoUrl: imageUrl }));
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditedBusiness({ ...business });
  };

  const handleSave = () => {
    if (JSON.stringify(editedBusiness) === JSON.stringify(business)) {
      toast.success("No changes detected");
    } else {
      setBusiness({ ...editedBusiness });
      toast.success("Changes saved");
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditedBusiness(business);
    setEditing(false);
  };

  const handleFieldClick = () => {
    if (!editing) {
      handleEdit();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background text-text">
        <div className="flex fixed top-0 left-0 right-0 z-10">
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isBusinessOpen={isBusinessOpen}
            toggleBusiness={() => setIsBusinessOpen(!isBusinessOpen)}
            openProfile={openProfile}
            domains={[]}
            selectedDomain={selectedDomain}
            onDomainChange={handleDomainChange}
          />
          <div className="w-full">
            <Navbar />
          </div>
        </div>

        <div className="flex flex-col md:flex-row mt-16">
          <div className="flex-1 bg-blue-50 dark:bg-gray-800">
            <div className="hidden md:flex md:pl-6 pt-4 items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h2>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-300">Loading business data...</p>
                </div>
              ) : (
                <>
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 pl-9 max-w-2xl mx-auto mb-6">
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Your Business</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Your business details will be referenced in your captions and post designs.
                    </p>

                    {/* Logo */}
                    <div className="mb-4">
                      <div className="relative group h-28 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                        {editing ? (
                          <>
                            <img
                              src={editedBusiness.logoUrl || "https://www.w3schools.com/w3images/avatar2.png"}
                              alt={business.name}
                              className="w-28 h-28 object-cover rounded-lg"
                            />
                            <div className="absolute bottom-0 left-0 w-full h-full bg-black/40 flex items-center justify-center transition-all duration-300 ease-in-out">
                              <input
                                type="file"
                                id="logo-upload"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept="image/*"
                              />
                              <label
                                htmlFor="logo-upload"
                                className="cursor-pointer text-white p-2 bg-white/20 rounded-full hover:bg-white/30"
                              >
                                <Upload size={20} />
                              </label>
                            </div>
                          </>
                        ) : (
                          <div
                            className="cursor-pointer w-full h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600"
                            onClick={handleFieldClick}
                          >
                            <img
                              src={business.logoUrl || "https://www.w3schools.com/w3images/avatar2.png"}
                              alt={business.name}
                              className="w-28 h-28 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business Name */}
                    <div className="mb-2">
                      <strong className="block mb-1 text-gray-900 dark:text-white">Business Name:</strong>
                      {editing ? (
                        <input
                          type="text"
                          value={editedBusiness.name}
                          onChange={(e) => setEditedBusiness({ ...editedBusiness, name: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <span
                          className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                          onClick={handleFieldClick}
                        >
                          {business.name}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <div className="mb-2">
                      <strong className="block mb-1 text-gray-900 dark:text-white">Description:</strong>
                      {editing ? (
                        <textarea
                          value={editedBusiness.description}
                          onChange={(e) => setEditedBusiness({ ...editedBusiness, description: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <span
                          className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                          onClick={handleFieldClick}
                        >
                          {business.description}
                        </span>
                      )}
                    </div>

                    {/* Industry */}
                    <div className="mb-2">
                      <strong className="block mb-1 text-gray-900 dark:text-white">Industry:</strong>
                      {editing ? (
                        <input
                          type="text"
                          value={editedBusiness.industry}
                          onChange={(e) => setEditedBusiness({ ...editedBusiness, industry: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <span
                          className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                          onClick={handleFieldClick}
                        >
                          {business.industry}
                        </span>
                      )}
                    </div>

                    {/* Niche */}
                    <div className="mb-2">
                      <strong className="block mb-1 text-gray-900 dark:text-white">Niche:</strong>
                      {editing ? (
                        <input
                          type="text"
                          value={editedBusiness.niche}
                          onChange={(e) => setEditedBusiness({ ...editedBusiness, niche: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <span
                          className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                          onClick={handleFieldClick}
                        >
                          {business.niche}
                        </span>
                      )}
                    </div>

                    {/* Brand Colors Section */}
                    <div className="mb-2">
                      <strong className="block mb-1 text-gray-900 dark:text-white">Brand Colors:</strong>
                      <div className="flex flex-row space-x-4">
                        {editing ? (
                          <>
                            <div className="flex items-center space-x-2 border border-gray-600 dark:border-gray-400 rounded-lg p-1">
                              <input
                                type="color"
                                value={editedBusiness.colors[0]}
                                onChange={(e) => setEditedBusiness({
                                  ...editedBusiness,
                                  colors: [e.target.value, editedBusiness.colors[1], editedBusiness.colors[2]]
                                })}
                                className="w-8 h-8"
                              />
                              <label className="text-gray-900 dark:text-white">Brand Color</label>
                            </div>
                            <div className="flex items-center space-x-2 border border-gray-600 dark:border-gray-400 rounded-lg p-1">
                              <input
                                type="color"
                                value={editedBusiness.colors[1]}
                                onChange={(e) => setEditedBusiness({
                                  ...editedBusiness,
                                  colors: [editedBusiness.colors[0], e.target.value, editedBusiness.colors[2]]
                                })}
                                className="w-8 h-8"
                              />
                              <label className="text-gray-900 dark:text-white">Background Color</label>
                            </div>
                            <div className="flex items-center space-x-2 border border-gray-600 dark:border-gray-400 rounded-lg p-1">
                              <input
                                type="color"
                                value={editedBusiness.colors[2]}
                                onChange={(e) => setEditedBusiness({
                                  ...editedBusiness,
                                  colors: [editedBusiness.colors[0], editedBusiness.colors[1], e.target.value]
                                })}
                                className="w-8 h-8"
                              />
                              <label className="text-gray-900 dark:text-white">Text Color</label>
                            </div>
                          </>
                        ) : (
                          <div
                            className="flex flex-row space-x-4 cursor-pointer"
                            onClick={handleFieldClick}
                          >
                            <div className="flex items-center space-x-2 border border-gray-600 dark:border-gray-400 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div
                                className="w-6 h-6 border border-gray-200 dark:border-gray-600"
                                style={{ backgroundColor: business.colors[0] }}
                              />
                              <span className="text-gray-900 dark:text-white">Brand Color</span>
                            </div>
                            <div className="flex items-center space-x-2 border border-gray-600 dark:border-gray-400 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div
                                className="w-6 h-6 border border-gray-200 dark:border-gray-600"
                                style={{ backgroundColor: business.colors[1] }}
                              />
                              <span className="text-gray-900 dark:text-white">Background Color</span>
                            </div>
                            <div className="flex items-center space-x-2 border border-gray-600 dark:border-gray-400 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <div
                                className="w-6 h-6 border border-gray-200 dark:border-gray-600"
                                style={{ backgroundColor: business.colors[2] }}
                              />
                              <span className="text-gray-900 dark:text-white">Text Color</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Client Email */}
                    <div className="mb-2">
                      <strong className="block mb-1 text-gray-900 dark:text-white">Client Email:</strong>
                      {editing ? (
                        <input
                          type="email"
                          value={editedBusiness.clientEmail}
                          onChange={(e) => setEditedBusiness({ ...editedBusiness, clientEmail: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <span
                          className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                          onClick={handleFieldClick}
                        >
                          {business.clientEmail}
                        </span>
                      )}
                    </div>

                    {/* Client Website */}
                    <div className="mb-2">
                      <strong className="block mb-1 text-gray-900 dark:text-white">Website:</strong>
                      {editing ? (
                        <input
                          type="url"
                          value={editedBusiness.clientWebsite}
                          onChange={(e) => setEditedBusiness({ ...editedBusiness, clientWebsite: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <span
                          className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                          onClick={handleFieldClick}
                        >
                          {business.clientWebsite}
                        </span>
                      )}
                    </div>

                    {/* Language */}
                    <div className="mb-2">
                      <strong className="block mb-1 text-gray-900 dark:text-white">Language:</strong>
                      {editing ? (
                        <input
                          type="text"
                          value={editedBusiness.language}
                          onChange={(e) => setEditedBusiness({ ...editedBusiness, language: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <span
                          className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                          onClick={handleFieldClick}
                        >
                          {business.language}
                        </span>
                      )}
                    </div>

                    {/* Country */}
                    <div className="mb-2">
                      <strong className="block mb-1 text-gray-900 dark:text-white">Country:</strong>
                      {editing ? (
                        <input
                          type="text"
                          value={editedBusiness.country}
                          onChange={(e) => setEditedBusiness({ ...editedBusiness, country: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <span
                          className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                          onClick={handleFieldClick}
                        >
                          {business.country}
                        </span>
                      )}
                    </div>

                    {/* State/Region */}
                    <div className="mb-2">
                      <strong className="block mb-1 text-gray-900 dark:text-white">State/Region:</strong>
                      {editing ? (
                        <input
                          type="text"
                          value={editedBusiness.state}
                          onChange={(e) => setEditedBusiness({ ...editedBusiness, state: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <span
                          className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                          onClick={handleFieldClick}
                        >
                          {business.state}
                        </span>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-2 mt-4">
                      {!editing ? (
                        <button
                          onClick={handleEdit}
                          className="bg-black dark:bg-gray-700 py-2 px-4 rounded-xl text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                        >
                          Edit
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={handleSave}
                            className="bg-green-600 dark:bg-green-700 py-2 px-4 rounded-xl text-white hover:bg-green-700 dark:hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="bg-gray-600 dark:bg-gray-700 py-2 px-4 rounded-xl text-white hover:bg-gray-700 dark:hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Marketing Strategy</h2>
                    <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Audience</h3>
                    <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                      {business.audience.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Audience Pains</h3>
                    <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
                      {business.audiencePains.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                    <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Core Values</h3>
                    <ul className="list-disc pl-5 mb-4 text-gray-700 dark:text-gray-300">
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