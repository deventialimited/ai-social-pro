// @ts-nocheck

import { FaUserAlt } from "react-icons/fa";
import React, { useState, useEffect } from "react";

const Navbar = () => {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("displayName");
    setDisplayName(name || "Guest"); // fallback if it's null
  }, []);

  return (
    <div className="">
      <div className="bg-white h-16 ">
        <div className="hidden md:flex items-center justify-end mr-8 pt-4">
          <span className="text-gray-600 mr-2"> {displayName}</span>
          <div className="bg-blue-100 rounded-full p-2">
            <FaUserAlt className="text-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
