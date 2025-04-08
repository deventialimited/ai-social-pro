// @ts-nocheck
"use client";
import type React from "react";
import { useEffect, useState } from "react";
import {
  CornerRightUpIcon as CornerIcon,
  CropIcon,
  Move,
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
  ArrowLeftRight, // Added for horizontal flip icon
  ArrowUpDown, // Added for vertical flip icon
} from "lucide-react";
import MaskPanel from "./MaskPanel";

// Common toolbar style
const toolbarStyle =
  "flex items-center h-14 bg-white border border-gray-200 rounded-sm shadow-sm";

// Utility function to get data from localStorage
const getLocalStorageData = (key: string, defaultValue: any) => {
  const storedValue = localStorage.getItem(key);
  return storedValue ? storedValue : defaultValue;
};

// Enhanced ImageToolbar with improved functionality
export function EnhancedImageToolbar({
  onFlip,
  onVerticalFlip,
  onEffects,
  onFitToPage,
  onApplyMask,
  onCrop,
  onCropApply,
  onCropCancel,
  upload,
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
  onDrag,
  onResize,
}) {
  const [isFlipDropdownOpen, setIsFlipDropdownOpen] = useState(false);
  const [isMaskPanelOpen, setIsMaskPanelOpen] = useState(false);

  // Handle tool selection
  const handleToolSelect = (tool) => {
    if (onSelectTool) {
      onSelectTool(selectedTool === tool ? null : tool);
    }
  };

  const handleMaskSelect = (maskType: string) => {
    if (onApplyMask) {
      onApplyMask(maskType);
    }
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
    <div className="flex text-gray-800 items-center p-2 border-b h-14">
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

        {/* Flip button with dropdown */}
        <div className="relative">
          <button
            className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer flex items-center"
            title="Flip"
            onClick={() => setIsFlipDropdownOpen(!isFlipDropdownOpen)}
          >
            <span className="text-sm font-medium">Flip</span>
            <svg
              className="ml-1 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>
          {isFlipDropdownOpen && (
            <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded shadow-lg">
              {/* Upward arrow at the top of the dropdown */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-gray-200 rotate-45"></div>
              <button
                className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  onFlip(); // Calls handleFlipHorizontal
                  setIsFlipDropdownOpen(false);
                }}
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Flip horizontally
              </button>
              <button
                className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  onVerticalFlip(); // Calls handleFlipVertical
                  setIsFlipDropdownOpen(false);
                }}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Flip vertically
              </button>
            </div>
          )}
        </div>

        {/* Effects button */}
        <button
          className={`p-2 rounded-md ${
            selectedTool === "effects"
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100 text-gray-700"
          } hover:cursor-pointer`}
          title="Effects"
          onClick={onEffects}
        >
          <span className="text-sm font-medium">Effects</span>
        </button>

        {/* Fit to page button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Fit to page"
          onClick={onFitToPage}
        >
          <span className="text-sm font-medium">Fit to page</span>
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
            <span className="text-sm font-medium ml-1">Mask</span>
          </button>
          <MaskPanel isOpen={isMaskPanelOpen} onSelectMask={handleMaskSelect} />
        </div>

        {/* Crop button with conditional rendering */}
        {!isCropping ? (
          <button
            className={`p-2 rounded flex hover:bg-gray-100 transition-colors cursor-pointer ${
              selectedTool === "crop" ? "bg-blue-100" : ""
            }`}
            title="Crop"
            onClick={onCrop}
          >
            <CropIcon className="h-5 w-5" />
            <span className="text-sm font-medium ml-1">Crop</span>
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

        {/* Upload button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors flex items-center cursor-pointer"
          title="Upload"
          onClick={upload}
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
          <span className="text-sm font-medium ml-1">Upload</span>
        </button>

        {/* Position button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors flex items-center cursor-pointer"
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
          <span className="text-sm font-medium ml-1">Position</span>
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
          <CornerIcon className="h-5 w-5" />
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
          <Copy className="h-5 w-5" />
        </button>

        {/* Delete button */}
        <button
          className="p-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
          title="Delete"
          onClick={onDelete}
          disabled={!isItemSelected || isItemLocked}
        >
          <Trash2 className="h-5 w-5" />
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
}
