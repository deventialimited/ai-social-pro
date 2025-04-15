import { X, Search } from "lucide-react"
import { useState } from "react"

function ApplyMaskTab({ onClose }) {
  const [searchQuery, setSearchQuery] = useState("")

  const masks = [
    { id: "square", label: "Square" },
    { id: "circle", label: "Circle" },
    { id: "star", label: "Star" },
    { id: "triangle", label: "Triangle" },
    { id: "triangle-bottom-left", label: "Triangle Bottom Left" },
    { id: "diamond", label: "Diamond" },
    { id: "pentagon", label: "Pentagon" },
    { id: "hexagon", label: "Hexagon" },
    { id: "speech-bubble", label: "Speech Bubble" },
    { id: "cross", label: "Cross" },
    { id: "oval", label: "Oval" },
    { id: "cloud", label: "Cloud" },
    { id: "arrow-left", label: "Arrow Left" },
    { id: "arrow-right", label: "Arrow Right" },
    { id: "arrow-down", label: "Arrow Down" },
    { id: "arrow-up", label: "Arrow Up" },
    { id: "flower", label: "Flower" },
    { id: "asterisk", label: "Asterisk" },
    { id: "flag", label: "Flag" },
    { id: "half-circle", label: "Half Circle" },
    { id: "cylinder", label: "Cylinder" },
    { id: "diamond-alt", label: "Diamond Alt" },
    { id: "rounded-rectangle", label: "Rounded Rectangle" },
    { id: "teardrop", label: "Teardrop" },
    { id: "droplet", label: "Droplet" },
    { id: "burst", label: "Burst" },
    { id: "wave", label: "Wave" },
    { id: "flower-alt", label: "Flower Alt" },
  ]

  const filteredMasks = searchQuery
    ? masks.filter((mask) => mask.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : masks

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Mask image</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search masks..."
          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {filteredMasks.map((mask) => (
          <div
            key={mask.id}
            className="aspect-square bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer flex items-center justify-center"
          >
            <div className={`w-3/4 h-3/4 bg-gray-400 clip-path-${mask.id}`}></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApplyMaskTab
