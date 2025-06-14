import { useState, useRef } from "react";
import { createPortal } from "react-dom";
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
  const colorButtonRef = useRef(null);
  const { updateBackground, updateCanvasStyles, canvas, undo, redo, canUndo, canRedo } = useEditor();
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [activePopup, setActivePopup] = useState(null);

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
    <div className="w-full overflow-x-auto">
      <div className="flex items-center  gap-2 w-[200px] px-2">
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
          <button
            ref={colorButtonRef}
            onClick={() => handlePopupOpen('color', colorButtonRef)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <div className="w-6 h-6 rounded-full border border-gray-300" 
                 style={{ backgroundColor: canvas?.styles?.backgroundColor }} />
          </button>
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

      {activePopup === 'color' && createPortal(
        <div 
          className="absolute z-[9999]"
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
          }}
        >
          <ColorPicker
            color={canvas?.styles?.backgroundColor?.startsWith('rgba') ? 
              `#${canvas?.styles?.backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+)/).slice(1).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}` : 
              canvas?.styles?.backgroundColor}
            onChange={handleColorChange}
            showPalette={false}
            onClose={handlePopupClose}
          />
        </div>,
        document.body
      )}
    </div>
  );
}

export default CanvasToolbar;
