import { useState, useRef, useEffect } from "react";
import { AlignJustify } from "lucide-react";

function StrokeSelector({ stroke = 0, cornerRadius = 0, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(stroke);
  const [radius, setRadius] = useState(cornerRadius);
  const [selectedStyle, setSelectedStyle] = useState("none");
  const selectorRef = useRef(null);

  const strokeStyles = [
    { id: "none", label: "None" },
    { id: "solid", label: "Solid" },
    { id: "dashed", label: "Dashed" },
    { id: "dotted", label: "Dotted" },
    { id: "dotted-dense", label: "Dense Dotted" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleStrokeWidthChange = (newWidth) => {
    setStrokeWidth(newWidth);
    if (onChange) {
      onChange({ width: newWidth, style: selectedStyle, cornerRadius: radius });
    }
  };

  const handleCornerRadiusChange = (newRadius) => {
    setRadius(newRadius);
    if (onChange) {
      onChange({
        width: strokeWidth,
        style: selectedStyle,
        cornerRadius: newRadius,
      });
    }
  };

  const handleStyleSelect = (style) => {
    setSelectedStyle(style);
    if (onChange) {
      onChange({ width: strokeWidth, style, cornerRadius: radius });
    }
  };

  return (
    <div className=" relative" ref={selectorRef}>
      <button
        className="p-2 rounded-md hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <AlignJustify className="h-5 w-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white rounded-md shadow-lg border p-4">
          <div className="grid grid-cols-5 gap-2 mb-4">
            {strokeStyles.map((style) => (
              <button
                key={style.id}
                className={`p-2 border rounded-md flex items-center justify-center ${
                  selectedStyle === style.id
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleStyleSelect(style.id)}
              >
                {style.id === "none" ? (
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-5 h-0.5 bg-gray-400 transform rotate-45"></div>
                    <div className="w-5 h-0.5 bg-gray-400 transform -rotate-45 absolute"></div>
                  </div>
                ) : style.id === "solid" ? (
                  <div className="w-6 h-0.5 bg-black"></div>
                ) : style.id === "dashed" ? (
                  <div className="w-6 h-0.5 bg-black border-dashed border-t border-black"></div>
                ) : style.id === "dotted" ? (
                  <div className="w-6 h-0.5 bg-black border-dotted border-t border-black"></div>
                ) : (
                  <div className="w-6 h-0.5 flex items-center justify-between">
                    <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                    <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                    <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                    <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                    <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Stroke Width
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="20"
                value={strokeWidth}
                onChange={(e) =>
                  handleStrokeWidthChange(Number(e.target.value))
                }
                className="w-full"
              />
              <input
                type="number"
                value={strokeWidth}
                onChange={(e) =>
                  handleStrokeWidthChange(Number(e.target.value))
                }
                className="w-16 p-2 border rounded-md"
                min="0"
                max="20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Corner Radius
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="50"
                value={radius}
                onChange={(e) =>
                  handleCornerRadiusChange(Number(e.target.value))
                }
                className="w-full"
              />
              <input
                type="number"
                value={radius}
                onChange={(e) =>
                  handleCornerRadiusChange(Number(e.target.value))
                }
                className="w-16 p-2 border rounded-md"
                min="0"
                max="50"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StrokeSelector;
