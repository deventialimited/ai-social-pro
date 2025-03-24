// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
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

/**
 * "refreshToken" is a number passed down by Posts.
 * Every time Posts increments refreshToken,
 * the effect below will re-run and re-read localStorage domainforcookies.
 */
const Sidebar = ({
  refreshToken = 0, // new prop
  isSidebarOpen,
  toggleSidebar,
  toggleBusiness,
  isBusinessOpen,
  openProfile,

  // new props for domain selection
  domains = [],
  selectedDomain = "",
  onDomainChange = () => {},
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [displayName, setDisplayName] = useState("");
  const [domainDataList, setDomainDataList] = useState([]);
  const [currentDomainObj, setCurrentDomainObj] = useState(null);
  const [isDomainDropdownOpen, setIsDomainDropdownOpen] = useState(false);

  // Load displayName from localStorage
  useEffect(() => {
    const storedDisplayName = localStorage.getItem("displayName");
    setDisplayName(storedDisplayName || "John Doe");
  }, []);

  /**
   * This effect re-runs each time "refreshToken" changes,
   * re-reading domainforcookies from localStorage.
   */
  useEffect(() => {
    const domainDataStr = localStorage.getItem("domainforcookies");
    if (domainDataStr) {
      try {
        const parsed = JSON.parse(domainDataStr); // an array of domain objects
        setDomainDataList(parsed);
        console.log("Parsed domainforcookies:", parsed);
      } catch (err) {
        console.error("Error parsing domainforcookies:", err);
      }
    } else {
      setDomainDataList([]);
    }
  }, [refreshToken]);

  // On mount or re-render, if no selected domain is set,
  // see if we have a cookie
  useEffect(() => {
    if (!selectedDomain) {
      const cookieDomain = Cookies.get("websitename");
      if (cookieDomain) {
        onDomainChange(cookieDomain);
      }
    }
  }, [selectedDomain, onDomainChange]);

  /**
   * Whenever selectedDomain or domainDataList changes,
   * figure out which object is the "current" domain.
   */
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

  // Add click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDomainDropdownOpen(false);
      }
    }

    // Add event listener when dropdown is open
    if (isDomainDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDomainDropdownOpen]);

  // LOGOUT
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    navigate("/login");
  };

  // Domain dropdown toggles
  const toggleDomainDropdown = () => {
    setIsDomainDropdownOpen(!isDomainDropdownOpen);
  };

  /**
   * If user picks a domain from the dropdown, we set the cookie
   * and call onDomainChange to let the parent know.
   */
  const handleDomainSelect = (domain) => {
    Cookies.set("websitename", domain, { expires: 55 / 60 });
    onDomainChange(domain);
    setIsDomainDropdownOpen(false);
  };

  return (
    <>
      <div className="fixed ">
        {/* Top Menu (mobile) */}
        <div className="flex md:hidden pl-4 right-2 justify-between items-center">
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
          className={`w-full md:w-72 bg-white h-auto   shadow-md ${
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
            </div>

            {/* Domain info / dropdown container */}

            <div className="flex flex-col h-[80vh]  overflow-hidden  border-gray-800 rounded-lg p-2">
              {/* Wrapper to make the dropdown full width */}
              <div className="relative w-full" ref={dropdownRef}>
                {/* Top section (logo + dropdown trigger) */}
                <div
                  className="flex items-center rounded-md  py-2  border-2 
                border-[#EFF6FF]  px-2 justify-between w-full"
                >
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
                  <div className="flex-1">
                    <div
                      className="w-full     rounded-lg  overflow-hidden cursor-pointer"
                      onClick={toggleDomainDropdown}
                    >
                      <div className="flex items-center  justify-between p-2">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`truncate ${
                              isDomainDropdownOpen
                                ? "text-gray-400 italic"
                                : "text-gray-900"
                            }`}
                          >
                            {currentDomainObj?.clientWebsite || selectedDomain}
                          </span>
                        </div>
                        <FaCaretDown
                          className={`transform transition-transform ${
                            isDomainDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dropdown now takes full width */}
                  {isDomainDropdownOpen && (
                    <ul
                      className="absolute left-0 top-full w-full
       max-h-80 overflow-y-auto bg-white  border-gray-900 
       rounded-b-xl shadow-lg border-t-0"
                    >
                      {/* "Add New Business" link */}
                      <li
                        className="p-2 hover:bg-gray-100"
                        onClick={() => handleDomainSelect("")}
                      >
                        <Link
                          to="/"
                          className="inline-flex items-center 
            gap-2 border border-gray-300 px-4 py-3 text-nowrap rounded-sm
             text-sm text-black  transition w-full justify-center"
                        >
                          + Add New Business
                        </Link>
                      </li>
                      {domainDataList.map((domObj, idx) => (
                        <li
                          key={idx}
                          className="p-2 hover:bg-gray-100 truncate flex items-center gap-2 cursor-pointer"
                          onClick={() => handleDomainSelect(domObj.domain)}
                        >
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
                    </ul>
                  )}
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
