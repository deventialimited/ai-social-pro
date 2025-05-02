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

  // Calculate initial zoom based on screen size
  useEffect(() => {
    const calculateInitialZoom = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth >= 1920) {
        setZoom(130);
      } else if (screenWidth >= 1440) {
        setZoom(120);
      } else if (screenWidth >= 1024) {
        setZoom(110);
      } else {
        setZoom(100);
      }
    };

    calculateInitialZoom();
    window.addEventListener('resize', calculateInitialZoom);
    return () => window.removeEventListener('resize', calculateInitialZoom);
  }, []);

  const increaseZoom = () => {
    setZoom((prev) => Math.min(prev + 10, 150));
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
        position: "relative",
      }}
    >
      {/* Canvas controls */}
      <div className=" fixed top-32 right-4 float-right z-10 flex flex-col gap-1 ml-auto mr-4">
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
      <div className="flex items-center justify-center h-full w-full p-4">
        {/* Zoom container */}
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center",
            transition: "transform 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Canvas */}
          <div
            ref={canvasContainerRef}
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
