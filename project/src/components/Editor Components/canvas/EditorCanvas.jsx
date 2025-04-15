import { useState } from "react";
import { Copy, ChevronUp, ChevronDown, Trash, Minus, Plus } from "lucide-react";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";

function EditorCanvas({ content, onElementSelect }) {
  const [zoom, setZoom] = useState(32);
  const { canvas } = useEditor();
  const increaseZoom = () => {
    setZoom((prev) => Math.min(prev + 10, 100));
  };

  const decreaseZoom = () => {
    setZoom((prev) => Math.max(prev - 10, 10));
  };

  // Handle element click to select it
  const handleElementClick = (elementType) => {
    if (onElementSelect) {
      onElementSelect(elementType);
    }
  };

  // Handle canvas click (background)
  const handleCanvasClick = (e) => {
    // Only select canvas if clicking directly on the canvas background
    if (e.target === e.currentTarget) {
      if (onElementSelect) {
        onElementSelect("canvas");
      }
    }
  };
  console.log(canvas);
  return (
    <div className="flex-1 bg-gray-200 flex flex-col items-center justify-center p-4 relative">
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
          backgroundColor: content.backgroundColor,
        }}
        onClick={handleCanvasClick}
      >
        {/* Canvas content */}
        <div className="relative w-full h-full">
          {content.elements.map((element) => {
            if (element.type === "text") {
              return (
                <div
                  key={element.id}
                  className="absolute cursor-pointer hover:outline hover:outline-blue-500 hover:outline-2"
                  style={{
                    top: `${(element.y * zoom) / 100}px`,
                    left: `${(element.x * zoom) / 100}px`,
                    transform: "translate(-50%, -50%)",
                    maxWidth: element.maxWidth
                      ? `${(element.maxWidth * zoom) / 100}px`
                      : "none",
                    fontSize: `${(element.fontSize * zoom) / 100}px`,
                    fontWeight: element.fontWeight || "normal",
                    textAlign: "center",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleElementClick("text");
                  }}
                >
                  {element.content}
                </div>
              );
            }
            return null;
          })}

          {/* Smiley face in top right - this would be a shape element */}
          <div
            className="absolute top-8 right-8 bg-blue-400 text-white p-2 rounded-md text-xl cursor-pointer hover:outline hover:outline-blue-500 hover:outline-2"
            onClick={(e) => {
              e.stopPropagation();
              handleElementClick("shape");
            }}
          >
            :)
          </div>

          {/* Add a sample image element for demo purposes */}
          <div
            className="absolute top-20 left-20 w-16 h-16 bg-gray-300 rounded-md cursor-pointer hover:outline hover:outline-blue-500 hover:outline-2 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              handleElementClick("image");
            }}
          >
            <span className="text-xs">Image</span>
          </div>

          {/* Branding at bottom */}
          <div className="absolute bottom-4 right-4 bg-white rounded-md p-1 shadow-sm text-xs flex items-center">
            <span>Made with</span>
            <span className="font-bold ml-1">Marky™</span>
          </div>
        </div>
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
