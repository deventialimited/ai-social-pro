import { useState } from "react";
import { ChevronDownIcon } from "lucide-react"; // For dropdown icon

const Dropdown = ({ label, options, value, setValue }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    setValue(option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm capitalize font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          className="flex justify-between capitalize items-center w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <span>Save As {value}</span>
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </button>
        {isOpen && (
          <div className="absolute left-0 w-max min-w-full right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelect(option)}
                className="block w-max capitalize min-w-full px-3 py-2 text-sm text-left hover:bg-gray-100"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
