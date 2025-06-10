import { Fragment, useState, useRef, useEffect } from "react";
import { ImageIcon, ChevronDown, Save } from "lucide-react";
import EditorSidebar from "./sidebar/EditorSidebar";
import EditorToolbar from "./toolbar/EditorToolbar";
import EditorCanvas from "./canvas/EditorCanvas";
import { Dialog, Transition } from "@headlessui/react";
import { EditorProvider, useEditor } from "./EditorStoreHooks/FullEditorHooks";
import TopHeaderBtns from "./common/TopHeaderBtns";

function EditorModalContent({ post, selectedType, onClose, isEditorOpen }) {
  const [activeTab, setActiveTab] = useState("text");
  const [specialActiveTab, setSpecialActiveTab] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [activeElement, setActiveElement] = useState("canvas"); // Default to canvas toolbar
  const canvasContainerRef = useRef(null);
  const { postDesignData, undo, redo, canUndo, canRedo } = useEditor();
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

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          if (e.shiftKey && canRedo) {
            redo();
          } else if (canUndo) {
            undo();
          }
        } else if (e.key === "y" && canRedo) {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // Function to handle element selection in the canvas
  const handleElementSelect = (elementType) => {
    setActiveElement(elementType);
  };

  return (
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
                <div className="flex gap-3 md:gap-0 flex-col md:flex-row items-center justify-between px-4 py-2 border-b">
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
                    type={selectedType.replace("Image", "")}
                    postImage={
                      post?.[selectedType]?.editorStatus === "not_edited"
                        ? post?.[selectedType]?.imageUrl
                        : null
                    }
                    defaultPlatform={post?.platforms?.[0]}
                    postDetails={post}
                    isEditingTemplate={!!postDesignData?._id}
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function EditorModal(props) {
  return (
    <EditorProvider>
      <EditorModalContent {...props} />
    </EditorProvider>
  );
}

export default EditorModal;
