"use client";
import React from "react";
import { X } from "lucide-react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

interface EffectsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  effects: {
    blur: number;
    brightness: number;
    sepia: number;
    grayscale: number;
    border: number;
    cornerRadius: number;
    shadow: {
      blur: number;
      offsetX: number;
      offsetY: number;
    };
  };
  onEffectChange: (effect: string, value: number) => void;
  onEffectToggle?: (effect: string) => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
  isOpen,
  onClose,
  effects,
  onEffectChange,
  onEffectToggle,
}) => {
  if (!isOpen) return null;

  const toggleEffect = (effect: string) => {
    if (!onEffectToggle) return; // Guard against undefined onEffectToggle

    // Apply default values when toggling on
    if (effect === "blur" && effects.blur === 0) {
      onEffectChange("blur", 5);
    } else if (effect === "brightness" && effects.brightness === 0) {
      onEffectChange("brightness", 110);
    } else if (effect === "sepia" && effects.sepia === 0) {
      onEffectChange("sepia", 50);
    } else if (effect === "grayscale" && effects.grayscale === 0) {
      onEffectChange("grayscale", 50);
    } else if (effect === "border" && effects.border === 0) {
      onEffectChange("border", 3);
    } else if (effect === "cornerRadius" && effects.cornerRadius === 0) {
      onEffectChange("cornerRadius", 10);
    } else if (effect === "shadow.blur" && effects.shadow.blur === 0) {
      onEffectChange("shadow.blur", 15);
      onEffectChange("shadow.offsetX", 5);
      onEffectChange("shadow.offsetY", 5);
    }

    // This is essential - calls the parent component's toggle function
    onEffectToggle(effect);
  };

  const isEffectEnabled = (effect: keyof typeof effects): boolean => {
    if (effect === "shadow") {
      return effects.shadow.blur > 0;
    }
    return effects[effect] > 0;
  };

  const handleToggleOff = (effect: string) => {
    if (effect === "shadow.blur" || effect === "shadow") {
      onEffectChange("shadow.blur", 0);
      onEffectChange("shadow.offsetX", 0);
      onEffectChange("shadow.offsetY", 0);
    } else {
      onEffectChange(effect, 0);
    }

    // Make sure to call onEffectToggle to update state in parent component
    if (onEffectToggle) {
      if (effect === "shadow") {
        onEffectToggle("shadow.blur");
      } else {
        onEffectToggle(effect);
      }
    }
  };

  // Direct handler for slider changes that immediately updates values
  const handleDirectSliderChange = (effect: string, value: number) => {
    // Immediately apply the effect value change
    onEffectChange(effect, value);
  };

  const handleToggleClick = (effect: string) => {
    if (
      isEffectEnabled(
        effect === "shadow" ? "shadow" : (effect as keyof typeof effects)
      )
    ) {
      handleToggleOff(effect);
    } else {
      toggleEffect(effect);
    }
  };

  return (
    <div className="absolute top-43 left-40 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-[265px] z-[200] max-h-[500px] overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Effects</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Blur */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Blur</span>
            <div
              className="relative inline-block w-8 h-4 rounded-full bg-gray-200 cursor-pointer"
              onClick={() => handleToggleClick("blur")}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isEffectEnabled("blur")}
                onChange={() => {}}
              />
              <div
                className={`absolute inset-0 rounded-full transition ${
                  isEffectEnabled("blur") ? "bg-blue-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition transform ${
                  isEffectEnabled("blur") ? "translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>
          <div className="flex items-center">
            <Box sx={{ width: "100%" }}>
              <Slider
                size="small"
                min={0}
                max={20}
                value={effects.blur}
                onChange={(e, val) =>
                  handleDirectSliderChange(
                    "blur",
                    Array.isArray(val) ? val[0] : val
                  )
                }
                valueLabelDisplay="auto"
              />
            </Box>
            <input
              type="number"
              min={0}
              max={20}
              value={effects.blur}
              onChange={(e) => onEffectChange("blur", Number(e.target.value))}
              className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
            />
          </div>
        </div>

        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Brightness</span>
            <div
              className="relative inline-block w-8 h-4 rounded-full bg-gray-200 cursor-pointer"
              onClick={() => handleToggleClick("brightness")}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isEffectEnabled("brightness")}
                onChange={() => {}}
              />
              <div
                className={`absolute inset-0 rounded-full transition ${
                  isEffectEnabled("brightness") ? "bg-blue-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition transform ${
                  isEffectEnabled("brightness") ? "translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>
          <div className="flex items-center">
            <Box sx={{ width: "100%" }}>
              <Slider
                size="small"
                min={50}
                max={150}
                value={effects.brightness}
                onChange={(e, val) =>
                  handleDirectSliderChange(
                    "brightness",
                    Array.isArray(val) ? val[0] : val
                  )
                }
                valueLabelDisplay="auto"
              />
            </Box>
            <input
              type="number"
              min={50}
              max={150}
              value={effects.brightness}
              onChange={(e) =>
                onEffectChange("brightness", Number(e.target.value))
              }
              className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
            />
          </div>
        </div>

        {/* Sepia */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Sepia</span>
            <div
              className="relative inline-block w-8 h-4 rounded-full bg-gray-200 cursor-pointer"
              onClick={() => handleToggleClick("sepia")}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isEffectEnabled("sepia")}
                onChange={() => {}}
              />
              <div
                className={`absolute inset-0 rounded-full transition ${
                  isEffectEnabled("sepia") ? "bg-blue-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition transform ${
                  isEffectEnabled("sepia") ? "translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>
          <div className="flex items-center">
            <Box sx={{ width: "100%" }}>
              <Slider
                size="small"
                min={0}
                max={100}
                value={effects.sepia}
                onChange={(e, val) =>
                  handleDirectSliderChange(
                    "sepia",
                    Array.isArray(val) ? val[0] : val
                  )
                }
                valueLabelDisplay="auto"
              />
            </Box>
            <input
              type="number"
              min={0}
              max={100}
              value={effects.sepia}
              onChange={(e) => onEffectChange("sepia", Number(e.target.value))}
              className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
            />
          </div>
        </div>

        {/* Grayscale */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Grayscale</span>
            <div
              className="relative inline-block w-8 h-4 rounded-full bg-gray-200 cursor-pointer"
              onClick={() => handleToggleClick("grayscale")}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isEffectEnabled("grayscale")}
                onChange={() => {}}
              />
              <div
                className={`absolute inset-0 rounded-full transition ${
                  isEffectEnabled("grayscale") ? "bg-blue-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition transform ${
                  isEffectEnabled("grayscale") ? "translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>
          <div className="flex items-center">
            <Box sx={{ width: "100%" }}>
              <Slider
                size="small"
                min={0}
                max={100}
                value={effects.grayscale}
                onChange={(e, val) =>
                  handleDirectSliderChange(
                    "grayscale",
                    Array.isArray(val) ? val[0] : val
                  )
                }
                valueLabelDisplay="auto"
              />
            </Box>
            <input
              type="number"
              min={0}
              max={100}
              value={effects.grayscale}
              onChange={(e) =>
                onEffectChange("grayscale", Number(e.target.value))
              }
              className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
            />
          </div>
        </div>

        {/* Border */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Border</span>
            <div
              className="relative inline-block w-8 h-4 rounded-full bg-gray-200 cursor-pointer"
              onClick={() => handleToggleClick("border")}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isEffectEnabled("border")}
                onChange={() => {}}
              />
              <div
                className={`absolute inset-0 rounded-full transition ${
                  isEffectEnabled("border") ? "bg-blue-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition transform ${
                  isEffectEnabled("border") ? "translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>
          <div className="flex items-center">
            <Box sx={{ width: "100%" }}>
              <Slider
                size="small"
                min={0}
                max={10}
                value={effects.border}
                onChange={(e, val) =>
                  handleDirectSliderChange(
                    "border",
                    Array.isArray(val) ? val[0] : val
                  )
                }
                valueLabelDisplay="auto"
              />
            </Box>
            <input
              type="number"
              min={0}
              max={10}
              value={effects.border}
              onChange={(e) => onEffectChange("border", Number(e.target.value))}
              className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
            />
          </div>
        </div>

        {/* Corner Radius */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Corner Radius</span>
            <div
              className="relative inline-block w-8 h-4 rounded-full bg-gray-200 cursor-pointer"
              onClick={() => handleToggleClick("cornerRadius")}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isEffectEnabled("cornerRadius")}
                onChange={() => {}}
              />
              <div
                className={`absolute inset-0 rounded-full transition ${
                  isEffectEnabled("cornerRadius")
                    ? "bg-blue-500"
                    : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition transform ${
                  isEffectEnabled("cornerRadius") ? "translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>
          <div className="flex items-center">
            <Box sx={{ width: "100%" }}>
              <Slider
                size="small"
                min={0}
                max={30}
                value={effects.cornerRadius}
                onChange={(e, val) =>
                  handleDirectSliderChange(
                    "cornerRadius",
                    Array.isArray(val) ? val[0] : val
                  )
                }
                valueLabelDisplay="auto"
              />
            </Box>
            <input
              type="number"
              min={0}
              max={30}
              value={effects.cornerRadius}
              onChange={(e) =>
                onEffectChange("cornerRadius", Number(e.target.value))
              }
              className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
            />
          </div>
        </div>

        {/* Shadow */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Shadow</span>
            <div
              className="relative inline-block w-8 h-4 rounded-full bg-gray-200 cursor-pointer"
              onClick={() => handleToggleClick("shadow")}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={effects.shadow.blur > 0}
                onChange={() => {}}
              />
              <div
                className={`absolute inset-0 rounded-full transition ${
                  effects.shadow.blur > 0 ? "bg-blue-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition transform ${
                  effects.shadow.blur > 0 ? "translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center mt-1">
              <span className="text-xs mr-1">Blur</span>
              <Box sx={{ width: "100%" }}>
                <Slider
                  size="small"
                  min={0}
                  max={30}
                  value={effects.shadow.blur}
                  onChange={(e, val) =>
                    handleDirectSliderChange(
                      "shadow.blur",
                      Array.isArray(val) ? val[0] : val
                    )
                  }
                  valueLabelDisplay="auto"
                />
              </Box>
              <input
                type="number"
                min={0}
                max={30}
                value={effects.shadow.blur}
                onChange={(e) =>
                  onEffectChange("shadow.blur", Number(e.target.value))
                }
                className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
              />
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs mr-1">Offset</span>
              <Box sx={{ width: "100%" }}>
                <Slider
                  size="small"
                  min={-10}
                  max={10}
                  value={effects.shadow.offsetX}
                  onChange={(e, val) =>
                    handleDirectSliderChange(
                      "shadow.offsetX",
                      Array.isArray(val) ? val[0] : val
                    )
                  }
                  valueLabelDisplay="auto"
                />
              </Box>
              <input
                type="number"
                min={-10}
                max={10}
                value={effects.shadow.offsetX}
                onChange={(e) =>
                  onEffectChange("shadow.offsetX", Number(e.target.value))
                }
                className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
              />
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs mr-1">Offset Y</span>
              <Box sx={{ width: "100%" }}>
                <Slider
                  size="small"
                  min={-10}
                  max={10}
                  value={effects.shadow.offsetY}
                  onChange={(e, val) =>
                    handleDirectSliderChange(
                      "shadow.offsetY",
                      Array.isArray(val) ? val[0] : val
                    )
                  }
                  valueLabelDisplay="auto"
                />
              </Box>
              <input
                type="number"
                min={-10}
                max={10}
                value={effects.shadow.offsetY}
                onChange={(e) =>
                  onEffectChange("shadow.offsetY", Number(e.target.value))
                }
                className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
