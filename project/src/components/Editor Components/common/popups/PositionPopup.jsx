

import { useState, useRef, useEffect } from "react"
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
} from "lucide-react"

function PositionPopup({ onPositionChange, onAlignChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLayeringAction = (action) => {
    if (onPositionChange) {
      onPositionChange(action)
    }
  }

  const handleAlignAction = (action) => {
    if (onAlignChange) {
      onAlignChange(action)
    }
  }

  return (
    <div className="overflow-hidden" ref={popupRef}>
      <button
        className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M4 12h16" />
          <path d="M12 4v16" />
        </svg>
        <span>Position</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white rounded-md shadow-lg border">
          <div className="p-4 border-b">
            <h3 className="font-medium mb-3">Layering</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => handleLayeringAction("up")}
              >
                <ArrowUp className="h-5 w-5" />
                <span>Up</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => handleLayeringAction("down")}
              >
                <ArrowDown className="h-5 w-5" />
                <span>Down</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => handleLayeringAction("toFront")}
              >
                <ChevronsUp className="h-5 w-5" />
                <span>To forward</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => handleLayeringAction("toBack")}
              >
                <ChevronsDown className="h-5 w-5" />
                <span>To bottom</span>
              </button>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-medium mb-3">Position</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => handleAlignAction("left")}
              >
                <AlignLeft className="h-5 w-5" />
                <span>Align left</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => handleAlignAction("top")}
              >
                <AlignStartVertical className="h-5 w-5" />
                <span>Align top</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => handleAlignAction("center")}
              >
                <AlignCenter className="h-5 w-5" />
                <span>Align center</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => handleAlignAction("middle")}
              >
                <AlignCenterVertical className="h-5 w-5" />
                <span>Align middle</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => handleAlignAction("right")}
              >
                <AlignRight className="h-5 w-5" />
                <span>Align right</span>
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => handleAlignAction("bottom")}
              >
                <AlignEndVertical className="h-5 w-5" />
                <span>Align bottom</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PositionPopup
