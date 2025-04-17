import { useState, useRef } from "react";
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
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";

function CanvasToolbar() {
  const [duration, setDuration] = useState(5);
  const fileInputRef = useRef(null);
  const { updateBackground, updateCanvasStyles, canvas } = useEditor();
  const handleDurationChange = (newDuration) => {
    setDuration(newDuration);
  };

  const handlePaletteSelect = (palette) => {

    if (!palette || !palette.colors || palette.colors.length === 0) return;

    // Create a linear gradient using the palette colors
    const gradient = `linear-gradient(90deg, ${palette.colors.join(", ")})`;

    // Update canvas styles — will clear backgroundColor and set image-related styles
    updateCanvasStyles({
      backgroundImage: gradient,
    });

    // Update background state — stores the gradient string
    updateBackground("gradient", gradient);
  };

  const handleColorChange = (color, opacity) => {
    // Update canvas styles with hex background
    updateCanvasStyles({
      backgroundColor: color,
    });

    // Update background state
    updateBackground("color", color);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);

    updateCanvasStyles({
      backgroundImage: `url(${imageURL})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundColor: "",
    });

    updateBackground("image", imageURL);
  };
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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

        {/* <DurationSelector duration={duration} onChange={handleDurationChange} /> */}
      </div>

      <div className="flex items-center gap-2">
        <PaletteSelector onSelect={handlePaletteSelect} />

        <ColorPicker
          color={canvas?.styles?.backgroundColor}
          onChange={handleColorChange}
          label="Background Color"
          showPalette={true}
        />

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleImageUpload}
        />
        <button
          className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border"
          onClick={triggerFileUpload}
        >
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
