import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaCheckSquare, FaSquare } from "react-icons/fa"; // React Icons for dropdown arrow and checkboxes

const MultiSelectDropdown = ({ options = [], selectedOptions = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle selection of an option
  const handleOptionToggle = (option) => {
    const updatedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    onChange(updatedOptions);
  };

  // Display text for the dropdown (e.g., "all socials" or selected options)
  const displayText =
    selectedOptions.length === 0
      ? "All socials"
      : selectedOptions.length === options.length
      ? "All socials"
      : selectedOptions.join(", ");

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Publish to
      </span>
      <div className="relative" ref={dropdownRef}>
        {/* Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none transition-all"
        >
          <span className="truncate max-w-[150px]">{displayText}</span>
          <FaChevronDown
            className={`text-gray-600 dark:text-gray-400 transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 bottom-10 w-full md:min-w-[200px] min-w-[145px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
            <ul className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <li
                  key={option}
                  onClick={() => handleOptionToggle(option)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  {/* Checkbox Icon */}
                  {selectedOptions.includes(option) ? (
                    <FaCheckSquare className="text-blue-500" />
                  ) : (
                    <FaSquare className="text-gray-400" />
                  )}
                  <span>{option}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectDropdown;