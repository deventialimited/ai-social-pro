"use client";
import React, { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

interface EffectsPanelProps {
  isOpen: () => boolean;
  onClose: () => void;
  effects?: {
    blur: number;
    brightness: number;
    sepia: number;
    grayscale: number;
    border: number;
    borderColor: string;
    opacity: number;
    cornerRadius: number;
    shadow: {
      enabled: boolean;
      blur: number;
      offsetX: number;
      offsetY: number;
      color: string;
    };
  };
  onEffectChange: (effect: string, value: number | string) => void;
  onEffectToggle?: (effect: string) => void;
  selectedImage: string;
  imageData: Record<string, any>;
  onUpdateImage: (image: any) => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
  isOpen,
  onClose,
  effects = {
    blur: 0,
    brightness: 100,
    sepia: 0,
    grayscale: 0,
    border: 0,
    borderColor: "#000000",
    opacity: 0,
    cornerRadius: 0,
    shadow: {
      enabled: false,
      blur: 0,
      offsetX: 0,
      offsetY: 0,
      color: "#000000",
    },
  },
  onEffectChange,
  onEffectToggle,
  selectedImage,
  imageData,
  onUpdateImage,
}) => {
  const [localEffects, setLocalEffects] = useState(effects);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const borderColorRef = useRef<HTMLInputElement>(null);
  const shadowColorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalEffects(effects);
  }, [effects]);

  if (!isOpen()) return null;

  const toggleEffect = (effect: string) => {
    if (!onEffectToggle || !onEffectChange) return;

    if (effect === "shadow") {
      if (!localEffects.shadow.enabled) {
        onEffectChange("shadow.enabled", 1);
        onEffectChange("shadow.blur", 15);
        onEffectChange("shadow.offsetX", 5);
        onEffectChange("shadow.offsetY", 5);
        onEffectChange("shadow.color", "#000000");
      } else {
        onEffectChange("shadow.enabled", 0);
        onEffectChange("shadow.blur", 0);
        onEffectChange("shadow.offsetX", 0);
        onEffectChange("shadow.offsetY", 0);
      }
      onEffectToggle(effect);
      setActiveEffect(effect);
      return;
    }

    if (effect === "blur" && localEffects.blur === 0) {
      onEffectChange("blur", 0);
      setLocalEffects((prev) => ({ ...prev, blur: 0 }));
    } else if (effect === "brightness" && localEffects.brightness === 100) {
      onEffectChange("brightness", 100);
      setLocalEffects((prev) => ({ ...prev, brightness: 100 }));
    } else if (effect === "sepia" && localEffects.sepia === 0) {
      onEffectChange("sepia", 50);
    } else if (effect === "grayscale" && localEffects.grayscale === 0) {
      onEffectChange("grayscale", 50);
    } else if (effect === "border" && localEffects.border === 0) {
      onEffectChange("border", 3);
    } else if (effect === "opacity" && localEffects.opacity === 0) {
      onEffectChange("opacity", 0);
      setLocalEffects((prev) => ({ ...prev, opacity: 0 }));
    } else if (effect === "cornerRadius" && localEffects.cornerRadius === 0) {
      onEffectChange("cornerRadius", 10);
    }

    onEffectToggle(effect);
    setActiveEffect(effect);
  };

  const isEffectEnabled = (effect: keyof typeof localEffects): boolean => {
    if (effect === "shadow") {
      return localEffects.shadow.blur > 0;
    }
    if (effect === "brightness") {
      return localEffects.brightness !== 100 || activeEffect === "brightness";
    }
    if (effect === "borderColor") {
      return localEffects.border > 0;
    }
    if (effect === "opacity") {
      return localEffects.opacity > 0 || activeEffect === "opacity";
    }
    return (
      typeof localEffects[effect] === "number" &&
      (localEffects[effect] as number) > 0
    );
  };

  const handleToggleOff = (effect: string) => {
    if (!onEffectChange) return;

    if (effect === "shadow") {
      onEffectChange("shadow.blur", 0);
      onEffectChange("shadow.offsetX", 0);
      onEffectChange("shadow.offsetY", 0);
      if (onEffectToggle) {
        onEffectToggle(effect);
      }
      setActiveEffect(null);
      return;
    }

    if (effect === "brightness") {
      onEffectChange(effect, 100);
      setLocalEffects((prev) => ({ ...prev, brightness: 100 }));
    } else if (effect === "opacity") {
      onEffectChange(effect, 0);
      setLocalEffects((prev) => ({ ...prev, opacity: 0 }));
    } else {
      onEffectChange(effect, 0);
    }

    if (onEffectToggle) {
      if (effect === "shadow") {
        onEffectToggle("shadow.blur");
      } else {
        onEffectToggle(effect);
      }
    }
    setActiveEffect(null);
  };

  const handleDirectSliderChange = (effect: string, value: number) => {
    if (!onEffectChange) return;
    onEffectChange(effect, value);
    setLocalEffects((prev) => ({ ...prev, [effect]: value }));
    if (effect === "brightness" && value !== 100) {
      setActiveEffect("brightness");
    }
  };

  const handleToggleClick = (effect: string) => {
    if (
      isEffectEnabled(
        effect === "shadow" ? "shadow" : (effect as keyof typeof localEffects)
      )
    ) {
      handleToggleOff(effect);
    } else {
      toggleEffect(effect);
    }
  };

  const handleBorderColorClick = () => {
    borderColorRef.current?.click();
  };

  const handleShadowColorClick = () => {
    shadowColorRef.current?.click();
  };

  const handleBorderColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (!onEffectChange) return;

    // Update the local state
    setLocalEffects((prev) => ({
      ...prev,
      borderColor: newColor,
    }));

    // Update the parent state
    onEffectChange("borderColor", newColor);
  };

  const handleShadowColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (!onEffectChange) return;

    // Update the local state
    setLocalEffects((prev) => ({
      ...prev,
      shadow: {
        ...prev.shadow,
        color: newColor,
      },
    }));

    // Update the parent state
    onEffectChange("shadow.color", newColor);
  };

  return (
    <div className="bg-white p-2 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Effects</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        className="space-y-4 overflow-y-auto flex-1 pr-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#888 #f1f1f1",
          msOverflowStyle: "none",
        }}
      >
        <style>
          {`
            div::-webkit-scrollbar {
              width: 6px;
            }
            div::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb {
              background: #888;
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #555;
            }
          `}
        </style>

        {/* Blur */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">Blur</span>
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
          {activeEffect === "blur" && (
            <div className="flex items-center">
              <Box sx={{ width: "100%" }}>
                <Slider
                  size="small"
                  min={0}
                  max={20}
                  value={localEffects.blur}
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
                value={localEffects.blur}
                onChange={(e) =>
                  onEffectChange &&
                  onEffectChange("blur", Number(e.target.value))
                }
                className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
              />
            </div>
          )}
        </div>

        {/* Brightness */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">Brightness</span>
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
          {isEffectEnabled("brightness") && (
            <div className="flex items-center">
              <Box sx={{ width: "100%" }}>
                <Slider
                  size="small"
                  min={50}
                  max={150}
                  value={localEffects.brightness}
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
                value={localEffects.brightness}
                onChange={(e) =>
                  onEffectChange &&
                  onEffectChange("brightness", Number(e.target.value))
                }
                className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
              />
            </div>
          )}
        </div>

        {/* Sepia */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">Sepia</span>
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
          {activeEffect === "sepia" && (
            <div className="flex items-center">
              <Box sx={{ width: "100%" }}>
                <Slider
                  size="small"
                  min={0}
                  max={100}
                  value={localEffects.sepia}
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
                value={localEffects.sepia}
                onChange={(e) =>
                  onEffectChange &&
                  onEffectChange("sepia", Number(e.target.value))
                }
                className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
              />
            </div>
          )}
        </div>

        {/* Grayscale */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">Grayscale</span>
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
          {activeEffect === "grayscale" && (
            <div className="flex items-center">
              <Box sx={{ width: "100%" }}>
                <Slider
                  size="small"
                  min={0}
                  max={100}
                  value={localEffects.grayscale}
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
                value={localEffects.grayscale}
                onChange={(e) =>
                  onEffectChange &&
                  onEffectChange("grayscale", Number(e.target.value))
                }
                className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
              />
            </div>
          )}
        </div>

        {/* Border */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">Border</span>
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
          {isEffectEnabled("border") && (
            <div className="space-y-2">
              <div className="flex items-center">
                <Box sx={{ width: "100%" }}>
                  <Slider
                    size="small"
                    min={0}
                    max={20}
                    value={localEffects.border}
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
                  max={20}
                  value={localEffects.border}
                  onChange={(e) =>
                    onEffectChange &&
                    onEffectChange("border", Number(e.target.value))
                  }
                  className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Color</span>
                <div
                  className="w-8 h-8 rounded border cursor-pointer"
                  style={{
                    backgroundColor: localEffects.borderColor || "#000000",
                    border: "1px solid #ccc",
                  }}
                  onClick={handleBorderColorClick}
                >
                  <input
                    ref={borderColorRef}
                    type="color"
                    className="hidden"
                    value={localEffects.borderColor || "#000000"}
                    onChange={handleBorderColorChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Opacity */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">Opacity</span>
            <div
              className="relative inline-block w-8 h-4 rounded-full bg-gray-200 cursor-pointer"
              onClick={() => handleToggleClick("opacity")}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isEffectEnabled("opacity")}
                onChange={() => {}}
              />
              <div
                className={`absolute inset-0 rounded-full transition ${
                  isEffectEnabled("opacity") ? "bg-blue-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition transform ${
                  isEffectEnabled("opacity") ? "translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>
          {isEffectEnabled("opacity") && (
            <div className="flex items-center">
              <Box sx={{ width: "100%" }}>
                <Slider
                  size="small"
                  min={0}
                  max={100}
                  step={1}
                  value={localEffects.opacity}
                  onChange={(e, val) =>
                    handleDirectSliderChange(
                      "opacity",
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
                value={localEffects.opacity}
                onChange={(e) =>
                  onEffectChange &&
                  onEffectChange("opacity", Number(e.target.value))
                }
                className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
              />
            </div>
          )}
        </div>

        {/* Corner Radius */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">Corner Radius</span>
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
          {activeEffect === "cornerRadius" && (
            <div className="flex items-center">
              <Box sx={{ width: "100%" }}>
                <Slider
                  size="small"
                  min={0}
                  max={30}
                  value={localEffects.cornerRadius}
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
                value={localEffects.cornerRadius}
                onChange={(e) =>
                  onEffectChange &&
                  onEffectChange("cornerRadius", Number(e.target.value))
                }
                className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
              />
            </div>
          )}
        </div>

        {/* Shadow */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="font-medium">Shadow</span>
            <div
              className="relative inline-block w-8 h-4 rounded-full bg-gray-200 cursor-pointer"
              onClick={() => handleToggleClick("shadow")}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={isEffectEnabled("shadow")}
                onChange={() => {}}
              />
              <div
                className={`absolute inset-0 rounded-full transition ${
                  isEffectEnabled("shadow") ? "bg-blue-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition transform ${
                  isEffectEnabled("shadow") ? "translate-x-4" : ""
                }`}
              ></div>
            </div>
          </div>
          {activeEffect === "shadow" && (
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="mr-1">Blur</span>
                <Box sx={{ width: "100%" }}>
                  <Slider
                    size="small"
                    min={0}
                    max={30}
                    value={localEffects.shadow.blur}
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
                  value={localEffects.shadow.blur}
                  onChange={(e) =>
                    onEffectChange &&
                    onEffectChange("shadow.blur", Number(e.target.value))
                  }
                  className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
                />
              </div>
              <div className="flex items-center mt-1">
                <span className="mr-1">Offset X</span>
                <Box sx={{ width: "100%" }}>
                  <Slider
                    size="small"
                    min={-10}
                    max={10}
                    value={localEffects.shadow.offsetX}
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
                  value={localEffects.shadow.offsetX}
                  onChange={(e) =>
                    onEffectChange &&
                    onEffectChange("shadow.offsetX", Number(e.target.value))
                  }
                  className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
                />
              </div>
              <div className="flex items-center mt-1">
                <span className="mr-1">Offset Y</span>
                <Box sx={{ width: "100%" }}>
                  <Slider
                    size="small"
                    min={-10}
                    max={10}
                    value={localEffects.shadow.offsetY}
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
                  value={localEffects.shadow.offsetY}
                  onChange={(e) =>
                    onEffectChange &&
                    onEffectChange("shadow.offsetY", Number(e.target.value))
                  }
                  className="ml-1 w-8 h-5 text-center border border-gray-300 rounded text-xs"
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm">Color</span>
                <div
                  className="w-8 h-8 rounded border cursor-pointer"
                  style={{
                    backgroundColor: localEffects.shadow.color || "#000000",
                    border: "1px solid #ccc",
                  }}
                  onClick={handleShadowColorClick}
                >
                  <input
                    ref={shadowColorRef}
                    type="color"
                    className="hidden"
                    value={localEffects.shadow.color || "#000000"}
                    onChange={handleShadowColorChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
