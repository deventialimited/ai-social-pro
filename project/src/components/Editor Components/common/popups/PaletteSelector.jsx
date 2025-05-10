

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks"

function PaletteSelector({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPalette, setSelectedPalette] = useState("Palette")
  const selectorRef = useRef(null)
  const { postOtherValues } = useEditor()
  const palettes = [
    { name: "Palette", colors: postOtherValues?.siteColors || ["#87CEEB", "#000000", "#FFFFFF"] },
    { name: "Vibrant", colors: ["#FF5733", "#33FF57", "#3357FF"] },
    { name: "Pastel", colors: ["#FFB6C1", "#B6FFB6", "#B6C1FF"] },
    { name: "Monochrome", colors: ["#000000", "#666666", "#FFFFFF"] },
    { name: "Warm", colors: ["#FF7F50", "#FFBF00", "#FF4500"] },
    { name: "Cool", colors: ["#00CED1", "#5F9EA0", "#4682B4"] },
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (palette) => {
    setSelectedPalette(palette.name)
    setIsOpen(false)
    if (onSelect) {
      onSelect(palette)
    }
  }

  return (
    <div className="overflow-hidden" ref={selectorRef}>
      <button
        className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedPalette}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-48 bg-white rounded-md shadow-lg border">
          <div className="max-h-64 overflow-y-auto">
            {palettes.map((palette) => (
              <button
                key={palette.name}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => handleSelect(palette)}
              >
                <span>{palette.name}</span>
                <div className="ml-auto flex">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded-sm border border-gray-200"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PaletteSelector
