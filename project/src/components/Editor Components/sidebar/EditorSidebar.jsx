import { Type, ImageIcon, Shapes, Palette, Layers, LayoutGrid } from "lucide-react"
import TextTab from "./tabs/TextTab"
import ImagesTab from "./tabs/ImagesTab"
import ElementsTab from "./tabs/ElementsTab"
import BackgroundTab from "./tabs/BackgroundTab"
import LayersTab from "./tabs/LayersTab"
import SizeTab from "./tabs/SizeTab"

const tabs = [
  { id: "text", icon: Type, label: "Text", component: TextTab },
  { id: "images", icon: ImageIcon, label: "Images", component: ImagesTab },
  { id: "elements", icon: Shapes, label: "Elements", component: ElementsTab },
  { id: "background", icon: Palette, label: "Background", component: BackgroundTab },
  { id: "layers", icon: Layers, label: "Layers", component: LayersTab },
  { id: "size", icon: LayoutGrid, label: "Size", component: SizeTab },
]

function EditorSidebar({ activeTab, setActiveTab }) {
  // Get the active component based on the active tab
  const ActiveTabComponent = tabs.find((tab) => tab.id === activeTab)?.component || TextTab

  return (
    <div className="min-w-[240px] w-max border-r flex">
      {/* Tab buttons */}
      <div className="w-[96px] border-r bg-gray-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex flex-col items-center justify-center w-full py-4 text-xs ${
              activeTab === tab.id ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="h-5 w-5 mb-1" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 w-72 overflow-y-auto">
        <ActiveTabComponent />
      </div>
    </div>
  )
}

export default EditorSidebar
