import { Upload, Search } from "lucide-react"

function ImagesTab() {
  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <button className="flex items-center gap-1 px-3 py-2 border rounded-md hover:bg-gray-50 text-sm">
          <Upload className="h-4 w-4" />
          <span>Upload</span>
        </button>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search Stock" className="w-full pl-9 pr-3 py-2 border rounded-md text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Sample images */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="aspect-square bg-gray-200 rounded-md overflow-hidden hover:opacity-80 cursor-pointer"
          >
            <img
              src={`/placeholder.svg?height=100&width=100&text=Image ${item}`}
              alt={`Sample ${item}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImagesTab
