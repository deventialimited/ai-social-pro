import { Eye, Lock, Trash } from "lucide-react"

function LayersTab() {
  const layers = [
    { id: "content", type: "Text", name: "content", visible: true, locked: false },
    { id: "title", type: "Text", name: "title", visible: true, locked: false },
    { id: "content2", type: "Text", name: "content", visible: true, locked: false },
    { id: "image1", type: "Image", name: "#5_P4inHYBN", visible: true, locked: false },
    { id: "figure1", type: "Figure", name: "#rYS13elJsf", visible: true, locked: false },
  ]

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-2">Elements on your active page:</h3>

      <div className="space-y-2">
        {layers.map((layer) => (
          <div key={layer.id} className="flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50">
            <div className="flex items-center gap-1 w-8">
              <span className="text-gray-500 text-lg">≡</span>
            </div>

            <div className="w-16 text-xs text-gray-500">{layer.type}</div>

            <div className="flex-1 truncate text-sm">{layer.name}</div>

            <button className="text-gray-500 hover:text-gray-700">
              <Eye className="h-4 w-4" />
            </button>

            <button className="text-gray-500 hover:text-gray-700">
              <Lock className="h-4 w-4" />
            </button>

            <button className="text-gray-500 hover:text-gray-700">
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LayersTab
