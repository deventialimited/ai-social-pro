import { Search } from "lucide-react"

function ElementsTab() {
  return (
    <div className="p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input type="text" placeholder="Search..." className="w-full pl-9 pr-3 py-2 border rounded-md text-sm" />
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Lines</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-2 bg-gray-300 rounded-md my-3"></div>
          <div className="h-0.5 border border-dashed border-gray-300 my-4"></div>
          <div className="h-0.5 border border-dotted border-gray-300 my-4"></div>

          <div className="h-6 flex items-center">
            <div className="w-full h-0.5 bg-gray-300 relative">
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 border-t-2 border-r-2 border-gray-300 rotate-45"></div>
            </div>
          </div>

          <div className="h-6 flex items-center">
            <div className="w-full h-0.5 bg-gray-300 relative">
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-300"></div>
            </div>
          </div>

          <div className="h-6 flex items-center">
            <div className="w-full h-0.5 bg-gray-300 relative">
              <div className="absolute right-0 w-3 h-3 bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Shapes</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="aspect-square bg-gray-300 rounded-md"></div>
          <div className="aspect-square bg-gray-300 rounded-full"></div>
          <div className="aspect-square bg-gray-300 clip-path-star"></div>
          <div className="aspect-square bg-gray-300 clip-path-triangle"></div>

          <div className="aspect-square bg-gray-300 clip-path-triangle-bottom-left"></div>
          <div className="aspect-square bg-gray-300 clip-path-diamond"></div>
          <div className="aspect-square bg-gray-300 clip-path-pentagon"></div>
          <div className="aspect-square bg-gray-300 clip-path-hexagon"></div>

          <div className="aspect-square bg-gray-300 rounded-lg"></div>
          <div className="aspect-square bg-gray-300 clip-path-cross"></div>
          <div className="aspect-square bg-gray-300 clip-path-egg"></div>
          <div className="aspect-square bg-gray-300 clip-path-cloud"></div>
        </div>
      </div>
    </div>
  )
}

export default ElementsTab
