import { useEffect, useState } from "react";
import {
  RotateCcw,
  RotateCw,
  Upload,
  Crop,
  ImageIcon,
  Lock,
  Copy,
  Trash,
  Sparkles,
} from "lucide-react";
import FlipPopup from "../../common/popups/FlipPopup";
import PositionPopup from "../../common/popups/PositionPopup";
import TransparencyPopup from "../../common/popups/TransparencyPopup";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import { v4 as uuidv4 } from "uuid";

function ImageToolbar({
  specialActiveTab,
  setSpecialActiveTab,
  selectedElementId,
  setSelectedElementId,
  setActiveElement,
}) {
  const [transparency, setTransparency] = useState(100);
  const { updateElement, addElement, removeElement, elements, canvas } =
    useEditor();
  const [selectedElement, setSelectedElement] = useState(null);
  const handleFlip = (direction) => {
    console.log("Flip direction:", direction);
  };
  useEffect(() => {
    if (selectedElementId) {
      const selectedElement = elements.find(
        (el) => el.id === selectedElementId
      );
      setSelectedElement(selectedElement);
    }
  }, [elements, selectedElementId]);
  const handleTransparencyChange = (value) => {
    setTransparency(value);
  };
  const handlePositionChange = (action) => {
    if (!selectedElement || selectedElement.locked) return;
    const updatedPosition = { ...selectedElement.position };

    switch (action) {
      case "left":
        updateElement(selectedElement?.id, {
          styles: {
            ...selectedElement.styles,
            position: "absolute",
            left: 0,
            top: updatedPosition?.y,
            bottom: null,
            right: null,
          },
        });
        break;
      case "top":
        updateElement(selectedElement?.id, {
          styles: {
            ...selectedElement.styles,
            position: "absolute",
            top: 0,
            left: updatedPosition?.x,
            bottom: null,
            right: null,
          },
        });
        break;
      case "center":
        updateElement(selectedElement?.id, {
          styles: {
            ...selectedElement.styles,
            position: "absolute",
            left:
              Math.max(Math.min(canvas.width / 3, 600)) -
              selectedElement?.styles?.width, // Centers on X-axis
            top:
              selectedElement?.styles?.top ||
              Math.max(Math.min(canvas.height / 3, 600)) -
                selectedElement?.styles?.height, // Maintains top if available or centers vertically
            bottom: null,
            right: null,
          },
        });
        break;

      case "middle":
        updateElement(selectedElement?.id, {
          styles: {
            ...selectedElement.styles,
            position: "absolute",
            left:
              selectedElement?.left ||
              Math.max(Math.min(canvas.width / 3, 600)) -
                selectedElement?.styles?.width, // Maintains left if available or centers horizontally
            top: Math.max(Math.min(canvas.height / 3, 600)) / 3,
            bottom: null,
            right: null,
          },
        });
        break;

        break;
      case "right":
        updateElement(selectedElement?.id, {
          styles: {
            ...selectedElement.styles,
            position: "absolute",
            right: 0,
            top: updatedPosition?.y,
            left: null,
          },
        });
        break;
      case "bottom":
        updateElement(selectedElement?.id, {
          styles: {
            ...selectedElement.styles,
            position: "absolute",
            bottom: 0,
            left: updatedPosition?.x,
            top: null,
            right: null,
          },
        });
        break;
      default:
        break;
    }
  };

  // This should handle TEXT ALIGNMENT (not to be confused with element positioning)
  const handleLayerPositionChange = (action) => {
    if (!selectedElement || selectedElement.locked) return;

    // Get the current z-index of the selected element
    const currentZIndex = selectedElement.styles.zIndex;

    // Sort the elements by their z-index in ascending order
    const sortedElements = [...elements].sort(
      (a, b) => a.styles.zIndex - b.styles.zIndex
    );

    let newZIndex;
    switch (action) {
      case "up":
        // Move the selected element one step up
        const indexUp = sortedElements.findIndex(
          (e) => e.id === selectedElement.id
        );
        if (indexUp < sortedElements.length - 1) {
          newZIndex = sortedElements[indexUp + 1].styles.zIndex + 1;
        } else {
          newZIndex = selectedElement?.styles?.zIndex;
        }
        break;
      case "down":
        // Move the selected element one step down
        const indexDown = sortedElements.findIndex(
          (e) => e.id === selectedElement.id
        );
        if (indexDown > 0) {
          newZIndex = sortedElements[indexDown - 1].styles.zIndex - 1;
        }
        break;
      case "toFront":
        // Bring the selected element to the front
        newZIndex = Math.max(...sortedElements.map((e) => e.styles.zIndex)) + 1;
        break;
      case "toBack":
        // Send the selected element to the back
        newZIndex = Math.min(...sortedElements.map((e) => e.styles.zIndex)) - 1;
        break;
      default:
        return;
    }
    // Update the selected element with the new z-index
    updateElement(selectedElement.id, {
      styles: {
        ...selectedElement.styles,
        zIndex: newZIndex,
      },
    });

    // Optionally, you may want to update the positions of other elements as well
    // You can loop through `sortedElements` and update their z-indexes if needed
    // If you want to maintain their relative stacking, you can skip updating those
    // that don't need to be changed.
  };
  const handleLockToggle = () => {
    if (!selectedElement) return;

    // Toggle the locked state of the selected element
    updateElement(selectedElement.id, {
      styles: { ...selectedElement.styles }, // Keep the existing styles
      locked: !selectedElement.locked, // Toggle locked state
    });

    // Optionally, you can change the lock button's appearance depending on the lock state
    // Example: Change color or icon based on whether it's locked
  };
  const handleCopy = () => {
    if (!selectedElement) return;

    // Create a copy of the selected element with a new unique ID
    const copiedElement = {
      ...selectedElement, // Copy all properties of the selected element
      id: `image-${uuidv4()}`, // Generate a new unique ID for the copy
      styles: {
        ...selectedElement.styles, // Keep the same styles (position, size, etc.)
      },
    };

    addElement(copiedElement);
  };
  const handleDelete = () => {
    if (!selectedElement) return;

    removeElement(selectedElement.id);
    setSelectedElement(null); // Optional: Clear selection after deletion
    setSelectedElementId(null);
    setActiveElement("canvas");
  };
  return (
    <>
      <div className="flex items-center flex-wrap gap-2">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <RotateCcw className="h-5 w-5 text-gray-600" />
        </button>

        <button className="p-2 rounded-md hover:bg-gray-100">
          <RotateCw className="h-5 w-5 text-gray-600" />
        </button>

        <FlipPopup onFlip={handleFlip} />

        <button
          className={`flex items-center gap-1 px-3 py-2 rounded-md ${
            specialActiveTab === "image-effects"
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100"
          }`}
          onClick={() => {
            specialActiveTab === "image-effects"
              ? setSpecialActiveTab(null)
              : setSpecialActiveTab("image-effects");
          }}
        >
          <Sparkles className="h-5 w-5" />
          <span className="w-max">Effects</span>
        </button>

        <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100">
          <span className="w-max">Fit to page</span>
        </button>

        <button
          className={`flex items-center gap-1 px-3 py-2 rounded-md ${
            specialActiveTab === "apply-mask"
              ? "bg-blue-100 text-blue-600"
              : "hover:bg-gray-100"
          }`}
          onClick={() => {
            specialActiveTab === "apply-mask"
              ? setSpecialActiveTab(null)
              : setSpecialActiveTab("apply-mask");
          }}
        >
          <span className="w-max">Apply mask</span>
        </button>

        <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border">
          <Crop className="h-5 w-5 text-gray-600" />
          <span className="w-max">Crop</span>
        </button>

        <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border">
          <Upload className="h-5 w-5 text-gray-600" />
          <span className="w-max">Upload</span>
        </button>

        <button className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-400 border cursor-not-allowed">
          <ImageIcon className="h-5 w-5" />
          <span className="w-max">Change Image</span>
        </button>

        {/* <PositionPopup
          onLayerPositionChange={handleLayerPositionChange} // For element positioning
          onPositionChange={handlePositionChange} // For text alignment
        /> */}

        <TransparencyPopup
          transparency={transparency}
          onChange={handleTransparencyChange}
        />

        <button
          onClick={handleLockToggle}
          className={`p-2 rounded-md hover:bg-gray-100 ${
            selectedElement?.locked ? "bg-gray-300" : null
          }`}
        >
          <Lock className="h-5 w-5 text-gray-600" />
        </button>

        <button
          onClick={handleCopy}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Copy className="h-5 w-5 text-gray-600" />
        </button>

        <button
          onClick={handleDelete}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Trash className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </>
  );
}

export default ImageToolbar;
