// @ts-nocheck
"use client";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/outline";
import {
  UploadIcon,
  CornerRightUpIcon as CornerIcon,
  CropIcon,
  AlignLeft,
  Move,
  Square,
  Copy,
  Trash2,
  Droplet,
  RotateCw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Maximize,
  Filter,
  ImageIcon,
} from "lucide-react";
import BorderStyleDropdown from "./BorderStyleDropdown";
import TransparencyDropdown from "./TransparencyDropdown";
import MaskPanel from "./MaskPanel";

// Common toolbar style
const toolbarStyle =
  "flex items-center h-14 bg-white border border-gray-200 rounded-sm shadow-sm";

// Utility function to get data from localStorage
const getLocalStorageData = (key: string, defaultValue: any) => {
  const storedValue = localStorage.getItem(key);
  return storedValue ? storedValue : defaultValue;
};

// ==== TEXT TOOLBAR ====
interface ToolbarProps {
  onFontChange?: (font: string) => void;
  onFontSizeChange?: (size: number) => void;
  onColorChange?: (color: string) => void;
  onBackgroundColorChange?: (color: string) => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  isItemSelected?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onFontChange,
  onFontSizeChange,
  onColorChange,
  onBackgroundColorChange,
  onCopy,
  onDelete,
  onUndo,
  onRedo,
  isItemSelected,
}) => {
  const [fontSize, setFontSize] = useState<number>(() =>
    Number.parseInt(getLocalStorageData("editor_fontSize", "115"))
  );
  const [fontFamily, setFontFamily] = useState<string>(() =>
    getLocalStorageData("editor_fontFamily", "Open Sans")
  );
  const [fontColor, setFontColor] = useState<string>(() =>
    getLocalStorageData("editor_fontColor", "#000000")
  );
  const [backgroundColor, setBackgroundColor] = useState<string>(() =>
    getLocalStorageData("editor_backgroundColor", "#ffffff")
  );

  const handleFontChange = (nextFont: Font) => {
    setFontFamily(nextFont.family);
    onFontChange?.(nextFont.family);
    localStorage.setItem("editor_fontFamily", nextFont.family);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = Number.parseInt(e.target.value, 10);
    setFontSize(newSize);
    onFontSizeChange?.(newSize);
    localStorage.setItem("editor_fontSize", newSize.toString());
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setFontColor(newColor);
    onColorChange?.(newColor);
    localStorage.setItem("editor_fontColor", newColor);
  };

  const handleBackgroundColorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newColor = e.target.value;
    setBackgroundColor(newColor);
    onBackgroundColorChange?.(newColor);
    localStorage.setItem("editor_backgroundColor", newColor);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && isItemSelected) {
        onDelete?.();
      } else if (e.ctrlKey && e.key === "c" && isItemSelected) {
        onCopy?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDelete, onCopy, isItemSelected]);

  return (
    <div className="flex items-center p-2 border-b h-14">
      <div className="flex space-x-2 mr-4">
        {/* <FontPicker
          apiKey="AIzaSyBF9iz-ZlVitz2P0x6Ob9X63MFKf1-8_i8"
          activeFontFamily={fontFamily}
          onChange={handleFontChange}
        /> */}
        <input
          type="number"
          className="w-16 px-2 py-1 border border-gray-200 rounded"
          value={fontSize}
          onChange={handleFontSizeChange}
        />
        <input
          type="color"
          className="w-10 h-10 p-1 border border-gray-200 rounded"
          value={fontColor}
          onChange={handleColorChange}
        />
        <input
          type="color"
          className="w-10 h-10 p-1 border border-gray-200 rounded"
          value={backgroundColor}
          onChange={handleBackgroundColorChange}
        />
      </div>
      <div className="flex space-x-2 mr-4">
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Undo"
          onClick={onUndo}
        >
          <ArrowUturnLeftIcon className="h-5 w-5" />
        </button>
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Redo"
          onClick={onRedo}
        >
          <ArrowUturnRightIcon className="h-5 w-5" />
        </button>
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Copy"
          onClick={onCopy}
        >
          <DocumentDuplicateIcon className="h-5 w-5" />
        </button>
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Delete"
          onClick={onDelete}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// ==== SHAPE TOOLBAR ====
interface EffectsDropdownProps {
  onEffectsChange?: (effects: ShapeEffects) => void;
}

interface ShapeEffects {
  shadow: boolean;
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
  color: string;
}

const EffectsDropdown: React.FC<EffectsDropdownProps> = ({
  onEffectsChange,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [effects, setEffects] = useState<ShapeEffects>({
    shadow: false,
    blur: 5,
    offsetX: 0,
    offsetY: 0,
    opacity: 100,
    color: "#000000",
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleShadowToggle = () => {
    const newEffects = {
      ...effects,
      shadow: !effects.shadow,
    };
    setEffects(newEffects);
    onEffectsChange?.(newEffects);
    localStorage.setItem("editor_shapeEffects", JSON.stringify(newEffects));
  };

  const handleBlurChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const blur = Number.parseInt(e.target.value, 10);
    const newEffects = {
      ...effects,
      blur,
    };
    setEffects(newEffects);
    onEffectsChange?.(newEffects);
    localStorage.setItem("editor_shapeEffects", JSON.stringify(newEffects));
  };

  const handleOffsetXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const offsetX = Number.parseInt(e.target.value, 10);
    const newEffects = {
      ...effects,
      offsetX,
    };
    setEffects(newEffects);
    onEffectsChange?.(newEffects);
    localStorage.setItem("editor_shapeEffects", JSON.stringify(newEffects));
  };

  const handleOffsetYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const offsetY = Number.parseInt(e.target.value, 10);
    const newEffects = {
      ...effects,
      offsetY,
    };
    setEffects(newEffects);
    onEffectsChange?.(newEffects);
    localStorage.setItem("editor_shapeEffects", JSON.stringify(newEffects));
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const opacity = Number.parseInt(e.target.value, 10);
    const newEffects = {
      ...effects,
      opacity,
    };
    setEffects(newEffects);
    onEffectsChange?.(newEffects);
    localStorage.setItem("editor_shapeEffects", JSON.stringify(newEffects));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    const newEffects = {
      ...effects,
      color,
    };
    setEffects(newEffects);
    onEffectsChange?.(newEffects);
    localStorage.setItem("editor_shapeEffects", JSON.stringify(newEffects));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 flex rounded-md hover:bg-gray-100 cursor-pointer"
        title="Effects"
        onClick={toggleDropdown}
      >
        <svg
          data-icon="left-join"
          height="16"
          role="img"
          viewBox="0 0 16 16"
          width="16"
        >
          <path
            d="M6.6 3.3C6.1 3.1 5.6 3 5 3 2.2 3 0 5.2 0 8s2.2 5 5 5c.6 0 1.1-.1 1.6-.3C5.3 11.6 4.5 9.9 4.5 8s.8-3.6 2.1-4.7zM8 4c-1.2.9-2 2.4-2 4s.8 3.1 2 4c1.2-.9 2-2.3 2-4s-.8-3.1-2-4zm3-1c2.8 0 5 2.2 5 5s-2.2 5-5 5c-.6 0-1.1-.1-1.6-.3 1.3-1.1 2.1-2.9 2.1-4.7s-.8-3.5-2.1-4.7c.5-.2 1-.3 1.6-.3zm.35 1.02c.73 1.15 1.14 2.52 1.14 3.98s-.42 2.83-1.14 3.98c2.04-.18 3.64-1.9 3.64-3.98s-1.6-3.8-3.64-3.98z"
            fillRule="evenodd"
          ></path>
        </svg>
        <span className="text-sm text-gray-600">Effects</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-4 w-64">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Shadow</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={effects.shadow}
                  onChange={handleShadowToggle}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {effects.shadow && (
              <>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blur</span>
                    <input
                      type="number"
                      className="w-16 h-8 border border-gray-300 rounded text-sm px-2"
                      value={effects.blur}
                      onChange={handleBlurChange}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    className="w-full"
                    value={effects.blur}
                    onChange={handleBlurChange}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Offset X</span>
                    <input
                      type="number"
                      className="w-16 h-8 border border-gray-300 rounded text-sm px-2"
                      value={effects.offsetX}
                      onChange={handleOffsetXChange}
                    />
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    className="w-full"
                    value={effects.offsetX}
                    onChange={handleOffsetXChange}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Offset Y</span>
                    <input
                      type="number"
                      className="w-16 h-8 border border-gray-300 rounded text-sm px-2"
                      value={effects.offsetY}
                      onChange={handleOffsetYChange}
                    />
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    className="w-full"
                    value={effects.offsetY}
                    onChange={handleOffsetYChange}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Opacity</span>
                    <input
                      type="number"
                      className="w-16 h-8 border border-gray-300 rounded text-sm px-2"
                      value={effects.opacity}
                      onChange={handleOpacityChange}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="w-full"
                    value={effects.opacity}
                    onChange={handleOpacityChange}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Color</span>
                    <input
                      type="color"
                      className="w-8 h-8 p-0 border-0"
                      value={effects.color}
                      onChange={handleColorChange}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface ShapeToolbarProps {
  onColorChange?: (color: string) => void;
  onTransparencyChange?: (transparency: number) => void;
  onEffectsChange?: (effects: ShapeEffects) => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  isItemSelected?: boolean;
  onBorderStyleChange?: (style: string) => void;
  onBorderWidthChange?: (width: number) => void;
  onBorderColorChange?: (color: string) => void;
  borderStyle?: string;
  borderWidth?: number;
  borderColor?: string;
  selectedShapeId?: string | null;
  updateShape?: (id: string, updates: Partial<Shape>) => void;
}

const ShapeToolbar: React.FC<ShapeToolbarProps> = ({
  onColorChange,
  onTransparencyChange,
  onEffectsChange,
  onCopy,
  onDelete,
  onUndo,
  onRedo,
  isItemSelected,
  onBorderStyleChange,
  onBorderWidthChange,
  onBorderColorChange,
  borderStyle,
  borderWidth,
  borderColor,
  selectedShapeId,
  updateShape,
}) => {
  const [shapeColor, setShapeColor] = useState<string>(() =>
    getLocalStorageData("editor_shapeColor", "#cccccc")
  );
  const [shapeTransparency, setShapeTransparency] = useState<number>(() =>
    Number.parseFloat(getLocalStorageData("editor_shapeTransparency", "0"))
  );

  const handleShapeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setShapeColor(newColor);
    onColorChange?.(newColor);
    localStorage.setItem("editor_shapeColor", newColor);
  };

  const handleShapeTransparencyChange = (newTransparency: number) => {
    setShapeTransparency(newTransparency);
    onTransparencyChange?.(newTransparency);
    localStorage.setItem(
      "editor_shapeTransparency",
      newTransparency.toString()
    );
  };

  const handleEffectsChange = (effects: ShapeEffects) => {
    onEffectsChange?.(effects);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && isItemSelected) {
        onDelete?.();
      } else if (e.ctrlKey && e.key === "c" && isItemSelected) {
        onCopy?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDelete, onCopy, isItemSelected]);

  return (
    <div className="flex items-center p-2 border-b h-14">
      <div className="flex space-x-2 mr-4">
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Undo"
          onClick={onUndo}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            className="w-5 h-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M212.333 224.333H12c-6.627 0-12-5.373-12-12V12C0 5.373 5.373 0 12 0h48c6.627 0 12 5.373 12 12v78.112C117.773 39.279 184.26 7.47 258.175 8.007c136.906.994 246.448 111.623 246.157 248.532C504.041 393.258 393.12 504 256.333 504c-64.089 0-122.496-24.313-166.51-64.215-5.099-4.622-5.334-12.554-.467-17.42l33.967-33.967c4.474-4.474 11.662-4.717 16.401-.525C170.76 415.336 211.58 432 256.333 432c97.268 0 176-78.716 176-176 0-97.267-78.716-176-176-176-58.496 0-110.28 28.476-142.274 72.333h98.274c6.627 0 12 5.373 12 12v48c0 6.627-5.373 12-12 12z"></path>
          </svg>
        </button>
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Redo"
          onClick={onRedo}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            className="w-5 h-5 text-gray-600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M500.33 0h-47.41a12 12 0 0 0-12 12.57l4 82.76A247.42 247.42 0 0 0 256 8C119.34 8 7.9 119.53 8 256.19 8.1 393.07 119.1 504 256 504a247.1 247.1 0 0 0 166.18-63.91 12 12 0 0 0 .48-17.43l-34-34a12 12 0 0 0-16.38-.55A176 176 0 1 1 402.1 157.8l-101.53-4.87a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12h200.33a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12z"></path>
          </svg>
        </button>
        <input
          type="color"
          className="w-10 h-10 p-1 border border-gray-200 rounded"
          value={shapeColor}
          onChange={handleShapeColorChange}
          title="Fill Color"
        />

        {/* Replace the inline transparency control with the new dropdown */}
        <TransparencyDropdown
          onTransparencyChange={handleShapeTransparencyChange}
          transparency={shapeTransparency}
          selectedShapeId={selectedShapeId}
          updateShape={updateShape}
        />

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Alignment"
        >
          <AlignLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Effects Dropdown Component */}
        <EffectsDropdown onEffectsChange={handleEffectsChange} />

        <BorderStyleDropdown
          onBorderStyleChange={onBorderStyleChange}
          onBorderWidthChange={onBorderWidthChange}
          onBorderColorChange={onBorderColorChange}
          borderStyle={borderStyle || "solid"}
          borderWidth={borderWidth || 0}
          borderColor={borderColor || "#000000"}
          selectedShapeId={selectedShapeId}
          updateShape={updateShape}
        />

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Position"
        >
          <div className="flex items-center gap-1.5">
            <Move className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">Position</span>
          </div>
        </button>
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Select"
        >
          <Square className="w-5 h-5 text-gray-600" />
        </button>
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Change Angle"
        >
          <CornerIcon className="w-5 h-5 text-gray-600" />
        </button>
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Copy"
          onClick={onCopy}
        >
          <Copy className="w-5 h-5 text-gray-600" />
        </button>
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Delete"
          onClick={onDelete}
        >
          <Trash2 className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

// ==== IMAGE TOOLBAR ====
const ImageToolbar = ({
  onFlip,
  onEffects,
  onFitToPage,
  onApplyMask,
  onCrop,
  onCropApply,
  onCropCancel,
  onUpload,
  onChangeImage,
  onPosition,
  onBorderChange,
  onCornerChange,
  onLock,
  onCopy,
  onDelete,
  onUndo,
  onRedo,
  onRotate,
  onZoomIn,
  onZoomOut,
  isItemSelected = false,
  isItemLocked = false,
  isCropping = false,
  selectedTool = null,
  onSelectTool,
  brightness = 100,
  contrast = 100,
  saturation = 100,
  scale = 1,
}) => {
  const [isMaskPanelOpen, setIsMaskPanelOpen] = useState(false);

  // Handle tool selection
  const handleToolSelect = (tool) => {
    if (onSelectTool) {
      onSelectTool(selectedTool === tool ? null : tool);
    }
  };

  const handleMaskSelect = (maskType: string) => {
    onApplyMask(maskType);
    setIsMaskPanelOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && isItemSelected && !isItemLocked) {
        onDelete?.();
      } else if (e.ctrlKey && e.key === "c" && isItemSelected) {
        onCopy?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onDelete, onCopy, isItemSelected, isItemLocked]);

  return (
    <div className="flex text-gray-800 items-center p-2 border-b h-14 relative">
      <div className="flex items-center space-x-1">
        {/* Undo button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Undo"
          onClick={onUndo}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M212.333 224.333H12c-6.627 0-12-5.373-12-12V12C0 5.373 5.373 0 12 0h48c6.627 0 12 5.373 12 12v78.112C117.773 39.279 184.26 7.47 258.175 8.007c136.906.994 246.448 111.623 246.157 248.532C504.041 393.258 393.12 504 256.333 504c-64.089 0-122.496-24.313-166.51-64.215-5.099-4.622-5.334-12.554-.467-17.42l33.967-33.967c4.474-4.474 11.662-4.717 16.401-.525C170.76 415.336 211.58 432 256.333 432c97.268 0 176-78.716 176-176 0-97.267-78.716-176-176-176-58.496 0-110.28 28.476-142.274 72.333h98.274c6.627 0 12 5.373 12 12v48c0 6.627-5.373 12-12 12z"></path>
          </svg>
        </button>

        {/* Redo button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Redo"
          onClick={onRedo}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M500.33 0h-47.41a12 12 0 0 0-12 12.57l4 82.76A247.42 247.42 0 0 0 256 8C119.34 8 7.9 119.53 8 256.19 8.1 393.07 119.1 504 256 504a247.1 247.1 0 0 0 166.18-63.91 12 12 0 0 0 .48-17.43l-34-34a12 12 0 0 0-16.38-.55A176 176 0 1 1 402.1 157.8l-101.53-4.87a12 12 0 0 0-12.57 12v47.41a12 12 0 0 0 12 12h200.33a12 12 0 0 0 12-12V12a12 12 0 0 0-12-12z"></path>
          </svg>
        </button>

        {/* Move tool */}
        <button
          className={`p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer ${
            selectedTool === "move" ? "bg-blue-100" : ""
          }`}
          title="Move"
          onClick={() => handleToolSelect("move")}
        >
          <Move className="h-5 w-5" />
        </button>

        {/* Rotate button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Rotate"
          onClick={onRotate}
        >
          <RotateCw className="h-5 w-5" />
        </button>

        {/* Flip button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Flip"
          onClick={onFlip}
        >
          <FlipHorizontal className="h-5 w-5" />
        </button>

        {/* Zoom in button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Zoom In"
          onClick={onZoomIn}
        >
          <ZoomIn className="h-5 w-5" />
        </button>

        {/* Zoom out button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Zoom Out"
          onClick={onZoomOut}
        >
          <ZoomOut className="h-5 w-5" />
        </button>

        {/* Fit to page button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Fit to page"
          onClick={onFitToPage}
        >
          <Maximize className="h-5 w-5" />
        </button>

        {/* Apply mask button */}
        <div className="relative">
          <button
            className={`p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer ${
              isMaskPanelOpen ? "bg-blue-100" : ""
            }`}
            title="Apply mask"
            onClick={() => setIsMaskPanelOpen(!isMaskPanelOpen)}
          >
            <Droplet className="h-5 w-5" />
          </button>
          <MaskPanel isOpen={isMaskPanelOpen} onSelectMask={handleMaskSelect} />
        </div>

        {/* Crop button with conditional rendering */}
        {!isCropping ? (
          <button
            className={`p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer ${
              selectedTool === "crop" ? "bg-blue-100" : ""
            }`}
            title="Crop"
            onClick={onCrop}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="Crop">
                <path d="M5.624,6.623l-2.075,-0c-0.276,-0 -0.5,-0.224 -0.5,-0.5c-0,-0.276 0.224,-0.5 0.5,-0.5l2.075,-0l0,-2.073c0,-0.276 0.224,-0.5 0.5,-0.5c0.276,0 0.5,0.224 0.5,0.5l0,2.073l9.191,-0c1.414,-0 2.561,1.147 2.561,2.561l-0,9.193l2.075,0c0.276,0 0.5,0.224 0.5,0.5c0,0.276 -0.224,0.5 -0.5,0.5l-2.075,0l-0,2.073c-0,0.276 -0.224,0.5 -0.5,0.5c-0.276,-0 -0.5,-0.224 -0.5,-0.5l-0,-2.073l-9.191,0c-1.414,0 -2.561,-1.147 -2.561,-2.561l0,-9.193Zm11.752,10.754l-0,-9.193c-0,-0.862 -0.699,-1.561 -1.561,-1.561l-9.191,-0l0,9.193c0,0.862 0.699,1.561 1.561,1.561l9.191,0Z"></path>
              </g>
            </svg>
          </button>
        ) : (
          <>
            <button
              className="p-2 rounded bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
              title="Apply Crop"
              onClick={onCropApply}
            >
              <span className="text-xs font-medium">Apply</span>
            </button>
            <button
              className="p-2 rounded bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              title="Cancel Crop"
              onClick={onCropCancel}
            >
              <span className="text-xs font-medium">Cancel</span>
            </button>
          </>
        )}

        {/* Effects button */}
        <button
          className={`p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer ${
            selectedTool === "effects" ? "bg-blue-100" : ""
          }`}
          title="Effects"
          onClick={onEffects}
        >
          <Filter className="h-5 w-5" />
        </button>

        {/* Upload button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Upload"
          onClick={onUpload}
        >
          <svg
            viewBox="64 64 896 896"
            focusable="false"
            data-icon="upload"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M400 317.7h73.9V656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V317.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 163a8 8 0 00-12.6 0l-112 141.7c-4.1 5.3-.4 13 6.3 13zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"></path>
          </svg>
        </button>

        {/* Change Image button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Change Image"
          onClick={onChangeImage}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 24 24"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path fill="none" d="M24 24H0V0h24v24z"></path>
            <path d="M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3.01L14.5 11l4.5 6H5z"></path>
          </svg>
        </button>

        {/* Position button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Position"
          onClick={onPosition}
        >
          <svg
            data-icon="layers"
            height="16"
            role="img"
            viewBox="0 0 16 16"
            width="16"
          >
            <path
              d="M.55 4.89l7 3c.14.07.29.11.45.11.16 0 .31-.04.45-.11l7-3a.998.998 0 00-.06-1.81L8.4.08a1.006 1.006 0 00-.79 0l-6.99 3a.992.992 0 00-.07 1.81zM15 11c-.16 0-.31.04-.45.11L8 14l-6.55-2.9c-.14-.06-.29-.1-.45-.1-.55 0-1 .45-1 1 0 .39.23.73.55.89l7 3c.14.07.29.11.45.11.16 0 .31-.04.45-.11l7-3c.32-.16.55-.5.55-.89 0-.55-.45-1-1-1zm0-4c-.16 0-.31.04-.45.11L8 10 1.45 7.11A.997.997 0 001 7c-.55 0-1 .45-1 1 0 .39.23.73.55.89l7 3c.14.07.29.11.45.11.16 0 .31-.04.45-.11l7-3c.32-.16.55-.5.55-.89 0-.55-.45-1-1-1z"
              fillRule="evenodd"
            ></path>
          </svg>
        </button>

        {/* Border Change button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Border"
          onClick={onBorderChange}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4zm1 2h10v10H5V5z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Corner Change button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Corners"
          onClick={onCornerChange}
        >
          <svg
            data-icon="left-join"
            height="16"
            role="img"
            viewBox="0 0 16 16"
            width="16"
          >
            <path
              d="M6.6 3.3C6.1 3.1 5.6 3 5 3 2.2 3 0 5.2 0 8s2.2 5 5 5c.6 0 1.1-.1 1.6-.3C5.3 11.6 4.5 9.9 4.5 8s.8-3.6 2.1-4.7zM8 4c-1.2.9-2 2.4-2 4s.8 3.1 2 4c1.2-.9 2-2.3 2-4s-.8-3.1-2-4zm3-1c2.8 0 5 2.2 5 5s-2.2 5-5 5c-.6 0-1.1-.1-1.6-.3 1.3-1.1 2.1-2.9 2.1-4.7s-.8-3.5-2.1-4.7c.5-.2 1-.3 1.6-.3zm.35 1.02c.73 1.15 1.14 2.52 1.14 3.98s-.42 2.83-1.14 3.98c2.04-.18 3.64-1.9 3.64-3.98s-1.6-3.8-3.64-3.98z"
              fillRule="evenodd"
            ></path>
          </svg>
        </button>

        {/* Lock button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title={isItemLocked ? "Unlock" : "Lock"}
          onClick={onLock}
        >
          {isItemLocked ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
            </svg>
          )}
        </button>

        {/* Copy button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Copy"
          onClick={onCopy}
          disabled={!isItemSelected}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${!isItemSelected ? "text-gray-400" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
          </svg>
        </button>

        {/* Delete button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Delete"
          onClick={onDelete}
          disabled={!isItemSelected || isItemLocked}
        >
          <svg
            data-icon="trash"
            height="16"
            role="img"
            viewBox="0 0 16 16"
            width="16"
            className={`${
              !isItemSelected || isItemLocked ? "text-gray-400" : ""
            }`}
          >
            <path
              d="M14.49 3.99h-13c-.28 0-.5.22-.5.5s.22.5.5.5h.5v10c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-10h.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm-8.5 9c0 .55-.45 1-1 1s-1-.45-1-1v-6c0-.55.45-1 1-1s1 .45 1 1v6zm3 0c0 .55-.45 1-1 1s-1-.45-1-1v-6c0-.55.45-1 1-1s1 .45 1 1v6zm3 0c0 .55-.45 1-1 1s-1-.45-1-1v-6c0-.55.45-1 1-1s1 .45 1 1v6zm2-12h-4c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1h-4c-.55 0-1 .45-1 1v1h14v-1c0-.55-.45-1-1-1z"
              fillRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>

      {/* Display current scale if needed */}
      {scale !== 1 && (
        <div className="ml-2 text-xs text-gray-500">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
};

// ==== BACKGROUND TOOLBAR ====
interface BackgroundToolbarProps {
  onColorChange?: (color: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  isItemSelected?: boolean;
}

const BackgroundToolbar: React.FC<BackgroundToolbarProps> = ({
  onColorChange,
  onUndo,
  onRedo,
  isItemSelected,
}) => {
  const [backgroundColor, setBackgroundColor] = useState<string>(() =>
    getLocalStorageData("editor_backgroundColor", "#ffffff")
  );

  const handleBackgroundColorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newColor = e.target.value;
    setBackgroundColor(newColor);
    onColorChange?.(newColor);
    localStorage.setItem("editor_backgroundColor", newColor);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" && isItemSelected) {
        onUndo?.(); // Assuming undo is the desired action for background
      } else if (e.ctrlKey && e.key === "c" && isItemSelected) {
        onUndo?.(); // Assuming undo is the desired action for background
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onUndo, isItemSelected]);

  return (
    <div className="flex items-center p-2 border-b h-14">
      <div className="flex space-x-2 mr-4">
        <input
          type="color"
          className="w-10 h-10 p-1 border border-gray-200 rounded"
          value={backgroundColor}
          onChange={handleBackgroundColorChange}
        />
        <div className="flex items-center space-x-2">
          <span>Background Color</span>
        </div>
      </div>
      <div className="flex space-x-2 mr-4">
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Undo"
          onClick={onUndo}
        >
          <ArrowUturnLeftIcon className="h-5 w-5" />
        </button>
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Redo"
          onClick={onRedo}
        >
          <ArrowUturnRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export {
  Toolbar,
  EffectsDropdown,
  ShapeToolbar,
  ImageToolbar,
  BackgroundToolbar,
};
