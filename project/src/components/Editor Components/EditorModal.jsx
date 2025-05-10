import { Fragment, useState, useRef } from "react";
import { ImageIcon, ChevronDown, Save } from "lucide-react";
import EditorSidebar from "./sidebar/EditorSidebar";
import EditorToolbar from "./toolbar/EditorToolbar";
import EditorCanvas from "./canvas/EditorCanvas";
import { Dialog, Transition } from "@headlessui/react";
import { EditorProvider } from "./EditorStoreHooks/FullEditorHooks";
import TopHeaderBtns from "./common/TopHeaderBtns";
function EditorModal({ post, onClose, isEditorOpen }) {
  const [activeTab, setActiveTab] = useState("text");
  const [specialActiveTab, setSpecialActiveTab] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [activeElement, setActiveElement] = useState("canvas"); // Default to canvas toolbar
  const canvasContainerRef = useRef(null);
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

  //tfdtrdt
  return (
    <EditorProvider>
      <Transition appear show={isEditorOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[9999]"
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
                <Dialog.Panel className="w-full max-w-6xl h-[90vh] flex flex-col transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      <span className="font-medium">Image Post Editor</span>
                    </div>

                    <TopHeaderBtns
                      setActiveElement={setActiveElement}
                      setSelectedElementId={setSelectedElementId}
                      setSpecialActiveTab={setSpecialActiveTab}
                      canvasContainerRef={canvasContainerRef}
                      onClose={onClose}
                      postId={post?._id}
                      postImage={
                        post?.editorStatus === "not_edited" ? post?.image : null
                      }
                      defaultPlatform={post?.platforms?.[0]}
                      postDetails={post}
                    />
                  </div>

                  {/* Main Content */}
                  <div className="flex flex-1 h-full ">
                    {/* Sidebar */}
                    <EditorSidebar
                      activeTab={activeTab}
                      setActiveTab={setActiveTab}
                      specialActiveTab={specialActiveTab}
                      selectedElementId={selectedElementId}
                      setSpecialActiveTab={setSpecialActiveTab}
                    />

                    {/* Editor Area */}
                    <div className="flex-1 flex flex-col">
                      <EditorToolbar
                        activeElement={activeElement}
                        specialActiveTab={specialActiveTab}
                        setSpecialActiveTab={setSpecialActiveTab}
                        selectedElementId={selectedElementId}
                        setSelectedElementId={setSelectedElementId}
                        setActiveElement={setActiveElement}
                      />
                      <EditorCanvas
                        content={canvasContent}
                        canvasContainerRef={canvasContainerRef}
                        selectedElementId={selectedElementId}
                        setSelectedElementId={setSelectedElementId}
                        onElementSelect={handleElementSelect}
                        setSpecialActiveTab={setSpecialActiveTab}
                        specialActiveTab={specialActiveTab}
                      />
                    </div>
                  </div>

                  {/* Element type selector for demo purposes */}
                  {/* <div className="fixed bottom-4 right-4 bg-white p-2 rounded-md shadow-lg border">
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
                  </div> */}
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
