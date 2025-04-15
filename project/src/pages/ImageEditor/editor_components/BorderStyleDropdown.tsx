// @ts-nocheck


import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import ColorPicker from '../../../components/ColorPicker'

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
    if (selectedShapeId && updateShape) {
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
        <div className="w-6 h-6" style={{ borderStyle: borderStyle || "solid", borderWidth, borderColor, backgroundColor: borderColor }} />
        <span className="text-sm text-gray-600">Border</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Style</div>
              <div className="grid grid-cols-5 gap-2">
                {borderStyles.map((style) => (
                  <button
                    key={style.value}
                    className={`p-2 h-10 border rounded-md ${
                      currentBorderStyle === style.value ? "border-blue-500" : "border-gray-300"
                    } hover:bg-gray-50 flex items-center justify-center`}
                    onClick={() => handleBorderStyleChange(style.value)}
                  >
                    {style.value === "none" && (
                      <div className="relative w-6 h-6 flex items-center justify-center">
                        <div className="w-6 h-6 border border-gray-400 rounded-md"></div>
                        <div className="absolute w-8 h-0.5 bg-gray-400 transform rotate-45"></div>
                      </div>
                    )}
                    {style.value === "solid" && (
                      <div className="w-10 h-0.5 bg-gray-800"></div>
                    )}
                    {style.value === "dashed" && (
                      <div className="w-10 flex justify-between">
                        <div className="w-2 h-0.5 bg-gray-800"></div>
                        <div className="w-2 h-0.5 bg-gray-800"></div>
                        <div className="w-2 h-0.5 bg-gray-800"></div>
                      </div>
                    )}
                    {style.value === "dotted" && (
                      <div className="w-10 flex justify-between">
                        <div className="w-0.5 h-0.5 rounded-full bg-gray-800"></div>
                        <div className="w-0.5 h-0.5 rounded-full bg-gray-800"></div>
                        <div className="w-0.5 h-0.5 rounded-full bg-gray-800"></div>
                        <div className="w-0.5 h-0.5 rounded-full bg-gray-800"></div>
                        <div className="w-0.5 h-0.5 rounded-full bg-gray-800"></div>
                      </div>
                    )}
                    {style.value === "double" && (
                      <div className="w-10 flex flex-col space-y-1">
                        <div className="w-full h-0.5 bg-gray-800"></div>
                        <div className="w-full h-0.5 bg-gray-800"></div>
                      </div>
                    )}
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
              <ColorPicker
                color={currentBorderColor}
                onChange={handleBorderColorChange}
                label="Border Color"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BorderStyleDropdown