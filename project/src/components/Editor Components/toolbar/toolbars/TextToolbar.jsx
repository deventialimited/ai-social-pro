import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  RotateCcw,
  RotateCw,
  Lock,
  Unlock,
  Copy,
  Trash,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  Minus,
  ArrowDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  Sparkles,
  Wand2,
  Droplet,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import ColorPicker from "../../common/popups/ColorPicker";
import FontSelector from "../../common/popups/FontSelector";
import PositionPopup from "../../common/popups/PositionPopup";
import TransparencyPopup from "../../common/popups/TransparencyPopup";
import TextStylePopup from "../../common/popups/TextStylePopup";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import { setElementPosition } from "../../sidebar/hooks/CommonHooks";
import Tooltip from "../../../common/Tooltip";

// Utility to convert hex + opacity to rgba
function hexToRgba(hex, opacity) {
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

function TextToolbar({
  specialActiveTab,
  setSpecialActiveTab,
  selectedElementId,
  setSelectedElementId,
  setActiveElement,
}) {
  const { updateElement, handleLock, elements, addElement, removeElement, canvas, undo, redo, canUndo, canRedo } = useEditor();
  const [selectedElement, setSelectedElement] = useState(null);
  const [transparency, setTransparency] = useState(100);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [activePopup, setActivePopup] = useState(null);
  const colorButtonRef = useRef(null);
  const fontButtonRef = useRef(null);
  const positionButtonRef = useRef(null);
  const transparencyButtonRef = useRef(null);
  const textStyleButtonRef = useRef(null);

  useEffect(() => {
    if (selectedElementId) {
      const selectedElement = elements.find(
        (el) => el.id === selectedElementId
      );
      setSelectedElement(selectedElement);
    }
  }, [elements, selectedElementId]);

  const handleColorChange = (color, opacity) => {
    if (!selectedElement || selectedElement.locked) return;
    const rgba = hexToRgba(color, opacity);
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        color: rgba,
      },
    });
  };
  console.log(selectedElement?.styles);
  const handleFontChange = (newFont) => {
    if (!selectedElement || selectedElement.locked) return;

    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        fontFamily: newFont,
      },
    });
  };

  const handleFontSizeChange = (e) => {
    if (!selectedElement || selectedElement.locked) return;

    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        fontSize: `${e.target.value}px`,
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

  const handleTransparencyChange = (value) => {
    if (!selectedElement || selectedElement.locked) return;
    setTransparency(value);
    // Convert percentage (0-100) to 0-1
    const newOpacity = Math.min(Math.max(value, 0), 100) / 100;
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        opacity: newOpacity,
      },
    });
  };

  const handleTextStyleChange = ({ lineHeight, letterSpacing }) => {
    if (!selectedElement || selectedElement.locked) return;
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing,
      },
    });
  };

  // This should handle TEXT ALIGNMENT (not to be confused with element positioning)
  const handleAlignChange = (action) => {
    if (!selectedElement || selectedElement.locked) return;
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        textAlign: action,
      },
    });
  };

  // This should handle VERTICAL TEXT ALIGNMENT
  const handleVerticalAlignChange = (action) => {
    if (!selectedElement || selectedElement.locked) return;
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        verticalAlign: action,
      },
    });
  };

  const handleCopy = () => {
    if (!selectedElement) return;

    // Create a copy of the selected element with a new unique ID
    const copiedElement = {
      ...selectedElement, // Copy all properties of the selected element
      id: `text-${uuidv4()}`, // Generate a new unique ID for the copy
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

  const handlePopupOpen = (popupType, buttonRef) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get the scroll position using the most reliable method
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
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
    x = Math.max(scrollLeft, Math.min(x, viewportWidth + scrollLeft - popupWidth));
    y = Math.max(scrollTop, Math.min(y, viewportHeight + scrollTop - popupHeight));
    
    setPopupPosition({ x, y });
    setActivePopup(popupType);
  };

  const handlePopupClose = () => {
    setActivePopup(null);
  };

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="flex items-center gap-2 w-[200px] px-2">
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

          <Tooltip id="color-picker-tooltip" content="Change text color">
            <button
              ref={colorButtonRef}
              onClick={() => handlePopupOpen('color', colorButtonRef)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <div className="w-6 h-6 rounded-full border border-gray-300" 
                   style={{ backgroundColor: selectedElement?.styles?.color }} />
            </button>
          </Tooltip>

          <Tooltip id="font-selector-tooltip" content="Change font family">
            <button
              ref={fontButtonRef}
              onClick={() => handlePopupOpen('font', fontButtonRef)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <span>{selectedElement?.styles?.fontFamily || 'Font'}</span>
            </button>
          </Tooltip>

          <Tooltip id="font-size-tooltip" content="Change font size">
            <div className="w-16">
              <input
                type="number"
                value={parseFloat(selectedElement?.styles?.fontSize)}
                onChange={handleFontSizeChange}
                className="w-full px-2 py-1 border rounded-md text-sm"
              />
            </div>
          </Tooltip>

          <Tooltip id="text-align-tooltip" content="Text alignment">
            <div className="flex flex-row gap-2 rounded-md">
              <div className="flex border rounded-md">
                <button
                  className={`p-2 hover:bg-gray-100 ${
                    (selectedElement?.styles?.textAlign ?? "left") === "left"
                      ? "bg-gray-200"
                      : ""
                  }`}
                  onClick={() => handleAlignChange("left")}
                >
                  <AlignLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  className={`p-2 hover:bg-gray-100 ${
                    selectedElement?.styles?.textAlign === "center"
                      ? "bg-gray-200"
                      : ""
                  }`}
                  onClick={() => handleAlignChange("center")}
                >
                  <AlignCenter className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  className={`p-2 hover:bg-gray-100 ${
                    selectedElement?.styles?.textAlign === "right"
                      ? "bg-gray-200"
                      : ""
                  }`}
                  onClick={() => handleAlignChange("right")}
                >
                  <AlignRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="flex border rounded-md">
                <button
                  className={`p-2 hover:bg-gray-100 ${
                    (selectedElement?.styles?.verticalAlign ?? "top") === "top"
                      ? "bg-gray-200"
                      : ""
                  }`}
                  onClick={() => handleVerticalAlignChange("top")}
                >
                  <ArrowUp className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  className={`p-2 hover:bg-gray-100 ${
                    selectedElement?.styles?.verticalAlign === "middle"
                      ? "bg-gray-200"
                      : ""
                  }`}
                  onClick={() => handleVerticalAlignChange("middle")}
                >
                  <Minus className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  className={`p-2 hover:bg-gray-100 ${
                    selectedElement?.styles?.verticalAlign === "bottom"
                      ? "bg-gray-200"
                      : ""
                  }`}
                  onClick={() => handleVerticalAlignChange("bottom")}
                >
                  <ArrowDown className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </Tooltip>

          <Tooltip id="text-style-tooltip" content="Text formatting">
            <div className="flex border rounded-md">
              <button
                className={`p-2 hover:bg-gray-100 ${
                  selectedElement?.styles?.fontWeight === "bold"
                    ? "bg-gray-200"
                    : ""
                }`}
                onClick={() => {
                  if (!selectedElement || selectedElement.locked) return;
                  updateElement(selectedElement?.id, {
                    styles: {
                      ...selectedElement.styles,
                      fontWeight:
                        selectedElement?.styles?.fontWeight === "bold"
                          ? "normal"
                          : "bold",
                    },
                  });
                }}
              >
                <Bold className="h-5 w-5 text-gray-600" />
              </button>

              <button
                className={`p-2 hover:bg-gray-100 ${
                  selectedElement?.styles?.fontStyle === "italic"
                    ? "bg-gray-200"
                    : ""
                }`}
                onClick={() => {
                  if (!selectedElement || selectedElement.locked) return;
                  updateElement(selectedElement?.id, {
                    styles: {
                      ...selectedElement.styles,
                      fontStyle:
                        selectedElement?.styles?.fontStyle === "italic"
                          ? "normal"
                          : "italic",
                    },
                  });
                }}
              >
                <Italic className="h-5 w-5 text-gray-600" />
              </button>

              <button
                className={`p-2 hover:bg-gray-100 ${
                  selectedElement?.styles?.textDecoration?.includes("underline")
                    ? "bg-gray-200"
                    : ""
                }`}
                onClick={() => {
                  const current = selectedElement?.styles?.textDecoration || "";
                  const isActive = current.includes("underline");
                  if (!selectedElement || selectedElement.locked) return;
                  updateElement(selectedElement?.id, {
                    styles: {
                      ...selectedElement.styles,
                      textDecoration: isActive
                        ? current.replace("underline", "").trim()
                        : `${current} underline`.trim(),
                    },
                  });
                }}
              >
                <Underline className="h-5 w-5 text-gray-600" />
              </button>

              <button
                className={`p-2 hover:bg-gray-100 ${
                  selectedElement?.styles?.textDecoration?.includes("line-through")
                    ? "bg-gray-200"
                    : ""
                }`}
                onClick={() => {
                  const current = selectedElement?.styles?.textDecoration || "";
                  const isActive = current.includes("line-through");
                  if (!selectedElement || selectedElement.locked) return;
                  updateElement(selectedElement?.id, {
                    styles: {
                      ...selectedElement.styles,
                      textDecoration: isActive
                        ? current.replace("line-through", "").trim()
                        : `${current} line-through`.trim(),
                    },
                  });
                }}
              >
                <Strikethrough className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </Tooltip>

          <Tooltip id="text-style-popup-tooltip" content="Advanced text styling">
            <button
              ref={textStyleButtonRef}
              onClick={() => handlePopupOpen('textStyle', textStyleButtonRef)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <span>Text Style</span>
            </button>
          </Tooltip>

          <Tooltip id="text-effects-tooltip" content="Apply text effects">
            <button
              className={`flex items-center gap-1 px-3 py-2 rounded-md ${
                specialActiveTab === "text-effects"
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                specialActiveTab === "text-effects"
                  ? setSpecialActiveTab(null)
                  : setSpecialActiveTab("text-effects");
              }}
            >
              <Sparkles className="h-5 w-5" />
              <span>Effects</span>
            </button>
          </Tooltip>

          <Tooltip id="position-tooltip" content="Adjust element position">
            <button
              ref={positionButtonRef}
              onClick={() => handlePopupOpen('position', positionButtonRef)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <span>Position</span>
            </button>
          </Tooltip>

          <Tooltip id="transparency-tooltip" content="Adjust transparency">
            <button
              ref={transparencyButtonRef}
              onClick={() => handlePopupOpen('transparency', transparencyButtonRef)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Droplet className="h-5 w-5 text-gray-600" />
            </button>
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
      </div>

      {activePopup === 'color' && createPortal(
        <div 
          className="absolute z-[9999]"
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
          }}
        >
          <ColorPicker
            color={selectedElement?.styles?.color?.startsWith('rgba') ? 
              `#${selectedElement?.styles?.color.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/).slice(1).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}` : 
              selectedElement?.styles?.color}
            onChange={handleColorChange}
            showPalette={false}
            onClose={handlePopupClose}
          />
        </div>,
        document.body
      )}

      {activePopup === 'font' && createPortal(
        <div 
          className="absolute z-[9999]"
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
          }}
        >
          <FontSelector
            font={selectedElement?.styles?.fontFamily}
            onChange={handleFontChange}
            onClose={handlePopupClose}
          />
        </div>,
        document.body
      )}

      {activePopup === 'textStyle' && createPortal(
        <div 
          className="absolute z-[9999]"
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
          }}
        >
          <TextStylePopup
            lineHeight={selectedElement?.styles?.lineHeight}
            letterSpacing={selectedElement?.styles?.letterSpacing}
            onChange={handleTextStyleChange}
            onClose={handlePopupClose}
          />
        </div>,
        document.body
      )}

      {activePopup === 'position' && createPortal(
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

      {activePopup === 'transparency' && createPortal(
        <div 
          className="absolute z-[9999]"
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
          }}
        >
          <TransparencyPopup
            transparency={transparency}
            onChange={handleTransparencyChange}
            onClose={handlePopupClose}
          />
        </div>,
        document.body
      )}
    </>
  );
}

export default TextToolbar;