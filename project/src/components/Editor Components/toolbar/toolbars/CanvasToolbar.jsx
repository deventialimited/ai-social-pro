import { useState, useRef } from "react";
import {
  RotateCcw,
  RotateCw,
  Upload,
  Move,
  Lock,
  Copy,
  Trash,
  Undo,
  Redo,
} from "lucide-react";
import DurationSelector from "../../common/popups/DurationSelector";
import PaletteSelector from "../../common/popups/PaletteSelector";
import ColorPicker from "../../common/popups/ColorPicker";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
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

function CanvasToolbar() {
  const fileInputRef = useRef(null);
  const { updateBackground, updateCanvasStyles, canvas, undo, redo, canUndo, canRedo } = useEditor();
  const handleDurationChange = (newDuration) => {
    // setDuration(newDuration);
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
    // Update canvas styles with RGBA background
    const rgbaColor = hexToRgba(color, opacity);
    updateCanvasStyles({
      backgroundColor: rgbaColor,
    });

    // Update background state
    updateBackground("color", rgbaColor);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);

    updateCanvasStyles({
      backgroundImage: `url(${imageURL})`,
    });

    updateBackground("image", imageURL);
  };
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
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

      {/* <DurationSelector duration={duration} onChange={handleDurationChange} /> */}

      <Tooltip id="palette-tooltip" content="Select color palette">
        <PaletteSelector onSelect={handlePaletteSelect} />
      </Tooltip>

      <Tooltip id="color-picker-tooltip" content="Change background color">
        <ColorPicker
          color={canvas?.styles?.backgroundColor?.startsWith('rgba') ? 
            `#${canvas?.styles?.backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/).slice(1).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}` : 
            canvas?.styles?.backgroundColor}
          onChange={handleColorChange}
          showPalette={false}
        />
      </Tooltip>

      <Tooltip id="upload-tooltip" content="Upload background image">
        <div>
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
        </div>
      </Tooltip>

      <Tooltip id="position-tooltip" content="Adjust canvas position (disabled)">
        <button className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-400 border cursor-not-allowed">
          <Move className="h-5 w-5" />
          <span>Position</span>
        </button>
      </Tooltip>

      <Tooltip id="lock-tooltip" content="Lock canvas (disabled)">
        <button className="p-2 rounded-md text-gray-400 cursor-not-allowed">
          <Lock className="h-5 w-5" />
        </button>
      </Tooltip>

      <Tooltip id="copy-tooltip" content="Copy canvas (disabled)">
        <button className="p-2 rounded-md text-gray-400 cursor-not-allowed">
          <Copy className="h-5 w-5" />
        </button>
      </Tooltip>

      <Tooltip id="delete-tooltip" content="Delete canvas (disabled)">
        <button className="p-2 rounded-md text-gray-400 cursor-not-allowed">
          <Trash className="h-5 w-5" />
        </button>
      </Tooltip>
    </div>
  );
}

export default CanvasToolbar;
