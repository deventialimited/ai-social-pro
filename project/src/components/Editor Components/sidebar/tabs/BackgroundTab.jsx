import { Search } from "lucide-react"

function BackgroundTab() {
  const colors = [
    "#87CEEB", // Light blue
    "#FFFFFF", // White
    "#4169E1", // Royal blue
    "#FFA500", // Orange
    "#90EE90", // Light green
    "#FFD700", // Gold
    "#DA70D6", // Orchid
    "#DCDCDC", // Light gray
  ]

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {colors.map((color, index) => (
          <button
            key={index}
            className="w-8 h-8 rounded-md border border-gray-200 hover:opacity-80"
            style={{ backgroundColor: color }}
          ></button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input type="text" placeholder="Search..." className="w-full pl-9 pr-3 py-2 border rounded-md text-sm" />
      </div>

      <div className="mb-4">
        <p className="text-sm mb-2">Photos by Unsplash</p>
        <div className="grid grid-cols-2 gap-2">
          {/* Gradient backgrounds */}
          <div className="aspect-video rounded-md overflow-hidden bg-gradient-to-br from-pink-400 via-purple-400 to-blue-500"></div>
          <div className="aspect-video rounded-md overflow-hidden bg-gradient-to-br from-teal-200 via-green-300 to-yellow-300"></div>
          <div className="aspect-video rounded-md overflow-hidden bg-gradient-to-br from-blue-100 via-white to-orange-300"></div>
          <div className="aspect-video rounded-md overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-green-500"></div>
          <div className="aspect-video rounded-md overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500"></div>
          <div className="aspect-video rounded-md overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-gray-900"></div>
        </div>
      </div>
    </div>
  )
}

export default BackgroundTab
