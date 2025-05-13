import {
  Type,
  ImageIcon,
  Shapes,
  Palette,
  Layers,
  LayoutGrid,
} from "lucide-react";
import TextTab from "./tabs/TextTab";
import ImagesTab from "./tabs/ImagesTab";
import ElementsTab from "./tabs/ElementsTab";
import BackgroundTab from "./tabs/BackgroundTab";
import LayersTab from "./tabs/LayersTab";
import SizeTab from "./tabs/SizeTab";
import TextEffectsTab from "./tabs/effects/TextEffectsTab";
import ImageEffectsTab from "./tabs/effects/ImageEffectsTab";
import ApplyMaskTab from "./tabs/ApplyMaskTab";
import TemplatesTab from "./tabs/TemplatesTab";

const tabs = [
  { id: "text", icon: Type, label: "Text", component: TextTab },
  { id: "images", icon: ImageIcon, label: "Images", component: ImagesTab },
  { id: "elements", icon: Shapes, label: "Elements", component: ElementsTab },
  {
    id: "background",
    icon: Palette,
    label: "Background",
    component: BackgroundTab,
  },
  { id: "layers", icon: Layers, label: "Layers", component: LayersTab },
  { id: "size", icon: LayoutGrid, label: "Size", component: SizeTab },
  {
    id: "templates",
    icon: ImageIcon,
    label: "Templates",
    component: TemplatesTab,
  },
];

// Special tabs that aren't shown in the sidebar navigation
const specialTabs = {
  "text-effects": {
    component: TextEffectsTab,
  },
  "image-effects": { component: ImageEffectsTab },
  "apply-mask": { component: ApplyMaskTab },
};


function EditorSidebar({
  activeTab,
  setActiveTab,
  specialActiveTab,
  setSpecialActiveTab,
  selectedElementId,
}) {
  // Get the active component based on the active tab
  let ActiveTabComponent;

  if (specialTabs[specialActiveTab]) {
    ActiveTabComponent = specialTabs[specialActiveTab].component;
  } else {
    ActiveTabComponent =
      tabs.find((tab) => tab.id === activeTab)?.component || TextTab;
  }

  return (
    <div className=" border-r h-full flex">
      {/* Tab buttons */}
      <div className="w-[96px] border-r bg-gray-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex flex-col items-center justify-center w-full py-4 text-xs ${
              activeTab === tab.id
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
            onClick={() => {
              setActiveTab(tab.id);
              setSpecialActiveTab(null);
            }}
          >
            <tab.icon className="h-5 w-5 mb-1" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 w-72 h-full">
      <ActiveTabComponent
    selectedElementId={selectedElementId}
    onClose={() => {
      if (specialTabs[specialActiveTab]) {
        setActiveTab("text");
        setSpecialActiveTab(null);
      }
    }}
  />
      </div>
    </div>
  );
}

export default EditorSidebar;
