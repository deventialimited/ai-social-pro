import React, { useState } from 'react';
import { useEditor } from '../../contexts/EditorContext';
import { Tooltip } from '../../components/Tooltip';
import { ColorPicker } from '../../components/ColorPicker';
import { RotateCcw, RotateCw, Upload } from 'lucide-react';

function BackgroundToolbar({
  specialActiveTab,
  setSpecialActiveTab,
  selectedElementId,
  setSelectedElementId,
  setActiveElement,
}) {
  const { updateElement, handleLock, elements, addElement, removeElement, canvas, undo, redo, canUndo, canRedo } =
    useEditor();
  const [selectedElement, setSelectedElement] = useState(null);
  const fileInputRef = React.useRef(null);

  const handleColorChange = (color) => {
    // Implementation of handleColorChange
  };

  const handleImageUpload = (event) => {
    // Implementation of handleImageUpload
  };

  const triggerFileUpload = () => {
    // Implementation of triggerFileUpload
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
      </div>
    </>
  );
}

export default BackgroundToolbar; 