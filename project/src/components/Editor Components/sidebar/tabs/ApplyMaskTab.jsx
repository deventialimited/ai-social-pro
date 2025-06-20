"use client";

import { X, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import MaskPreview from "./MaskPreview";
import { hardCodedShapes } from "../hooks/ShapesHooks";
import { v4 as uuidv4 } from "uuid";

function ApplyMaskTab({ onClose, selectedElementId }) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const { updateElement, elements, addFile } = useEditor();
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    if (selectedElementId) {
      const element = elements.find((el) => el.id === selectedElementId);
      setSelectedElement(element);

      // Store the original image when first selecting an element
      if (element && !originalImage) {
        const img = new Image();
        img.src = element.props.originalSrc;
        img.crossOrigin = "anonymous"; // Add this to avoid CORS issues
        img.onload = () => {
          setOriginalImage(img);
        };
      }
    }
  }, [elements, selectedElementId]);

  // Filter shapes based on search query
  const filteredShapes = searchQuery
    ? hardCodedShapes.filter((shape) =>
        shape.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : hardCodedShapes;

  // Function to apply mask to the selected element
  const applyMask = (shapeId) => {
    if (!selectedElement || selectedElement.locked) return;
    updateElement(selectedElementId, {
      props: {
        ...selectedElement.props,
        mask: shapeId,
      },
    });
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Mask image</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search masks..."
          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 pb-10 gap-4">
        {filteredShapes.map((shape) => (
          <div
            key={shape.id}
            className="aspect-square rounded-md hover:bg-gray-200 cursor-pointer flex flex-col items-center justify-center p-2"
            onClick={() => applyMask(shape.id)}
          >
            <MaskPreview maskId={shape.id} size={60} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApplyMaskTab;
