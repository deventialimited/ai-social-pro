import { useEffect, useState } from "react";
import {
  RotateCcw,
  RotateCw,
  Upload,
  Crop,
  ImageIcon,
  Lock,
  Unlock,
  Copy,
  Trash,
  Sparkles,
} from "lucide-react";
import FlipPopup from "../../common/popups/FlipPopup";
import PositionPopup from "../../common/popups/PositionPopup";
import TransparencyPopup from "../../common/popups/TransparencyPopup";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import { v4 as uuidv4 } from "uuid";
import { createImageElement } from "../../sidebar/hooks/ImagesHooks";
import CropButton from "../../common/popups/CropButton";

function ImageToolbar({
  specialActiveTab,
  setSpecialActiveTab,
  selectedElementId,
  setSelectedElementId,
  setActiveElement,
}) {
  const {
    updateElement,
    addElement,
    removeElement,
    updateCanvasStyles,
    updateBackground,
    elements,
    updateFile,
    addFile,
    allFiles,
    canvas,
    handleLock,
  } = useEditor();
  const [selectedElement, setSelectedElement] = useState(null);
  const handleFlip = (direction) => {
    if (!selectedElement || selectedElement.locked) return;

    let newStyles = { ...selectedElement.styles };
    // Initialize the transform property if not already set
    if (!newStyles.transform) {
      newStyles.transform = "";
    }

    // Check if scaleX or scaleY is already applied
    const scaleXExists = /\s*scaleX\((-?[\d.]+)\)\s*(;)?/.test(
      newStyles.transform
    );

    const scaleYExists = /\s*scaleY\((-?[\d.]+)\)\s*(;)?/.test(
      newStyles.transform
    );
    // Handle horizontal flip (scaleX)
    if (direction === "horizontal") {
      if (scaleXExists) {
        // If scaleX exists, toggle its value
        newStyles.transform = newStyles.transform.replace(
          /scaleX\((-?[\d.]+)\)/,
          (match, value) => {
            return value === "1" ? "scaleX(-1)" : "scaleX(1)";
          }
        );
      } else {
        // If scaleX doesn't exist, add scaleX(-1)
        newStyles.transform = `${newStyles.transform} scaleX(-1)`;
      }
    }

    // Handle vertical flip (scaleY)
    if (direction === "vertical") {
      if (scaleYExists) {
        // If scaleY exists, toggle its value
        newStyles.transform = newStyles.transform.replace(
          /scaleY\((-?[\d.]+)\)/,
          (match, value) => {
            return value === "1" ? "scaleY(-1)" : "scaleY(1)";
          }
        );
      } else {
        // If scaleY doesn't exist, add scaleY(-1)
        newStyles.transform = `${newStyles.transform} scaleY(-1)`;
      }
    }
    // Update the element with the new styles
    updateElement(selectedElement.id, {
      styles: newStyles,
    });
    // Directly update the element's transform style in the DOM
    const element = document.getElementById(selectedElement.id);
    if (element) {
      element.style.transform = newStyles.transform; // Apply the transform directly without !important
    }
    console.log("Updated Styles:", newStyles);
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
    if (!selectedElement || selectedElement.locked) return;

    // Check if the value is between 0 (fully transparent) and 1 (fully opaque)
    const newOpacity = Math.min(Math.max(value, 0), 1); // Ensure the value is clamped between 0 and 1

    // Update the selected element's style using the updateElement function
    updateElement(selectedElement.id, {
      styles: {
        ...selectedElement.styles,
        opacity: newOpacity, // Update the opacity
      },
    });
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
  const handleFitToPage = () => {
    if (!selectedElement || selectedElement.locked) return;
    // 1. Get the canvas element by its id
    const canvasElement = document.getElementById("#canvas");

    if (!canvasElement) {
      console.log("Canvas element not found.");
      return;
    }

    // 2. Get the width and height of the canvas element
    const canvasWidth = canvasElement.offsetWidth;
    const canvasHeight = canvasElement.offsetHeight;
    // Update the selected element with the new z-index
    updateElement(selectedElement.id, {
      position: { x: 0, y: 0 },
      styles: {
        ...selectedElement.styles,
        width: canvasWidth,
        height: canvasHeight,
        zIndex: 0,
      },
    });
  };

  const handleUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return; // If no file is selected, return

    // 1. Read the file as a Blob (or you can directly use the file as you have in the existing code)
    const blob = uploadedFile;

    // 2. Generate a local object URL for rendering in the frontend
    const objectUrl = URL.createObjectURL(blob);

    // 3. Create and add the canvas element with local object URL
    const newElement = createImageElement(objectUrl); // includes a unique `id`
    addElement(newElement);

    // 4. Store the file with element ID as the name for backend API use
    const fileForBackend = new File([blob], newElement.id, { type: blob.type });
    addFile(fileForBackend);
    setSelectedElementId(newElement?.id);
  };
  return (
    <>
      <div className="flex items-center flex-wrap gap-2">
        {/* <button className="p-2 rounded-md hover:bg-gray-100">
          <RotateCcw className="h-5 w-5 text-gray-600" />
        </button>

        <button className="p-2 rounded-md hover:bg-gray-100">
          <RotateCw className="h-5 w-5 text-gray-600" />
        </button> */}

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

        <button
          onClick={handleFitToPage}
          className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100"
        >
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

        <CropButton
          selectedElement={selectedElement}
          updateElement={updateElement}
        />

        <div>
          {/* Upload Button */}
          <button
            className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border"
            onClick={() => document.getElementById("file-upload-input").click()} // Trigger file input click
          >
            <Upload className="h-5 w-5 text-gray-600" />
            <span className="w-max">Upload</span>
          </button>

          {/* Hidden file input */}
          <input
            id="file-upload-input"
            type="file"
            style={{ display: "none" }} // Hide the input field
            onChange={handleUpload} // Call the handleUpload function when file is selected
          />
        </div>

        <button className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-400 border cursor-not-allowed">
          <ImageIcon className="h-5 w-5" />
          <span className="w-max">Change Image</span>
        </button>

        <PositionPopup
          onLayerPositionChange={handleLayerPositionChange} // For element positioning
          onPositionChange={handlePositionChange} // For text alignment
        />

        <TransparencyPopup
          transparency={selectedElement?.styles?.opacity}
          onChange={handleTransparencyChange}
        />

        <button
          onClick={() => handleLock(selectedElement?.id)}
          className={`p-2 rounded-md hover:bg-gray-100 ${
            selectedElement?.locked ? "bg-gray-300" : null
          }`}
        >
          {selectedElement?.locked ? (
            <Lock className="h-4 w-4 text-gray-600" /> // Red lock icon for locked state
          ) : (
            <Unlock className="h-4 w-4 text-gray-600" /> // Green unlock icon for unlocked state
          )}
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
