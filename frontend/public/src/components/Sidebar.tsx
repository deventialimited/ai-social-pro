// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  FaBars,
  FaUserAlt,
  FaTachometerAlt,
  FaFileAlt,
  FaCalendarAlt,
  FaGift,
  FaCaretDown,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // For setting the "websitename" cookie
import { Plus } from "lucide-react";
import axios from "axios";


const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  toggleBusiness,
  isBusinessOpen,
  openProfile,

  // new props for domain selection
  domains = [], // array of domain strings from the getPosts user data (for your Posts page)
  selectedDomain = "",
  onDomainChange = () => {},
}) => {
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [domainDataList, setDomainDataList] = useState([]);
  const [currentDomainObj, setCurrentDomainObj] = useState(null);

  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);

  useEffect(() => {
    // For top-right user name display
    const storedDisplayName = localStorage.getItem("displayName");
    setDisplayName(storedDisplayName || "John Doe");

    // Load domain data array from localStorage
    const domainDataStr = localStorage.getItem("domainforcookies");
    if (domainDataStr) {
      try {
        const parsed = JSON.parse(domainDataStr); // an array of domain objects
        setDomainDataList(parsed);
      } catch (err) {
        console.error("Error parsing domainforcookies:", err);
      }
    }
  }, []);

  useEffect(() => {
    // If user has not chosen anything, we see if the "websitename" cookie is set
    const cookieDomain = Cookies.get("websitename");
    if (cookieDomain) {
      onDomainChange(cookieDomain); // also informs parent
    }
  }, [onDomainChange]);

  
  useEffect(() => {
    if (!selectedDomain || domainDataList.length === 0) {
      setCurrentDomainObj(null);
      return;
    }
    const found = domainDataList.find(
      (d) => d.domain?.toLowerCase() === selectedDomain.toLowerCase()
    );
    setCurrentDomainObj(found || null);
  }, [selectedDomain, domainDataList]);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    navigate("/login");
  };

  const toggleDomainDropdown = () => {
    setIsDomainDropdownOpen(!isDomainDropdownOpen);
  };

  /**
   * If user picks a domain from the dropdown, we set the cookie
   * and call onDomainChange so that the parent (Posts, etc.) knows.
   */
  const handleDomainSelect = (domain) => {
    Cookies.set("websitename", domain, { expires: 55 / 60 });
    onDomainChange(domain);
    setIsDomainDropdownOpen(false);
  };

  return (
    <>
      <div className="fixed">
        {/* Top Menu (for mobile) */}
        <div className="flex md:hidden pl-4 right-2 justify-between items-center mb-2">
          <button
            className="p-4"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <FaBars className="text-xl" />
          </button>
          <div className="flex items-center gap-44 justify-between w-full">
            <h2 className="text-lg font-bold text-gray-900">Profile</h2>
            <div className="flex items-center">
              <span className="text-gray-600 text-sm mr-2 mt-1">
                {displayName}
              </span>
              <div className="bg-blue-100 rounded-full p-2">
                <FaUserAlt className="text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`w-full md:w-64 bg-white h-auto md:h-screen shadow-md ${
            isSidebarOpen ? "block" : "hidden"
          } md:block`}
        >
          <div className="p-4 flex flex-col justify-between h-full">
            <div>
              {/* Heading (desktop) */}
              <h1 className="text-[22px] font-bold text-blue-600 mb-4 items-center hidden md:flex">
                Profile
                <FaBars className="ml-[138px] text-[26px] text-gray-600" />
              </h1>

              {/* Domain info / dropdown container */}
              <div className="flex flex-col border border-gray-300 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  {/* Show the currently selected domain’s logo if we have it */}
                  {currentDomainObj?.logoUrl ? (
                    <img
                      src={currentDomainObj.logoUrl}
                      alt="Logo"
                      className="mr-2 w-8 h-8"
                    />
                  ) : (
                    <img
                      src="https://www.w3schools.com/w3images/avatar2.png"
                      alt="Default"
                      className="mr-2 w-8 h-8"
                    />
                  )}

                  {/* Domain Dropdown Trigger */}
                  <div className="relative flex-1">
                    <div
                      className="w-full bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer"
                      onClick={toggleDomainDropdown}
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`truncate ${
                              isDomainDropdownOpen
                                ? "text-gray-400 italic"
                                : "text-gray-600"
                            }`}
                          >
                            {/* If we have a selected domain, show it; else fallback */}
                            {currentDomainObj?.clientWebsite ||
                              selectedDomain ||
                              "-- All Websites --"}
                          </span>
                        </div>
                        <FaCaretDown
                          className={`transform transition-transform ${
                            isDomainDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                    {/* The dropdown list itself */}
                    {isDomainDropdownOpen && (
                      <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
                        {domainDataList.map((domObj, idx) => (
                          <li
                            key={idx}
                            className="p-2 hover:bg-gray-100 truncate flex items-center gap-2 cursor-pointer"
                            onClick={() => handleDomainSelect(domObj.domain)}
                          >
                            {/* logo + name */}
                            {domObj.logoUrl ? (
                              <img
                                src={domObj.logoUrl}
                                alt="Domain Logo"
                                className="w-6 h-6"
                              />
                            ) : (
                              <img
                                src="https://www.w3schools.com/w3images/avatar2.png"
                                alt="Default"
                                className="w-6 h-6"
                              />
                            )}
                            <span>{domObj.clientWebsite || domObj.domain}</span>
                          </li>
                        ))}

                        {/* You could also add an “Add New Business” link: */}
                        <li
                          className="p-2 hover:bg-gray-100"
                          onClick={() => handleDomainSelect("")}
                        >
                          <Link
                            to="/"
                            className="inline-flex items-center gap-2 border border-gray-300 px-4 py-2 text-nowrap rounded-lg text-sm text-black hover:bg-gray-100 transition w-full justify-center"
                          >
                            + Add New Business
                          </Link>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              {/* end domain container */}

              {/* Sidebar Nav */}
              <ul>
                <li className="mb-2">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center p-2 text-blue-600 hover:bg-blue-100 hover:w-full rounded"
                  >
                    <FaTachometerAlt className="mr-2" /> Dashboard
                  </button>
                </li>
                <li className="mb-2">
                  <button
                    onClick={() => navigate("/posts")}
                    className="flex items-center p-2 text-gray-700 hover:bg-gray-100 hover:w-full rounded"
                  >
                    <FaFileAlt className="mr-2" /> Posts
                  </button>
                </li>
                <li className="mb-2">
                  <a
                    href="#"
                    className="flex items-center p-2 text-gray-700
                   hover:bg-gray-100 rounded"
                  >
                    <FaCalendarAlt className="mr-2" /> Calendar
                  </a>
                </li>
                <li className="mb-2">
                  <button
                    onClick={toggleBusiness}
                    className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                  >
                    <FaGift className="mr-2" /> Business
                    <FaCaretDown
                      className={`ml-auto transform ${
                        isBusinessOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isBusinessOpen && (
                    <ul className="pl-6 mt-2">
                      <li className="mb-2">
                        <button
                          onClick={openProfile}
                          className="text-purple-600 hover:bg-purple-100 rounded block p-2"
                        >
                          Profile
                        </button>
                      </li>
                      <li className="mb-2">
                        <a
                          href="#"
                          className="text-gray-700 hover:bg-gray-100 rounded block p-2"
                        >
                          Branding
                        </a>
                      </li>
                      <li className="mb-2">
                        <a
                          href="#"
                          className="text-gray-700 hover:bg-gray-100 rounded block p-2"
                        >
                          Socials
                        </a>
                      </li>
                      <li className="mb-2">
                        <a
                          href="#"
                          className="text-gray-700 hover:bg-gray-100 rounded block p-2"
                        >
                          Team
                        </a>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>

            {/* Logout */}
            <div className="mt-4">
              <a
                href="#"
                onClick={handleLogout}
                className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
