import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { ChromePicker } from "react-color";

function ColorPicker({
  color = "#000000",
  onChange,
  label = "Color",
  showPalette = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);
  const [opacity, setOpacity] = useState(100);
  const [recentColors, setRecentColors] = useState([]);
  const pickerRef = useRef(null);

  useEffect(() => {
    setCurrentColor(color);
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("recentColors"));
    if (stored && Array.isArray(stored)) {
      setRecentColors(stored);
    }
  }, []);

  const handleColorChangeComplete = (color) => {
    const newColor = color.hex;
    setCurrentColor(newColor);

    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== newColor);
      const updated = [...filtered, newColor].slice(-3);
      localStorage.setItem("recentColors", JSON.stringify(updated));
      return updated;
    });

    if (onChange) {
      onChange(newColor, opacity);
    }
  };

  const handleOpacityChange = (newOpacity) => {
    setOpacity(newOpacity);
    if (onChange) {
      onChange(currentColor, newOpacity);
    }
  };

  const paletteColors = [
    "#87CEEB",
    "#000000",
    "#FFFFFF",
    "#808080",
    "#8A2BE2",
    "#4B0082",
    "#FF6B81",
    "#0000CD",
    "#87CEFA",
    "#E6E6FA",
    "#1C1C1C",
    "#FF7F50",
    "#191970",
    "#E9967A",
    "#2F4F4F",
    "#40E0D0",
    "#0066CC",
  ];

  return (
    <div className="relative" ref={pickerRef}>
      <button
        className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="w-5 h-5 rounded-sm border border-gray-200"
          style={{ backgroundColor: currentColor }}
        />
        <span className="text-sm w-max font-medium">{label}</span>
        {showPalette && <ChevronDown className="h-4 w-4 text-gray-500" />}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 bg-white rounded-md shadow-lg border p-4">
          <ChromePicker
            color={currentColor}
            onChange={(color) => setCurrentColor(color.hex)}
            onChangeComplete={handleColorChangeComplete}
            disableAlpha={true}
            styles={{
              default: {
                picker: {
                  boxShadow: "none",
                  width: "100%",
                },
                saturation: {
                  borderRadius: "4px",
                  border: "1px solid #e5e7eb",
                },
                hue: {
                  borderRadius: "4px",
                  border: "1px solid #e5e7eb",
                },
              },
            }}
          />

          {/* Opacity slider */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, transparent 0%, ${currentColor} 100%)`,
                }}
              />
              <div
                className="w-8 h-8 rounded-sm border border-gray-200"
                style={{
                  backgroundColor: currentColor,
                  opacity: opacity / 100,
                }}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={opacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="w-16 p-1 border rounded-md text-sm"
                min="0"
                max="100"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>

          {/* Recently used colors */}
          {recentColors.length > 0 && (
            <>
              <div className="flex items-center mt-4 mb-2">
                <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">Recent Colors</span>
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                {recentColors.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-sm cursor-pointer border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChangeComplete({ hex: color })}
                  />
                ))}
              </div>
            </>
          )}

          {/* Color palette */}
          {showPalette && (
            <>
              <div className="flex items-center mt-2 mb-2">
                <ChevronDown className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium">Palette</span>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {paletteColors.map((color, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-sm cursor-pointer border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChangeComplete({ hex: color })}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ColorPicker;
