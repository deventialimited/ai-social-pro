

import { useState, useRef, useEffect } from "react"
import { Clock } from "lucide-react"

function DurationSelector({ duration = 5, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState(duration)
  const selectorRef = useRef(null)

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

  const handleChange = (newValue) => {
    setValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  const handleSubmit = () => {
    if (onChange) {
      onChange(value)
    }
    setIsOpen(false)
  }

  return (
    <div className="overflow-hidden" ref={selectorRef}>
      <button className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-100" onClick={() => setIsOpen(!isOpen)}>
        <Clock className="h-5 w-5 text-gray-600" />
        <span>{value}s</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white rounded-md shadow-lg border p-4">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              min="0"
              max="60"
            />
            <span className="text-lg">s</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DurationSelector
