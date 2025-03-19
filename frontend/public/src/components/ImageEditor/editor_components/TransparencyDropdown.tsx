// @ts-nocheck
import React, { useState, useRef, useEffect } from "react"
import { Droplet } from "lucide-react"

// Utility function to get data from localStorage
const getLocalStorageData = (key: string, defaultValue: any) => {
  const storedValue = localStorage.getItem(key)
  return storedValue ? storedValue : defaultValue
}

interface TransparencyDropdownProps {
  onTransparencyChange?: (transparency: number) => void
  transparency?: number
  selectedShapeId?: string | null
  updateShape?: (id: string, updates: Partial<Shape>) => void
}

const TransparencyDropdown: React.FC<TransparencyDropdownProps> = ({
  onTransparencyChange,
  transparency: propTransparency,
  selectedShapeId,
  updateShape,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [transparency, setTransparency] = useState<number>(() => {
    // Use prop value if provided, otherwise use localStorage or default
    if (propTransparency !== undefined) return propTransparency
    return Number.parseFloat(getLocalStorageData("editor_shapeTransparency", "0"))
  })

  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
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

  // Update state when prop changes
  useEffect(() => {
    if (propTransparency !== undefined) {
      setTransparency(propTransparency)
    }
  }, [propTransparency])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleTransparencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTransparency = Number.parseFloat(e.target.value)
    setTransparency(newTransparency)
    onTransparencyChange?.(newTransparency)
    
    // Update shape if there's a selected shape
    if (selectedShapeId && updateShape) {
      updateShape(selectedShapeId, { transparency: newTransparency })
    }
    
    // Save to localStorage
    localStorage.setItem("editor_shapeTransparency", newTransparency.toString())
  }

  // Calculate the transparency percentage for display
  const transparencyPercentage = Math.round(transparency * 100)

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="p-2 flex rounded-md hover:bg-gray-100 cursor-pointer" 
        title="Transparency" 
        onClick={toggleDropdown}
      >
        <Droplet className="w-5 h-5 text-gray-600" />
        <span className="text-sm text-gray-600 ml-1">Transparency</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-4 w-64">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Transparency</span>
              <div className="w-16 h-8 border border-gray-300 rounded flex items-center justify-center">
                {transparencyPercentage}%
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                className="w-full"
                value={transparency}
                onChange={handleTransparencyChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransparencyDropdown