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

function PositionPopup({ onLayerPositionChange, onPositionChange, onClose }) {
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

  const handleLayeringAction = (action) => {
    if (onLayerPositionChange) {
      onLayerPositionChange(action);
    }
    onClose?.();
  };

  const handlePositionAction = (action) => {
    if (onPositionChange) {
      onPositionChange(action);
    }
    onClose?.();
  };

  return (
    <div ref={popupRef} className="w-72 border rounded-lg shadow-lg bg-white">
      <div className="p-2 border-b">
        <h3 className="text-sm font-medium mb-1.5">Layering</h3>
        <div className="grid grid-cols-2 gap-1">
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => handleLayeringAction("up")}
          >
            <ArrowUp className="h-4 w-4" />
            <span>Bring Forward</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => handleLayeringAction("down")}
          >
            <ArrowDown className="h-4 w-4" />
            <span>Send Backward</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => handleLayeringAction("toFront")}
          >
            <ChevronsUp className="h-4 w-4" />
            <span>Bring to Front</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => handleLayeringAction("toBack")}
          >
            <ChevronsDown className="h-4 w-4" />
            <span>Send to Back</span>
          </button>
        </div>
      </div>

      <div className="p-2">
        <h3 className="text-sm font-medium mb-1.5">Alignment</h3>
        <div className="grid grid-cols-3 gap-1">
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => handlePositionAction("left")}
          >
            <AlignLeft className="h-4 w-4" />
            <span>Left</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => handlePositionAction("center")}
          >
            <AlignCenter className="h-4 w-4" />
            <span>Center</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => handlePositionAction("right")}
          >
            <AlignRight className="h-4 w-4" />
            <span>Right</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => handlePositionAction("top")}
          >
            <AlignStartVertical className="h-4 w-4" />
            <span>Top</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => handlePositionAction("middle")}
          >
            <AlignCenterVertical className="h-4 w-4" />
            <span>Middle</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 hover:bg-gray-100 rounded-md text-sm"
            onClick={() => handlePositionAction("bottom")}
          >
            <AlignEndVertical className="h-4 w-4" />
            <span>Bottom</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PositionPopup;
