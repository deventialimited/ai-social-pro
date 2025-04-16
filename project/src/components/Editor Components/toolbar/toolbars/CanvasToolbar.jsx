import { useState } from "react";
import {
  RotateCcw,
  RotateCw,
  Upload,
  Move,
  Lock,
  Copy,
  Trash,
} from "lucide-react";
import DurationSelector from "../../common/popups/DurationSelector";
import PaletteSelector from "../../common/popups/PaletteSelector";
import ColorPicker from "../../common/popups/ColorPicker";

function CanvasToolbar() {
  const [duration, setDuration] = useState(5);
  const [backgroundColor, setBackgroundColor] = useState("#87CEEB");

  const handleDurationChange = (newDuration) => {
    setDuration(newDuration);
  };

  const handlePaletteSelect = (palette) => {
    // Handle palette selection
    console.log("Selected palette:", palette);
  };

  const handleColorChange = (color, opacity) => {
    setBackgroundColor(color);
    // You can also handle opacity if needed
    console.log("Color:", color, "Opacity:", opacity);
  };

  return (
    <div className="flex items-center justify-between w-max overflow-x-auto">
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <RotateCcw className="h-5 w-5 text-gray-600" />
        </button>

        <button className="p-2 rounded-md hover:bg-gray-100">
          <RotateCw className="h-5 w-5 text-gray-600" />
        </button>

        <DurationSelector duration={duration} onChange={handleDurationChange} />
      </div>

      <div className="flex items-center gap-2">
        <PaletteSelector onSelect={handlePaletteSelect} />

        <ColorPicker
          color={backgroundColor}
          onChange={handleColorChange}
          label="Background Color"
          showPalette={true}
        />

        <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border">
          <Upload className="h-5 w-5 text-gray-600" />
          <span>Upload</span>
        </button>

        {/* Disabled buttons */}
        <button className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-400 border cursor-not-allowed">
          <Move className="h-5 w-5" />
          <span>Position</span>
        </button>

        <button className="p-2 rounded-md text-gray-400 cursor-not-allowed">
          <Lock className="h-5 w-5" />
        </button>

        <button className="p-2 rounded-md text-gray-400 cursor-not-allowed">
          <Copy className="h-5 w-5" />
        </button>

        <button className="p-2 rounded-md text-gray-400 cursor-not-allowed">
          <Trash className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default CanvasToolbar;
