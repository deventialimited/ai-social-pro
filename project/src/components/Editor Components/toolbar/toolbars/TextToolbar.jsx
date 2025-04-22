import { useState, useEffect } from "react";
import {
  RotateCcw,
  RotateCw,
  Lock,
  Copy,
  Trash,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  Sparkles,
  Wand2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import ColorPicker from "../../common/popups/ColorPicker";
import FontSelector from "../../common/popups/FontSelector";
import PositionPopup from "../../common/popups/PositionPopup";
import TransparencyPopup from "../../common/popups/TransparencyPopup";
import TextStylePopup from "../../common/popups/TextStylePopup";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import { setPosition } from "../../sidebar/hooks/CommonHooks";
function TextToolbar({
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
  const [textStyle, setTextStyle] = useState({
    lineHeight: 1.5,
    letterSpacing: 0,
  });
  useEffect(() => {
    if (selectedElementId) {
      const selectedElement = elements.find(
        (el) => el.id === selectedElementId
      );
      setSelectedElement(selectedElement);
    }
  }, [elements, selectedElementId]);

  const handleColorChange = (color) => {
    if (!selectedElement || selectedElement.locked) return;

    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        color: color,
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

  const handleTransparencyChange = (value) => {
    if (!selectedElement || selectedElement.locked) return;
    setTransparency(value);
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        opacity: value,
      },
    });
  };

  const handleTextStyleChange = ({ lineHeight, letterSpacing }) => {
    if (!selectedElement || selectedElement.locked) return;
    setTextStyle({ lineHeight, letterSpacing });
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing,
      },
    });
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

  return (
    <>
      <div className="flex items-center flex-wrap gap-2">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <RotateCcw className="h-5 w-5 text-gray-600" />
        </button>

        <button className="p-2 rounded-md hover:bg-gray-100">
          <RotateCw className="h-5 w-5 text-gray-600" />
        </button>

        <ColorPicker
          color={selectedElement?.styles?.color}
          onChange={handleColorChange}
          showPalette={false}
        />

        <FontSelector
          font={selectedElement?.styles?.fontFamily}
          onChange={handleFontChange}
        />

        <div className="w-16">
          <input
            type="number"
            value={parseFloat(selectedElement?.styles?.fontSize)}
            onChange={handleFontSizeChange}
            className="w-full px-2 py-1 border rounded-md text-sm"
          />
        </div>

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

        <TextStylePopup
          lineHeight={textStyle.lineHeight}
          letterSpacing={textStyle.letterSpacing}
          onChange={handleTextStyleChange}
        />

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

        {/* <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border">
            <Wand2 className="h-5 w-5 text-gray-600" />
            <span>AI write</span>
          </button> */}

        <PositionPopup
          onLayerPositionChange={handleLayerPositionChange} // For element positioning
          onPositionChange={handlePositionChange} // For text alignment
        />

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

export default TextToolbar;
