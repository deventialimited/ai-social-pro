import { FaUserAlt } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const Navbar: React.FC = () => {
  const [displayName, setDisplayName] = useState<string>("");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const name = localStorage.getItem("displayName");
    setDisplayName(name || "Guest");
  }, []);

  return (
    <div className="bg-background text-text h-16 shadow-md">
      <div className="flex items-center justify-between px-6 md:px-10 h-full">
        {/* Left Side - Logo or Branding */}
        <div>
          <h1 className="text-lg font-semibold text-primary">Your Brand</h1>
        </div>

        {/* Right Side - User Info & Dark Mode Toggle */}
        <div className="flex items-center space-x-6">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <span className="text-gray-600 dark:text-gray-300">{displayName}</span>
            <div className="bg-blue-100 dark:bg-gray-700 rounded-full p-2">
              <FaUserAlt className="text-blue-500 dark:text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;