import { useState } from "react"
import { ImageIcon, ChevronDown, Save } from "lucide-react"
import EditorSidebar from "./sidebar/EditorSidebar"
import EditorToolbar from "./toolbar/EditorToolbar"
import EditorCanvas from "./canvas/EditorCanvas"

function EditorModal({ onClose }) {
  const [activeTab, setActiveTab] = useState("text")
  const [canvasContent, setCanvasContent] = useState({
    backgroundColor: "#87CEEB",
    elements: [
      {
        type: "text",
        content: "some",
        fontSize: 48,
        fontWeight: "bold",
        x: 400,
        y: 420,
        id: "title",
      },
      {
        type: "text",
        content:
          "Join us and enjoy a 10% discount on your first seamless tax filing experience. Offer valid for new users only. Simplify your taxes effortlessly with Simpple.tax!",
        fontSize: 16,
        x: 400,
        y: 520,
        maxWidth: 400,
        id: "content",
      },
      {
        type: "text",
        content: "Simpple.tax",
        fontSize: 14,
        x: 1070,
        y: 640,
        id: "branding",
      },
    ],
  })

  return (
    <div className="fixed inset-0 bg-white z-[9999999] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          <span className="font-medium">Image Post Editor</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-1.5 border rounded-md hover:bg-gray-50">Cancel</button>

          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-1.5 border rounded-md hover:bg-gray-50">
              <span>Change to Video</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-md hover:bg-gray-800">
            <Save className="h-4 w-4" />
            <span>Save and Close</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <EditorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          <EditorToolbar />
          <EditorCanvas content={canvasContent} />
        </div>
      </div>
    </div>
  )
}

export default EditorModal
