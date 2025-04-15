import { RotateCcw, RotateCw, Clock, ChevronDown, Upload, Move } from "lucide-react"

function EditorToolbar() {
  return (
    <div className="p-2 border-b flex items-center gap-2">
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <RotateCcw className="h-5 w-5" />
        </button>

        <button className="p-2 rounded-md hover:bg-gray-100">
          <RotateCw className="h-5 w-5" />
        </button>

        <button className="flex items-center gap-1 p-2 rounded-md hover:bg-gray-100">
          <Clock className="h-5 w-5" />
          <span>5s</span>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100">
          <span>Palette</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button className="flex items-center gap-1 px-3 py-2 rounded-md bg-blue-100 text-blue-600">
          <div className="w-4 h-4 bg-blue-400 rounded-sm"></div>
          <span>Background Color</span>
        </button>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100">
          <Upload className="h-5 w-5" />
          <span>Upload</span>
        </button>

        <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100">
          <Move className="h-5 w-5" />
          <span>Position</span>
        </button>
      </div>
    </div>
  )
}

export default EditorToolbar
