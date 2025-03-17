"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface BorderStyleDropdownProps {
  onBorderStyleChange?: (style: string) => void
  onBorderWidthChange?: (width: number) => void
  onBorderColorChange?: (color: string) => void
  borderStyle: string
  borderWidth: number
  borderColor: string
  selectedShapeId: string | null
  updateShape: (id: string, updates: Partial<Shape>) => void
}

const borderStyles = [
  { name: "None", value: "none" },
  { name: "Solid", value: "solid" },
  { name: "Dashed", value: "dashed" },
  { name: "Dotted", value: "dotted" },
  { name: "Double", value: "double" },
]

const BorderStyleDropdown = ({
  onBorderStyleChange,
  onBorderWidthChange,
  onBorderColorChange,
  borderStyle,
  borderWidth,
  borderColor,
  selectedShapeId,
  updateShape,
}: BorderStyleDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentBorderStyle, setCurrentBorderStyle] = useState(borderStyle)
  const [currentBorderWidth, setCurrentBorderWidth] = useState(borderWidth)
  const [currentBorderColor, setCurrentBorderColor] = useState(borderColor)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleBorderStyleChange = (style: string) => {
    setCurrentBorderStyle(style)
    onBorderStyleChange?.(style)
    if (selectedShapeId) {
      updateShape(selectedShapeId, { borderStyle: style })
    }
  }

  const handleBorderWidthChange = (width: number) => {
    setCurrentBorderWidth(width)
    onBorderWidthChange?.(width)
    if (selectedShapeId) {
      updateShape(selectedShapeId, { borderWidth: width })
    }
  }

  const handleBorderColorChange = (color: string) => {
    setCurrentBorderColor(color)
    onBorderColorChange?.(color)
    if (selectedShapeId) {
      updateShape(selectedShapeId, { borderColor: color })
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 flex items-center gap-1.5 rounded-md hover:bg-gray-100 cursor-pointer"
        title="Border"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-6 h-6" style={{ borderStyle: borderStyle || "solid", borderWidth, borderColor, backgroundColor: borderColor }} />        <span className="text-sm text-gray-600">Border</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-4 w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Style</div>
              <div className="grid grid-cols-5 gap-2">
                {borderStyles.map((style) => (
                  <button
                    key={style.value}
                    className={`p-2 h-10 border rounded-md ${
                      currentBorderStyle === style.value ? "border-blue-500" : "border-gray-300"
                    } hover:bg-gray-50`}
                    onClick={() => handleBorderStyleChange(style.value)}
                  >
                    <div
                      className="w-full h-0.5 bg-current"
                      style={{
                        borderTopWidth: "2px",
                        borderTopStyle: style.value === "none" ? "solid" : style.value,
                        opacity: style.value === "none" ? 0.2 : 1,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Width</div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={currentBorderWidth}
                  onChange={(e) => handleBorderWidthChange(Number(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={currentBorderWidth}
                  onChange={(e) => handleBorderWidthChange(Number(e.target.value))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Color</div>
              <input
                type="color"
                value={currentBorderColor}
                onChange={(e) => handleBorderColorChange(e.target.value)}
                className="w-full h-10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BorderStyleDropdown