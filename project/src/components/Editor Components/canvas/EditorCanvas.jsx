import { useRef, useState } from "react";
import { Copy, ChevronUp, ChevronDown, Trash, Minus, Plus } from "lucide-react";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import CanvasElement from "./CanvasElement";

function EditorCanvas({ content, onElementSelect,selectedElementId, setSelectedElementId }) {
  const [zoom, setZoom] = useState(32);
  const { canvas, elements } = useEditor();
  const [showSelectorOverlay, setShowSelectorOverlay] = useState(true);
  const increaseZoom = () => {
    setZoom((prev) => Math.min(prev + 10, 100));
  };

  const decreaseZoom = () => {
    setZoom((prev) => Math.max(prev - 10, 10));
  };

  const handleSelectElement = (id, type) => {
    setSelectedElementId(id);
    onElementSelect(type);
  };
  // Handle canvas click (background)
  const handleCanvasClick = (e) => {
    // Only select canvas if clicking directly on the canvas background
    if (e.target === e.currentTarget) {
      if (onElementSelect) {
        onElementSelect("canvas");
        setSelectedElementId(null);
        setShowSelectorOverlay(true);
      }
    }
  };
  return (
    <div className="flex-1 bg-gray-200 flex flex-col items-center justify-start p-4 relative">
      {/* Canvas controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-1">
        <button className="p-1 bg-white rounded-md shadow hover:bg-gray-50">
          <Copy className="h-4 w-4" />
        </button>
        <button className="p-1 bg-white rounded-md shadow hover:bg-gray-50">
          <ChevronUp className="h-4 w-4" />
        </button>
        <button className="p-1 bg-white rounded-md shadow hover:bg-gray-50">
          <ChevronDown className="h-4 w-4" />
        </button>
        <button className="p-1 bg-white rounded-md shadow hover:bg-gray-50">
          <Trash className="h-4 w-4" />
        </button>
      </div>

      {/* Canvas */}
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        style={{
          width: `${Math.max(Math.min(canvas.width / 3, 600))}px`,
          height: `${Math.max(Math.min(canvas.height / 3, 600))}px`,
          ...canvas.styles,
        }}
        onClick={handleCanvasClick}
      >
        {/* Canvas content */}
        {elements?.map((el) => (
          <CanvasElement
            key={el.id}
            element={el}
            onSelect={handleSelectElement}
            isSelected={el.id === selectedElementId}
            showSelectorOverlay={showSelectorOverlay}
            setShowSelectorOverlay={setShowSelectorOverlay}
          />
        ))}
      </div>

      {/* Zoom controls */}
      <div className="mt-4 flex items-center gap-2 bg-white rounded-full shadow px-2">
        <button
          onClick={decreaseZoom}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Minus className="h-4 w-4" />
        </button>

        <span className="w-12 text-center">{zoom}%</span>

        <button
          onClick={increaseZoom}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default EditorCanvas;
