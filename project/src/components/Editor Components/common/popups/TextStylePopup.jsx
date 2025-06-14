

import { useState, useRef, useEffect } from "react"
import { List, Type } from "lucide-react"

function TextStylePopup({ lineHeight , letterSpacing , onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLineHeight, setCurrentLineHeight] = useState(lineHeight)
  const [currentLetterSpacing, setCurrentLetterSpacing] = useState(letterSpacing)
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

  const handleLineHeightChange = (newValue) => {
    setCurrentLineHeight(newValue)
    if (onChange) {
      onChange({ lineHeight: newValue, letterSpacing: currentLetterSpacing })
    }
  }

  const handleLetterSpacingChange = (newValue) => {
    setCurrentLetterSpacing(newValue)
    if (onChange) {
      onChange({ lineHeight: currentLineHeight, letterSpacing: newValue })
    }
  }

  return (
    <div className=" relative" ref={popupRef}>
      {/* <button className="p-2 rounded-md hover:bg-gray-100" onClick={() => setIsOpen(!isOpen)}>
        <List className="h-5 w-5 text-gray-600" />
      </button> */}

      {/* {isOpen && ( */}
        <div className=" z-50 right-44 mt-1 w-64 bg-white rounded-md shadow-lg border p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Line Height</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={currentLineHeight}
                onChange={(e) => handleLineHeightChange(Number(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                value={currentLineHeight}
                onChange={(e) => handleLineHeightChange(Number(e.target.value))}
                className="w-16 p-2 border rounded-md"
                min="0.5"
                max="3"
                step="0.1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Letter Spacing</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="-5"
                max="10"
                step="0.5"
                value={currentLetterSpacing}
                onChange={(e) => handleLetterSpacingChange(Number(e.target.value))}
                className="w-full"
              />
              <input
                type="number"
                value={currentLetterSpacing}
                onChange={(e) => handleLetterSpacingChange(Number(e.target.value))}
                className="w-16 p-2 border rounded-md"
                min="-5"
                max="10"
                step="0.5"
              />
            </div>
          </div>
        </div>
      {/* )} */}
    </div>
  )
}

export default TextStylePopup
