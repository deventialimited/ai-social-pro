
import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

function ColorPicker({ color = "#000000", onChange, label = "Color", showPalette = true }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentColor, setCurrentColor] = useState(color)
  const [opacity, setOpacity] = useState(100)
  const [hexValue, setHexValue] = useState(color.replace("#", ""))
  const pickerRef = useRef(null)

  useEffect(() => {
    setCurrentColor(color)
    setHexValue(color.replace("#", ""))
  }, [color])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleColorChange = (newColor) => {
    setCurrentColor(newColor)
    setHexValue(newColor.replace("#", ""))
    if (onChange) {
      onChange(newColor, opacity)
    }
  }

  const handleOpacityChange = (newOpacity) => {
    setOpacity(newOpacity)
    if (onChange) {
      onChange(currentColor, newOpacity)
    }
  }

  const handleHexChange = (e) => {
    const value = e.target.value
    setHexValue(value)
    if (value.length === 6) {
      const newColor = `#${value}`
      setCurrentColor(newColor)
      if (onChange) {
        onChange(newColor, opacity)
      }
    }
  }

  const paletteColors = [
    "#87CEEB",
    "#000000",
    "#FFFFFF",
    "#808080",
    "#000000",
    "#8A2BE2",
    "#FFFFFF",
    "#808080",
    "#4B0082",
    "#FF6B81",
    "#FFFFFF",
    "#808080",
    "#0000CD",
    "#87CEFA",
    "#FFFFFF",
    "#808080",
    "#E6E6FA",
    "#1C1C1C",
    "#FFFFFF",
    "#808080",
    "#FF7F50",
    "#FFFFFF",
    "#191970",
    "#808080",
    "#E9967A",
    "#E0E0E0",
    "#2F4F4F",
    "#808080",
    "#40E0D0",
    "#FFFFFF",
    "#0066CC",
    "#808080",
  ]

  return (
    <div className="overflow-hidden" ref={pickerRef}>
      <button
        className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-5 h-5 rounded-sm" style={{ backgroundColor: currentColor }}></div>
        <span className="w-max">{label}</span>
        {showPalette && <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-72 bg-white rounded-md shadow-lg border p-4">
          {/* Color gradient picker */}
          <div className="mb-4">
            <div
              className="w-full h-40 rounded-md mb-2 cursor-pointer"
              style={{
                background:
                  "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                backgroundImage:
                  "linear-gradient(to top, #000 0%, rgba(255,255,255,0) 100%), linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
              }}
            ></div>

            {/* Color slider */}
            <div className="flex items-center mb-2">
              <input
                type="range"
                min="0"
                max="360"
                className="w-full"
                style={{
                  background:
                    "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                }}
              />
              <div className="w-8 h-8 ml-2 rounded-sm" style={{ backgroundColor: currentColor }}></div>
            </div>

            {/* Opacity slider */}
            <div className="flex items-center mb-4">
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="w-full"
                style={{
                  background: "linear-gradient(to right, transparent 0%, currentColor 100%)",
                }}
              />
              <div className="w-8 h-8 ml-2 rounded-sm" style={{ backgroundColor: "black" }}></div>
            </div>

            {/* Hex input */}
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-md">
                <button className="px-2 py-1 border-r">HEX</button>
                <div className="flex items-center px-2">
                  <span className="text-gray-500">#</span>
                  <input
                    type="text"
                    value={hexValue}
                    onChange={handleHexChange}
                    className="w-24 p-1 outline-none"
                    maxLength={6}
                  />
                </div>
              </div>
              <input
                type="number"
                value={opacity}
                onChange={(e) => handleOpacityChange(Number(e.target.value))}
                className="w-16 p-1 border rounded-md"
                min="0"
                max="100"
              />
              <span>%</span>
            </div>
          </div>

          {showPalette && (
            <>
              <div className="flex items-center mb-2">
                <ChevronDown className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Palette 1</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {paletteColors.slice(0, 9).map((color, index) => (
                  <div
                    key={index}
                    className="w-10 h-10 rounded-md cursor-pointer border border-gray-200"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  ></div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ColorPicker
