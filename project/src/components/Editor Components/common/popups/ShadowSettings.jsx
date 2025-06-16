import React, { useEffect, useRef, useState } from "react";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Sparkles } from "lucide-react";

const ShadowSettings = ({ selectedElement, updateElement }) => {
  const [showEffects, setShowEffects] = useState(false);
  const [showShadowOptions, setShowShadowOptions] = useState(false);
  const [shadowSettings, setShadowSettings] = useState({
    enabled: false,
    blur: 5,
    offsetX: 0,
    offsetY: 0,
    opacity: 100,
    color: "#000000"
  });
  const selectorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setShowEffects(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    const newEnabled = !showShadowOptions;
    setShowShadowOptions(newEnabled);
    updateShadowSettings({ enabled: newEnabled });
  };

  const updateShadowSettings = (updates) => {
    const newSettings = { ...shadowSettings, ...updates };
    setShadowSettings(newSettings);

    if (selectedElement) {
      const { enabled, blur, offsetX, offsetY, opacity, color } = newSettings;
      if (enabled) {
        const rgb = hexToRgb(color);
        updateElement(selectedElement.id, {
          styles: {
            ...selectedElement.styles,
            filter: `drop-shadow(${offsetX}px ${offsetY}px ${blur}px rgba(${rgb}, ${opacity / 100}))`,
            boxShadow: 'none'
          }
        });
      } else {
        updateElement(selectedElement.id, {
          styles: {
            ...selectedElement.styles,
            filter: 'none',
            boxShadow: 'none'
          }
        });
      }
    }
  };

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  };

  return (
    <div className="relative" ref={selectorRef}>
      {/* <button
        className={`flex items-center gap-1 px-3 py-2 rounded-md ${
          showEffects ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
        }`}
        onClick={() => setShowEffects(!showEffects)}
      >
        <Sparkles className="h-5 w-5" />
        <span>Effects</span>
      </button> */}
      {/* {showEffects && ( */}
        <div className="absolute mt-2 md:w-72 w-52 p-4 border rounded-lg shadow-md bg-white z-50">
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
                  value={shadowSettings.blur}
                  onChange={(value) => updateShadowSettings({ blur: value })}
                  min={0}
                  max={20}
                  className="w-32"
                />
                <span>{shadowSettings.blur}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm">Offset X</label>
                <Slider
                  value={shadowSettings.offsetX}
                  onChange={(value) => updateShadowSettings({ offsetX: value })}
                  min={-10}
                  max={10}
                  className="w-32"
                />
                <span>{shadowSettings.offsetX}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm">Offset Y</label>
                <Slider
                  value={shadowSettings.offsetY}
                  onChange={(value) => updateShadowSettings({ offsetY: value })}
                  min={-10}
                  max={10}
                  className="w-32"
                />
                <span>{shadowSettings.offsetY}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm">Opacity</label>
                <Slider
                  value={shadowSettings.opacity}
                  onChange={(value) => updateShadowSettings({ opacity: value })}
                  min={0}
                  max={100}
                  className="w-32"
                />
                <span>{shadowSettings.opacity}</span>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-sm">Color</label>
                <input
                  type="color"
                  value={shadowSettings.color}
                  onChange={(e) => updateShadowSettings({ color: e.target.value })}
                  className="w-8 h-8 p-0 border-none"
                />
                <span>{shadowSettings.color}</span>
              </div>
            </div>
          )}
        </div>
      {/* )} */}
    </div>
  );
};

export default ShadowSettings;
