

import { useState, useRef, useEffect } from "react"
import { ArrowLeftRight, ArrowUpDown } from "lucide-react"

function FlipPopup({ onFlip }) {
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

  const handleFlip = (direction) => {
    if (onFlip) {
      onFlip(direction)
    }
    setIsOpen(false)
  }

  return (
    <div className="overflow-hidden" ref={popupRef}>
      <button
        className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Flip</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 bg-white rounded-md shadow-lg border">
          <button
            className="flex items-center gap-2 px-4 py-3 w-full text-left hover:bg-gray-50"
            onClick={() => handleFlip("horizontal")}
          >
            <ArrowLeftRight className="h-5 w-5" />
            <span>Flip horizontally</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-3 w-full text-left hover:bg-gray-50"
            onClick={() => handleFlip("vertical")}
          >
            <ArrowUpDown className="h-5 w-5" />
            <span>Flip vertically</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default FlipPopup
