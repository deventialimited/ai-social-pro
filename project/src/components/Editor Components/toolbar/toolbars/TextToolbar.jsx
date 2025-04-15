import { useState } from "react";
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

function TextToolbar({ specialActiveTab, setSpecialActiveTab }) {
  const [textColor, setTextColor] = useState("#000000");
  const [font, setFont] = useState("Poppins");
  const [fontSize, setFontSize] = useState(38.5);
  const [transparency, setTransparency] = useState(100);
  const [textStyle, setTextStyle] = useState({
    lineHeight: 1.5,
    letterSpacing: 0,
  });

  const handleColorChange = (color) => {
    setTextColor(color);
  };

  const handleFontChange = (newFont) => {
    setFont(newFont);
  };

  const handleFontSizeChange = (e) => {
    setFontSize(e.target.value);
  };

  const handlePositionChange = (action) => {
    console.log("Position action:", action);
  };

  const handleAlignChange = (action) => {
    console.log("Align action:", action);
  };

  const handleTransparencyChange = (value) => {
    setTransparency(value);
  };

  const handleTextStyleChange = ({ lineHeight, letterSpacing }) => {
    setTextStyle({ lineHeight, letterSpacing });
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
            color={textColor}
            onChange={handleColorChange}
            showPalette={false}
          />

          <FontSelector font={font} onChange={handleFontChange} />

          <div className="w-16">
            <input
              type="text"
              value={fontSize}
              onChange={handleFontSizeChange}
              className="w-full px-2 py-1 border rounded-md text-sm"
            />
          </div>

          <div className="flex border rounded-md">
            <button className="p-2 hover:bg-gray-100">
              <AlignLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100">
              <AlignCenter className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100">
              <AlignRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="flex border rounded-md">
            <button className="p-2 hover:bg-gray-100">
              <Bold className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100">
              <Italic className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100">
              <Underline className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100">
              <Strikethrough className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <button className="p-2 border rounded-md hover:bg-gray-100">
            <List className="h-5 w-5 text-gray-600" />
          </button>

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
