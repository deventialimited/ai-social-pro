import React, { useEffect, useRef, useState } from "react";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import { FiChevronDown } from "react-icons/fi";
import { Sparkles } from "lucide-react";

const ShadowSettings = () => {
  const [showEffects, setShowEffects] = useState(false);
  const [showShadowOptions, setShowShadowOptions] = useState(false);
  const [blur, setBlur] = useState(5);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [color, setColor] = useState("#000000");
  const selectorRef = useRef(null);
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
  const handleToggle = () => {
    setShowShadowOptions(!showShadowOptions);
  };

  return (
    <div className=" relative" ref={selectorRef}>
      <button
        className={`flex items-center gap-1 px-3 py-2 rounded-md ${
          showEffects ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
        }`}
        onClick={() => setShowEffects(!showEffects)}
      >
        <Sparkles className="h-5 w-5" />
        <span>Effects</span>
      </button>
      {showEffects && (
        <div className=" absolute mt-2 w-72 p-4 border rounded-lg shadow-md bg-white z-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Shadow</h3>
            <div onClick={handleToggle} className="cursor-pointer">
              {showShadowOptions ? (
                <FaToggleOn className="text-blue-500 text-2xl" />
              ) : (
                <FaToggleOff className="text-gray-500 text-2xl" />
              )}
            </div>
          </div>

          {showShadowOptions && (
            <div className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm">Blur</label>
                <Slider
                  value={blur}
                  onChange={setBlur}
                  min={0}
                  max={20}
                  className="w-32"
                />
                <span>{blur}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm">Offset X</label>
                <Slider
                  value={offsetX}
                  onChange={setOffsetX}
                  min={-10}
                  max={10}
                  className="w-32"
                />
                <span>{offsetX}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm">Offset Y</label>
                <Slider
                  value={offsetY}
                  onChange={setOffsetY}
                  min={-10}
                  max={10}
                  className="w-32"
                />
                <span>{offsetY}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm">Opacity</label>
                <Slider
                  value={opacity}
                  onChange={setOpacity}
                  min={0}
                  max={100}
                  className="w-32"
                />
                <span>{opacity}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm">Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 p-0 border-none"
                />
                <span>{color}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShadowSettings;
