// @ts-nocheck
import React from "react";
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
import Cookies from "js-cookie";

const Sidebar = ({
  isSidebarOpen,
  toggleSidebar,
  toggleBusiness,
  isBusinessOpen,
  openProfile,
}) => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    Cookies.remove("idtoken");
    Cookies.remove("refreshToken");
    Cookies.remove("websitename");
    Cookies.remove("userData");

    navigate("/login");
  };

  return (
    <div className="fixed">
      {/* Top Menu */}
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
            <h1 className="text-[22px] font-bold text-blue-600 mb-4 flex items-center hidden md:flex">
              Profile
              <FaBars className="ml-[138px] text-[26px] text-gray-600" />
            </h1>
            <div className="flex items-center border border-gray-300 rounded-lg p-2">
              <img
                src="https://www.w3schools.com/w3images/avatar2.png"
                alt="Logo"
                className="mr-2 w-8 h-8"
              />
              <span className="text-lg text-gray-600">Acme Corp</span>
              <button className="ml-2">
                <FaCaretDown />
              </button>
            </div>
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
