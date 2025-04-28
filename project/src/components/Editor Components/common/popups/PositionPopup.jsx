import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from "lucide-react";

function PositionPopup({ onLayerPositionChange, onPositionChange }) {
  const [isOpen, setIsOpen] = useState(false);
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
  const handleLayeringAction = (action) => {
    if (onLayerPositionChange) {
      onLayerPositionChange(action);
    }
    setIsOpen(false);
  };

  const handlePositionAction = (action) => {
    if (onPositionChange) {
      onPositionChange(action);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectorRef}>
      <button
        className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-gray-100 border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          className="h-5 w-5 text-gray-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M4 12h16" />
          <path d="M12 4v16" />
        </svg>
        <span>Position</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute mt-1 w-72 border rounded-lg shadow-lg bg-white z-50">
          <div className="p-2 border-b">
            <h3 className="text-sm font-medium mb-1.5">Layering</h3>
            <div className="grid grid-cols-2 gap-1">
              <button
                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
                onClick={() => handleLayeringAction("up")}
              >
                <ArrowUp className="h-4 w-4" />
                <span>Up</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
                onClick={() => handleLayeringAction("down")}
              >
                <ArrowDown className="h-4 w-4" />
                <span>Down</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
                onClick={() => handleLayeringAction("toFront")}
              >
                <ChevronsUp className="h-4 w-4" />
                <span>To forward</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
                onClick={() => handleLayeringAction("toBack")}
              >
                <ChevronsDown className="h-4 w-4" />
                <span>To bottom</span>
              </button>
            </div>
          </div>

          <div className="p-2">
            <h3 className="text-sm font-medium mb-1.5">Position</h3>
            <div className="grid grid-cols-2 gap-1">
              <button
                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
                onClick={() => handlePositionAction("left")}
              >
                <AlignLeft className="h-4 w-4" />
                <span>Align left</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
                onClick={() => handlePositionAction("top")}
              >
                <AlignStartVertical className="h-4 w-4" />
                <span>Align top</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
                onClick={() => handlePositionAction("center")}
              >
                <AlignCenter className="h-4 w-4" />
                <span>Align center</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
                onClick={() => handlePositionAction("middle")}
              >
                <AlignCenterVertical className="h-4 w-4" />
                <span>Align middle</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
                onClick={() => handlePositionAction("right")}
              >
                <AlignRight className="h-4 w-4" />
                <span>Align right</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
                onClick={() => handlePositionAction("bottom")}
              >
                <AlignEndVertical className="h-4 w-4" />
                <span>Align bottom</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PositionPopup;
