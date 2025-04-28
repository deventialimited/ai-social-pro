import { useEffect, useRef, useState } from "react";
import { Copy, ChevronUp, ChevronDown, Trash, Minus, Plus } from "lucide-react";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import CanvasElement from "./CanvasElement";

function EditorCanvas({
  canvasContainerRef,
  content,
  onElementSelect,
  selectedElementId,
  setSelectedElementId,
  setSpecialActiveTab,
  specialActiveTab,
}) {
  const [zoom, setZoom] = useState(100);
  const { canvas, elements, allFiles } = useEditor();
  const [showSelectorOverlay, setShowSelectorOverlay] = useState(true);
  const containerRef = useRef(null);

  const increaseZoom = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const decreaseZoom = () => {
    setZoom((prev) => Math.max(prev - 10, 30));
  };

  const handleSelectElement = (id, type) => {
    setSelectedElementId(id);
    onElementSelect(type);
  };

  useEffect(() => {
    if (specialActiveTab) {
      setSpecialActiveTab(null);
    }
  }, [selectedElementId]);

  // Apply zoom effect to the canvas container
  useEffect(() => {
    if (canvasContainerRef.current) {
      canvasContainerRef.current.style.transform = `scale(${zoom / 100})`;
    }
  }, [zoom]);

  // Handle canvas click (background)
  const handleCanvasClick = (e) => {
    // Only select canvas if clicking directly on the canvas background
    if (e.target === e.currentTarget) {
      if (onElementSelect) {
        onElementSelect("canvas");
        setSelectedElementId(null);
        setShowSelectorOverlay(true);
        setSpecialActiveTab(null);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-200 overflow-auto h-full"
      style={{
        minHeight: "100%",
        minWidth: "100%",
        position: "relative",
      }}
    >
      {/* Canvas controls */}
      <div className="sticky top-4 right-4 float-right z-10 flex flex-col gap-1 ml-auto mr-4">
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

      {/* Canvas container with centering and extra space for scrolling */}
      <div
        className="flex items-center justify-center min-h-full min-w-full p-8"
        style={{ paddingBottom: "200px", paddingTop: "100px" }} // Ensure enough space at the bottom for scrolling
      >
        {/* Zoom container */}
        <div
          ref={canvasContainerRef}
          className="transform-gpu"
          style={{
            transformOrigin: "center",
            transition: "transform 0.2s ease-out",
          }}
        >
          {/* Canvas */}
          <div
            id="#canvas"
            className="bg-white shadow-lg overflow-hidden relative"
            style={{
              width: `${Math.max(Math.min(canvas.width / 3, 600))}px`,
              height: `${Math.max(Math.min(canvas.height / 3, 600))}px`,
              overflow: "hidden",
              position: "relative",
              ...canvas.styles,
            }}
            onClick={handleCanvasClick}
          >
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
        </div>
      </div>

      {/* Spacer div to ensure scrollability */}
      <div style={{ height: "100px" }}></div>

      {/* Zoom controls - fixed at bottom right */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-white rounded-full shadow px-2 z-50">
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
