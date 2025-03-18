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
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie"; // Import the Cookies library

const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  toggleBusiness,
  isBusinessOpen,
  openProfile,

  // NEW PROPS for domain selection
  domains = [],
  selectedDomain = "",
  onDomainChange = () => {}
}) => {
  const navigate = useNavigate();
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);

  useEffect(() => {
    const domain = Cookies.get("websitename");
    if (domain) {
      onDomainChange(domain);
    }
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    localStorage.removeItem("websitename");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  const toggleDomainDropdown = () => {
    setIsDomainDropdownOpen(!isDomainDropdownOpen);
  };

  const handleDomainSelect = (domain) => {
    onDomainChange(domain);
    setIsDomainDropdownOpen(false);
  };

  return (
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
            <span className="text-gray-600 text-sm mr-2 mt-1">John Doe</span>
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
            <h1 className="text-[22px] font-bold text-blue-600 mb-4 flex items-center hidden md:flex">
              Profile
              <FaBars className="ml-[138px] text-[26px] text-gray-600" />
            </h1>

            {/* 
              Replacing the old "Acme Corp" text with a domain dropdown.
              You can style it any way you like. 
            */}
            <div className="flex flex-col border border-gray-300 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <img
                  src="https://www.w3schools.com/w3images/avatar2.png"
                  alt="Logo"
                  className="mr-2 w-8 h-8"
                />
                {/* Domain Dropdown */}
                <div className="relative flex-1">
                  <div
                    className="w-full bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer"
                    onClick={toggleDomainDropdown}
                  >
                    <div className="flex items-center justify-between p-2">
                      <span className="text-gray-600 truncate">
                        {selectedDomain || "-- All Websites --"}
                      </span>
                      <FaCaretDown className={`transform transition-transform ${isDomainDropdownOpen ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                  {isDomainDropdownOpen && (
                    <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg mt-1">
                      <li
                        className="p-2 hover:bg-gray-100"
                        onClick={() => handleDomainSelect("")}
                      >
                        -- All Websites --
                      </li>
                      {domains.map((d) => (
                        <li
                          key={d}
                          className="p-2 hover:bg-gray-100 truncate"
                          onClick={() => handleDomainSelect(d)}
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

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
                  className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
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
  );
};

export default Sidebar;
