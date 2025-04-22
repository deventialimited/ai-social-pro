import { useState, useRef, useEffect } from "react";
import { Droplet } from "lucide-react";

function TransparencyPopup({ transparency = 100, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(transparency);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (newValue) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue / 100);
    }
  };

  return (
    <div className=" relative" ref={popupRef}>
      <button
        className="p-2 rounded-md hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Droplet className="h-5 w-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute z-50 right-44 mt-1 w-64 bg-white rounded-md shadow-lg border p-4">
          <h3 className="font-medium mb-3">Transparency</h3>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="w-full"
            />
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="w-16 p-2 border rounded-md"
              min="0"
              max="100"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TransparencyPopup;
