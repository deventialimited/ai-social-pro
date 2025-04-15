import { Instagram, Facebook, PinIcon as Pinterest } from "lucide-react"

function SizeTab() {
  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-sm mb-1">Width (px)</label>
        <input type="number" value="1080" className="w-full p-2 border rounded-md" />
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-1">Height (px)</label>
        <input type="number" value="1080" className="w-full p-2 border rounded-md" />
      </div>

      <div className="space-y-3">
        <button className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-md">
          <Instagram className="h-5 w-5 text-gray-600" />
          <span className="text-sm">Instagram Post</span>
          <span className="text-xs text-gray-500 ml-auto">(1080×1080)</span>
        </button>

        <button className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-md">
          <Instagram className="h-5 w-5 text-gray-600" />
          <span className="text-sm">Instagram Story</span>
          <span className="text-xs text-gray-500 ml-auto">(1080×1920)</span>
        </button>

        <button className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-md">
          <Instagram className="h-5 w-5 text-gray-600" />
          <span className="text-sm">Instagram Ad</span>
          <span className="text-xs text-gray-500 ml-auto">(1080×1080)</span>
        </button>

        <button className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-md">
          <Facebook className="h-5 w-5 text-gray-600" />
          <span className="text-sm">Facebook Post</span>
          <span className="text-xs text-gray-500 ml-auto">(940×788)</span>
        </button>

        <button className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-md">
          <Facebook className="h-5 w-5 text-gray-600" />
          <span className="text-sm">Facebook Cover</span>
          <span className="text-xs text-gray-500 ml-auto">(851×315)</span>
        </button>

        <button className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-md">
          <Facebook className="h-5 w-5 text-gray-600" />
          <span className="text-sm">Facebook Ad</span>
          <span className="text-xs text-gray-500 ml-auto">(1200×628)</span>
        </button>

        <button className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-md">
          <Pinterest className="h-5 w-5 text-gray-600" />
          <span className="text-sm">Pinterest Post</span>
          <span className="text-xs text-gray-500 ml-auto">(1000×1500)</span>
        </button>
      </div>
    </div>
  )
}

export default SizeTab
