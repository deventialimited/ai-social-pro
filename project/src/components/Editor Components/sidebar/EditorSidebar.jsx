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
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

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

  // Mobile bottom sheet state
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState(null);

  // Handler for mobile tab click
  const handleMobileTabClick = (tabId) => {
    setMobileActiveTab(tabId);
    setActiveTab(tabId);
    setSpecialActiveTab(null);
    setMobileSheetOpen(true);
  };

  // Get the component for the mobile active tab
  const MobileActiveTabComponent =
    tabs.find((tab) => tab.id === mobileActiveTab)?.component || TextTab;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex border-r h-full">
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex flex-col items-center justify-center py-2 px-1 text-xs ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-500"
              }`}
              onClick={() => handleMobileTabClick(tab.id)}
            >
              <tab.icon className="h-5 w-5 mb-1" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Bottom Sheet for Tab Content */}
      <Transition appear show={mobileSheetOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-[10000] md:hidden" onClose={() => setMobileSheetOpen(false)}>
          <div className="fixed inset-0 bg-black/30 z-[10000]" aria-hidden="true" onClick={() => setMobileSheetOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 flex justify-center items-end min-h-[30vh] z-[10000]">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-y-full opacity-0"
              enterTo="translate-y-0 opacity-100"
              leave="ease-in duration-200"
              leaveFrom="translate-y-0 opacity-100"
              leaveTo="translate-y-full opacity-0"
            >
              <Dialog.Panel className="w-full max-w-md mx-auto bg-white rounded-t-2xl shadow-xl p-0 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-2 border-b">
                  <span className="font-medium text-base">{tabs.find(tab => tab.id === mobileActiveTab)?.label}</span>
                  <button
                    onClick={() => setMobileSheetOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <span className="sr-only">Close</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  <MobileActiveTabComponent
                    selectedElementId={selectedElementId}
                    onClose={() => setMobileSheetOpen(false)}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default EditorSidebar;
