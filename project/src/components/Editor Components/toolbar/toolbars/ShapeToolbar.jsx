import { useEffect, useState } from "react";
import {
  RotateCcw,
  RotateCw,
  Lock,
  Unlock,
  Copy,
  Trash,
  Sparkles,
} from "lucide-react";
import ColorPicker from "../../common/popups/ColorPicker";
import PositionPopup from "../../common/popups/PositionPopup";
import TransparencyPopup from "../../common/popups/TransparencyPopup";
import StrokeSelector from "../../common/popups/StrokeSelector";
import ShadowSettings from "../../common/popups/ShadowSettings";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import { v4 as uuidv4 } from "uuid";
import { setElementPosition } from "../../sidebar/hooks/CommonHooks";
import Tooltip from "../../../common/Tooltip";

// Utility to convert hex + opacity to rgba
function hexToRgba(hex, opacity) {
  console.log(hex, opacity);
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  return `rgba(${+r},${+g},${+b},${opacity / 100})`;
}

function ShapeToolbar({
  specialActiveTab,
  setSpecialActiveTab,
  selectedElementId,
  setSelectedElementId,
  setActiveElement,
}) {
  const { updateElement, handleLock, elements, addElement, removeElement, canvas, undo, redo, canUndo, canRedo } =
    useEditor();
  const [selectedElement, setSelectedElement] = useState(null);
  useEffect(() => {
    if (selectedElementId) {
      const selectedElement = elements.find(
        (el) => el.id === selectedElementId
      );
      console.log(selectedElement);
      setSelectedElement(selectedElement);
    }
  }, [elements, selectedElementId]);

  const handleColorChange = (color, opacity) => {
    if (selectedElement) {
      const rgbaColor = hexToRgba(color, opacity);
      updateElement(selectedElement.id, {
        styles: {
          ...selectedElement.styles,
          fill: rgbaColor,
        },
      });
    }
  };

  const handleTransparencyChange = (value) => {
    if (!selectedElement || selectedElement.locked) return;
    // Convert percentage (0-100) to 0-1
    const newOpacity = Math.min(Math.max(value, 0), 100) / 100;
    updateElement(selectedElement.id, {
      styles: {
        ...selectedElement.styles,
        opacity: newOpacity,
      },
    });
  };
  const handlePositionChange = (action) => {
    if (!selectedElement || selectedElement.locked) return;
    
    const newPosition = setElementPosition(selectedElement, action, canvas);
    updateElement(selectedElement.id, {
      position: newPosition
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
    setSelectedElement(null); // Optional: Clear selection after deletion
    setSelectedElementId(null);
    setActiveElement("canvas");
  };
  const handleStrokeChange = (strokeSettings) => {
    if (!selectedElement || selectedElement.locked) return;
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement?.styles,
        stroke: strokeSettings.style === "none" ? "none" : strokeSettings.color,
        strokeWidth: strokeSettings.style === "none" ? 0 : strokeSettings.width,
        strokeDasharray: strokeSettings.style === "dashed" ? "14 2" : 
                        strokeSettings.style === "dotted" ? "6 2" :
                        strokeSettings.style === "dotted-dense" ? "3 2  " :
                        "none",
      },
    });
  };

  return (
    <>
      <div className="flex items-center flex-wrap gap-2">
        <Tooltip id="undo-tooltip" content={canUndo ? "Undo last action" : "Nothing to undo"}>
          <button 
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded-md hover:bg-gray-100 ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RotateCcw className="h-5 w-5 text-gray-600" />
          </button>
        </Tooltip>

        <Tooltip id="redo-tooltip" content={canRedo ? "Redo last action" : "Nothing to redo"}>
          <button 
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded-md hover:bg-gray-100 ${!canRedo ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RotateCw className="h-5 w-5 text-gray-600" />
          </button>
        </Tooltip>

        <Tooltip id="color-picker-tooltip" content="Change shape color">
          <ColorPicker
            color={selectedElement?.styles?.fill?.startsWith('rgba') ? 
              `#${selectedElement?.styles?.fill.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/).slice(1).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}` : 
              selectedElement?.styles?.fill}
            onChange={handleColorChange}
            showPalette={false}
          />
        </Tooltip>

        <Tooltip id="stroke-tooltip" content="Adjust stroke settings">
          <StrokeSelector
            stroke={{
              width: selectedElement?.styles?.strokeWidth,
              style: selectedElement?.styles?.strokeDasharray,
              color: selectedElement?.styles?.stroke,
            }}
            onChange={handleStrokeChange}
          />
        </Tooltip>

        <Tooltip id="shadow-tooltip" content="Adjust shadow settings">
          <ShadowSettings
            selectedElement={selectedElement}
            updateElement={updateElement}
          />
        </Tooltip>

        <Tooltip id="position-tooltip" content="Adjust element position">
          <PositionPopup
            onLayerPositionChange={handleLayerPositionChange}
            onPositionChange={handlePositionChange}
          />
        </Tooltip>

        <Tooltip id="transparency-tooltip" content="Adjust transparency">
          <TransparencyPopup
            transparency={selectedElement?.styles?.opacity}
            onChange={handleTransparencyChange}
          />
        </Tooltip>

        <Tooltip id="lock-tooltip" content={selectedElement?.locked ? "Unlock element" : "Lock element"}>
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
    </>
  );
}

export default ShapeToolbar;
