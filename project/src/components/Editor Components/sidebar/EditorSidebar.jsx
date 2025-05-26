import {
  Type,
  ImageIcon,
  Shapes,
  Palette,
  Layers,
  LayoutGrid,
  Move3D,     
  Volume2,   
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
import AudiosTab from "./tabs/video/AudiosTab";
import AnimationsTab from "./tabs/video/AnimationsTab";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
const tabs = [
  { id: "text", icon: Type, label: "Text", component: TextTab },
  { id: "images", icon: ImageIcon, label: "Images", component: ImagesTab },
  { id: "music", icon:Volume2, label: "music", component: AudiosTab },

  { id: "elements", icon: Shapes, label: "Elements", component: ElementsTab },
  {
    id: "background",
    icon: Palette,
    label: "Background",
    component: BackgroundTab,
  },
  { id: "layers", icon: Layers, label: "Layers", component: LayersTab },
  { id: "size", icon: LayoutGrid, label: "Size", component: SizeTab },
  { id: "animation", icon: Move3D, label: "animatiosn", component: AnimationsTab },

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
  const { mode } = useEditor();
  const visibleTabs = tabs.filter((tab) => {
    if ((tab.id === "music" || tab.id === "animation") && mode !== "video") {
      return false;
    }
    return true;
  });
  return (
    <div className=" border-r h-full flex">
      {/* Tab buttons */}
      <div className="w-[96px] border-r bg-gray-50">
        {visibleTabs.map((tab) => (
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
