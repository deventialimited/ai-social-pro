import { useState, useRef, useEffect } from "react";
import { Droplet } from "lucide-react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

function TransparencyPopup({ transparency = 100, onChange, onClose }) {
  const [value, setValue] = useState(transparency);
  const popupRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleChange = (newValue) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue / 100); // Normalize to 0-1 range
    }
  };

  return (
    <div ref={popupRef} className="w-64 bg-white rounded-md shadow-lg border p-4">
      <h3 className="font-medium mb-3">Transparency</h3>
      <div className="flex items-center gap-2">
        <Slider
          min={0}
          max={100}
          value={value}
          onChange={handleChange}
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
  );
}

export default TransparencyPopup;
