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
import ColorPicker from "../../common/popups/ColorPicker";
import FontSelector from "../../common/popups/FontSelector";
import PositionPopup from "../../common/popups/PositionPopup";
import TransparencyPopup from "../../common/popups/TransparencyPopup";
import TextStylePopup from "../../common/popups/TextStylePopup";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";

function TextToolbar({
  specialActiveTab,
  setSpecialActiveTab,
  selectedElementId,
  setSelectedElementId,
}) {
  const [transparency, setTransparency] = useState(100);
  const { updateElement, elements } = useEditor();
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
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        color: color,
      },
    });
  };
  console.log(selectedElement?.styles);
  const handleFontChange = (newFont) => {
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        fontFamily: newFont,
      },
    });
  };

  const handleFontSizeChange = (e) => {
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        fontSize: `${e.target.value}px`,
      },
    });
  };

  const handlePositionChange = (action) => {
    console.log("Position action:", action);
  };

  const handleAlignChange = (action) => {
    console.log("Align action:", action);
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        textAlign: action, // action could be 'left', 'center', or 'right'
      },
    });
  };

  const handleTransparencyChange = (value) => {
    setTransparency(value);
  };

  const handleTextStyleChange = ({ lineHeight, letterSpacing }) => {
    setTextStyle({ lineHeight, letterSpacing });
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement.styles,
        lineHeight: lineHeight,
        letterSpacing:letterSpacing,
      },
    });
  };

  return (
    <>
      <div className="flex items-center justify-between w-max overflow-x-auto">
        <div className="flex items-center gap-2">
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
      ? "bg-gray-200" : ""
    }`}
    onClick={() => handleAlignChange("left")}
  >
    <AlignLeft className="h-5 w-5 text-gray-600" />
  </button>
  <button
    className={`p-2 hover:bg-gray-100 ${
      selectedElement?.styles?.textAlign === "center" ? "bg-gray-200" : ""
    }`}
    onClick={() => handleAlignChange("center")}
  >
    <AlignCenter className="h-5 w-5 text-gray-600" />
  </button>
  <button
    className={`p-2 hover:bg-gray-100 ${
      selectedElement?.styles?.textAlign === "right" ? "bg-gray-200" : ""
    }`}
    onClick={() => handleAlignChange("right")}
  >
    <AlignRight className="h-5 w-5 text-gray-600" />
  </button>
</div>


<div className="flex border rounded-md">
  <button
    className={`p-2 hover:bg-gray-100 ${
      selectedElement?.styles?.fontWeight === "bold" ? "bg-gray-200" : ""
    }`}
    onClick={() =>
      updateElement(selectedElement?.id, {
        styles: {
          ...selectedElement.styles,
          fontWeight:
            selectedElement?.styles?.fontWeight === "bold" ? "normal" : "bold",
        },
      })
    }
  >
    <Bold className="h-5 w-5 text-gray-600" />
  </button>

  <button
    className={`p-2 hover:bg-gray-100 ${
      selectedElement?.styles?.fontStyle === "italic" ? "bg-gray-200" : ""
    }`}
    onClick={() =>
      updateElement(selectedElement?.id, {
        styles: {
          ...selectedElement.styles,
          fontStyle:
            selectedElement?.styles?.fontStyle === "italic"
              ? "normal"
              : "italic",
        },
      })
    }
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
        </div>

        <div className="flex items-center gap-2">
          <PositionPopup
            onPositionChange={handlePositionChange}
            onAlignChange={handleAlignChange}
          />

          <TransparencyPopup
            transparency={transparency}
            onChange={handleTransparencyChange}
          />

          <button className="p-2 rounded-md hover:bg-gray-100">
            <Lock className="h-5 w-5 text-gray-600" />
          </button>

          <button className="p-2 rounded-md hover:bg-gray-100">
            <Copy className="h-5 w-5 text-gray-600" />
          </button>

          <button className="p-2 rounded-md hover:bg-gray-100">
            <Trash className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </>
  );
}

export default TextToolbar;
