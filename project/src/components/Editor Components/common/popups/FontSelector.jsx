

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Search } from "lucide-react"

function FontSelector({ font = "Poppins", onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFont, setSelectedFont] = useState(font)
  const selectorRef = useRef(null)

  const fonts = [
    "Poiret One",
    "Poller One",
    "Poltawski Nowy",
    "Poly",
    "Pompiere",
    "Pontano Sans",
    "Poor Story",
    "Poppins",
    "Playfair Display",
    "Roboto",
    "Montserrat",
    "Open Sans",
    "Lato",
    "Raleway",
    "Oswald",
    "Source Sans Pro",
    "Slabo 27px",
    "Merriweather",
  ]

  const filteredFonts = searchQuery ? fonts.filter((f) => f.toLowerCase().includes(searchQuery.toLowerCase())) : fonts

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

  const handleFontSelect = (font) => {
    setSelectedFont(font)
    setIsOpen(false)
    if (onChange) {
      onChange(font)
    }
  }

  return (
    <div className="overflow-hidden" ref={selectorRef}>
      <button
        className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border min-w-[150px] justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedFont}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white rounded-md shadow-lg border">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search fonts..."
                className="w-full pl-8 pr-3 py-2 border rounded-md text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredFonts.map((font) => (
              <button
                key={font}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${selectedFont === font ? "bg-purple-50" : ""}`}
                onClick={() => handleFontSelect(font)}
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FontSelector
