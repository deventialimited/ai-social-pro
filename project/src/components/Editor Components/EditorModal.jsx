import { Fragment, useState } from "react";
import { ImageIcon, ChevronDown, Save } from "lucide-react";
import EditorSidebar from "./sidebar/EditorSidebar";
import EditorToolbar from "./toolbar/EditorToolbar";
import EditorCanvas from "./canvas/EditorCanvas";
import { Dialog, Transition } from "@headlessui/react";
import { EditorProvider } from "./EditorStoreHooks/FullEditorHooks";

function EditorModal({ onClose, isEditorOpen }) {
  const [activeTab, setActiveTab] = useState("text");
  const [specialActiveTab, setSpecialActiveTab] = useState(null);
  const [activeElement, setActiveElement] = useState("canvas"); // Default to canvas toolbar
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
  });

  // Function to handle element selection in the canvas
  const handleElementSelect = (elementType) => {
    setActiveElement(elementType);
  };

  return (
    <EditorProvider>
      <Transition appear show={isEditorOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[99999999]"
          onClose={() => console.log("hii")}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-6xl flex flex-col transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      <span className="font-medium">Image Post Editor</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={onClose}
                        className="px-4 py-1.5 border rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>

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
                  <div className="flex flex-1 ">
                    {/* Sidebar */}
                    <EditorSidebar
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      specialActiveTab={specialActiveTab}
                      setSpecialActiveTab={setSpecialActiveTab}
                    />

                    {/* Editor Area */}
                    <div className="flex-1 flex flex-col overflow-auto">
                      <EditorToolbar
                        activeElement={activeElement}
                        specialActiveTab={specialActiveTab}
                        setSpecialActiveTab={setSpecialActiveTab}
                      />
                      <EditorCanvas
                        content={canvasContent}
                        onElementSelect={handleElementSelect}
                      />
                    </div>
                  </div>

                  {/* Element type selector for demo purposes */}
                  <div className="fixed bottom-4 right-4 bg-white p-2 rounded-md shadow-lg border">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium">
                        Demo: Select Element Type
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveElement("canvas")}
                          className={`px-3 py-1 rounded-md ${
                            activeElement === "canvas"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200"
                          }`}
                        >
                          Canvas
                        </button>
                        <button
                          onClick={() => setActiveElement("text")}
                          className={`px-3 py-1 rounded-md ${
                            activeElement === "text"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200"
                          }`}
                        >
                          Text
                        </button>
                        <button
                          onClick={() => setActiveElement("image")}
                          className={`px-3 py-1 rounded-md ${
                            activeElement === "image"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200"
                          }`}
                        >
                          Image
                        </button>
                        <button
                          onClick={() => setActiveElement("shape")}
                          className={`px-3 py-1 rounded-md ${
                            activeElement === "shape"
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200"
                          }`}
                        >
                          Shape
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </EditorProvider>
  );
}

export default EditorModal;
