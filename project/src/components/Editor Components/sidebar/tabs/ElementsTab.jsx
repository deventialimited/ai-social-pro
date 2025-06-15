
import { useState } from "react"
import { Search } from "lucide-react"
import { createShapeElement, hardCodedShapes, lineShapes } from "../hooks/ShapesHooks"
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks"

function ElementsTab() {
  const { addElement } = useEditor()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("shapes") // 'shapes' or 'lines'

  const handleAddShape = (shape) => {
    const shapeElement = createShapeElement(shape)
    addElement(shapeElement)
  }

  // Filter shapes based on search query
  const filteredShapes = searchQuery
    ? hardCodedShapes.filter((shape) => shape.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : hardCodedShapes

  // Filter lines based on search query
  const filteredLines = searchQuery
    ? lineShapes.filter((line) => line.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : lineShapes

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tab navigation */}
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "shapes" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("shapes")}
        >
          Shapes
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "lines" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("lines")}
        >
          Lines
        </button>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
        {activeTab === "shapes" ? (
          <>
            <h3 className="text-sm font-medium mb-2">Shapes</h3>
            <div className="grid grid-cols-3 md:gap-2">
              {filteredShapes.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => handleAddShape(shape)}
                  className="aspect-square text-[#D3D3D3] rounded flex items-center justify-center hover:bg-gray-200"
                >
                  <div dangerouslySetInnerHTML={{ __html: shape.svg }} className="w-16 h-16" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
          <div className="overflow-y-auto max-h-20 sm:overflow-visible sm:max-h-none">
            <h3 className="text-sm font-medium mb-2 ">Lines</h3>
            <div className="grid md:grid-cols-2 grid-cols-3 gap-2 ">
            {filteredLines.map((line) => (
                <button
                  key={line.id}
                  onClick={() => handleAddShape(line)}
                  className="h-16 text-[#D3D3D3] rounded flex items-center justify-center hover:bg-gray-200"
                >
                  <div dangerouslySetInnerHTML={{ __html: line.svg }} className="w-full h-6" />
                </button>
              ))}
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ElementsTab
