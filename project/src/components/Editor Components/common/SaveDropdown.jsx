import { useState } from "react";
import { ChevronDownIcon, Loader2, Save } from "lucide-react";

const SaveDropdown = ({
  options = ["private", "public"],
  onSave,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    setIsOpen(false);
    onSave(option); // directly call save with selected option
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>Save As</span>
            <ChevronDownIcon className="h-4 w-4" />
          </>
        )}
      </button>

      {isOpen && !isLoading && (
        <div className="absolute left-0 mt-1 w-max min-w-full bg-white border border-gray-300 rounded-md shadow-lg z-10">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className="block w-full text-left px-4 py-2 text-sm capitalize hover:bg-gray-100"
            >
              Save as {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SaveDropdown;
