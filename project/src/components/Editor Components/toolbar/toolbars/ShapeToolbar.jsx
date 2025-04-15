import { useState } from "react";
import { RotateCcw, RotateCw, Lock, Copy, Trash, Sparkles } from "lucide-react";
import ColorPicker from "../../common/popups/ColorPicker";
import PositionPopup from "../../common/popups/PositionPopup";
import TransparencyPopup from "../../common/popups/TransparencyPopup";
import StrokeSelector from "../../common/popups/StrokeSelector";

function ShapeToolbar() {
  const [showEffects, setShowEffects] = useState(false);
  const [shapeColor, setShapeColor] = useState("#333333");
  const [transparency, setTransparency] = useState(100);
  const [stroke, setStroke] = useState({
    width: 0,
    style: "none",
    cornerRadius: 0,
  });

  const handleColorChange = (color) => {
    setShapeColor(color);
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

  const handleStrokeChange = (strokeSettings) => {
    setStroke(strokeSettings);
  };

  return (
    <>
      <div className="flex items-center justify-between w-max overflow-x-auto">
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-md hover:bg-gray-100">
            <RotateCcw className="h-5 w-5 text-gray-600" />
          </button>

          <button className="p-2 rounded-md hover:bg-gray-100">
            <RotateCw className="h-5 w-5 text-gray-600" />
          </button>

          <ColorPicker
            color={shapeColor}
            onChange={handleColorChange}
            showPalette={false}
          />

          <StrokeSelector
            stroke={stroke.width}
            cornerRadius={stroke.cornerRadius}
            onChange={handleStrokeChange}
          />

          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-md ${
              showEffects ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
            onClick={() => setShowEffects(!showEffects)}
          >
            <Sparkles className="h-5 w-5" />
            <span>Effects</span>
          </button>
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

export default ShapeToolbar;
