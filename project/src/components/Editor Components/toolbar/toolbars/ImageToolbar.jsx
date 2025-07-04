import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
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
  Droplet,
} from "lucide-react";
import FlipPopup from "../../common/popups/FlipPopup";
import PositionPopup from "../../common/popups/PositionPopup";
import TransparencyPopup from "../../common/popups/TransparencyPopup";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import { v4 as uuidv4 } from "uuid";
import { createImageElement } from "../../sidebar/hooks/ImagesHooks";
import CropButton from "../../common/popups/CropButton";
import { setElementPosition } from "../../sidebar/hooks/CommonHooks";
import Tooltip from "../../../common/Tooltip";
import { blobToDataURL } from "../../canvas/helpers/generateReplacedPostDesignValues";

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
    removeFileByName,
    updateCanvasStyles,
    updateBackground,
    elements,
    updateFile,
    addFile,
    allFiles,
    canvas,
    handleLock,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditor();
  const [selectedElement, setSelectedElement] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [activePopup, setActivePopup] = useState(null);
  const toolbarRef = useRef(null);
  const positionButtonRef = useRef(null);
  const transparencyButtonRef = useRef(null);

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

    const newPosition = setElementPosition(selectedElement, action, canvas);
    updateElement(selectedElement.id, {
      position: newPosition,
    });
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
    removeFileByName(selectedElement.id); // Remove the file associated with the element\
    setSelectedElement(null); // Optional: Clear selection after deletion
    setSelectedElementId(null);
    setActiveElement("canvas");
  };
  const handleFitToPage = () => {
    if (!selectedElement || selectedElement.locked) return;
    // 1. Get the canvas element by its id
    const canvasElement = document.getElementById("canvas");

    if (!canvasElement) {
      console.log("Canvas element not found.");
      return;
    }
    const borderWidth = 2; // 2px on each side
    // 2. Get the width and height of the canvas element
    const canvasWidth = canvasElement.offsetWidth + borderWidth;
    const canvasHeight = canvasElement.offsetHeight + borderWidth;
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
    // const objectUrl = URL.createObjectURL(blob);
    const objectUrl = await blobToDataURL(blob);

    // 3. Create and add the canvas element with local object URL
    const newElement = createImageElement(objectUrl); // includes a unique `id`
    addElement(newElement);

    // 4. Store the file with element ID as the name for backend API use
    const fileForBackend = new File([blob], newElement.id, { type: blob.type });
    addFile(fileForBackend);
    setSelectedElementId(newElement?.id);
  };

  const handlePopupOpen = (popupType, buttonRef) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get the scroll position using the most reliable method
    const scrollLeft =
      window.pageXOffset ||
      document.documentElement.scrollLeft ||
      document.body.scrollLeft ||
      0;
    const scrollTop =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    // Calculate the absolute position of the button
    const buttonLeft = rect.left + scrollLeft;
    const buttonTop = rect.top + scrollTop;
    const buttonBottom = rect.bottom + scrollTop;

    // Define popup dimensions
    const popupWidth = 200;
    const popupHeight = 200;

    // Calculate initial position (below the button)
    let x = buttonLeft;
    let y = buttonBottom;

    // Adjust position to keep popup within viewport
    if (x + popupWidth > viewportWidth + scrollLeft) {
      x = viewportWidth + scrollLeft - popupWidth;
    }

    // If popup would go below viewport, position it above the button
    if (y + popupHeight > viewportHeight + scrollTop) {
      y = buttonTop - popupHeight;
    }

    // Ensure minimum distance from viewport edges
    x = Math.max(
      scrollLeft,
      Math.min(x, viewportWidth + scrollLeft - popupWidth)
    );
    y = Math.max(
      scrollTop,
      Math.min(y, viewportHeight + scrollTop - popupHeight)
    );

    setPopupPosition({ x, y });
    setActivePopup(popupType);
  };

  const handlePopupClose = () => {
    setActivePopup(null);
  };

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div
          ref={toolbarRef}
          className="flex items-center gap-2 px-2 overflow-x-auto w-[90vw] md:w-full scrollbar-hide sm:flex-wrap sm:justify-start"
        >
          {/* <div ref={toolbarRef} className="flex flex-nowrap items-center gap-2 w-[200px] px-2"> */}
          <Tooltip
            id="undo-tooltip"
            content={canUndo ? "Undo last action" : "Nothing to undo"}
          >
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-2 rounded-md hover:bg-gray-100 ${
                !canUndo ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <RotateCcw className="h-5 w-5 text-gray-600" />
            </button>
          </Tooltip>

          <Tooltip
            id="redo-tooltip"
            content={canRedo ? "Redo last action" : "Nothing to redo"}
          >
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-2 rounded-md hover:bg-gray-100 ${
                !canRedo ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <RotateCw className="h-5 w-5 text-gray-600" />
            </button>
          </Tooltip>

          <Tooltip id="flip-tooltip" content="Flip image">
            <FlipPopup onFlip={handleFlip} />
          </Tooltip>

          <Tooltip id="effects-tooltip" content="Apply image effects">
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
          </Tooltip>

          <Tooltip id="fit-tooltip" content="Fit image to page">
            <button
              onClick={handleFitToPage}
              className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <span className="w-max">Fit to page</span>
            </button>
          </Tooltip>

          <Tooltip id="mask-tooltip" content="Apply mask to image">
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
          </Tooltip>

          <Tooltip id="crop-tooltip" content="Crop image">
            <CropButton
              selectedElement={selectedElement}
              updateElement={updateElement}
            />
          </Tooltip>

          <div>
            {/* <Tooltip id="upload-tooltip" content="Upload new image">
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border"
                onClick={() => document.getElementById("file-upload-input").click()}
              >
                <Upload className="h-5 w-5 text-gray-600" />
                <span className="w-max">Upload</span>
              </button>
            </Tooltip> */}

            <input
              id="file-upload-input"
              type="file"
              style={{ display: "none" }}
              onChange={handleUpload}
            />
          </div>

          <Tooltip id="change-image-tooltip" content="Change current image">
            <button className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-400 border cursor-not-allowed">
              <ImageIcon className="h-5 w-5" />
              <span className="w-max">Change Image</span>
            </button>
          </Tooltip>

          <Tooltip id="position-tooltip" content="Adjust element position">
            <button
              ref={positionButtonRef}
              onClick={() => handlePopupOpen("position", positionButtonRef)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <span className="w-max">Position</span>
            </button>
          </Tooltip>

          <Tooltip id="transparency-tooltip" content="Adjust transparency">
            <button
              ref={transparencyButtonRef}
              onClick={() =>
                handlePopupOpen("transparency", transparencyButtonRef)
              }
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Droplet className="h-5 w-5 text-gray-600" />
            </button>
          </Tooltip>

          <Tooltip
            id="lock-tooltip"
            content={
              selectedElement?.locked ? "Unlock element" : "Lock element"
            }
          >
            <button
              onClick={() => handleLock(selectedElement?.id)}
              className={`p-2 rounded-md hover:bg-gray-100 ${
                selectedElement?.locked ? "bg-gray-300" : null
              }`}
            >
              {selectedElement?.locked ? (
                <Lock className="h-4 w-4 text-gray-600" />
              ) : (
                <Unlock className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </Tooltip>

          <Tooltip id="copy-tooltip" content="Copy element">
            <button
              onClick={handleCopy}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Copy className="h-5 w-5 text-gray-600" />
            </button>
          </Tooltip>

          <Tooltip id="delete-tooltip" content="Delete element">
            <button
              onClick={handleDelete}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Trash className="h-5 w-5 text-gray-600" />
            </button>
          </Tooltip>
        </div>
      </div>

      {activePopup === "position" &&
        createPortal(
          <div
            className="absolute z-[9999]"
            style={{
              left: popupPosition.x,
              top: popupPosition.y,
            }}
          >
            <PositionPopup
              onLayerPositionChange={handleLayerPositionChange}
              onPositionChange={handlePositionChange}
              onClose={handlePopupClose}
            />
          </div>,
          document.body
        )}

      {activePopup === "transparency" &&
        createPortal(
          <div
            className="absolute z-[9999]"
            style={{
              left: popupPosition.x - 150,
              top: popupPosition.y,
            }}
          >
            <TransparencyPopup
              transparency={selectedElement?.styles?.opacity}
              onChange={handleTransparencyChange}
              onClose={handlePopupClose}
            />
          </div>,
          document.body
        )}
    </>
  );
}

export default ImageToolbar;
