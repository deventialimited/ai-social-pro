// @ts-nocheck
import React, { useState } from 'react';
import FontPicker, { Font } from 'font-picker-react'; // Import FontPicker and Font type

import {
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  SwatchIcon,
  ClockIcon, // Import ClockIcon for time-related actions
  Listbox, // Import Listbox for dropdown actions
  ChevronDownIcon, // Import ChevronDownIcon for dropdown actions
} from "@heroicons/react/24/outline";

import {
  Upload as UploadIcon,
  CornerUpRight as CornerIcon,
  Crop as CropIcon
} from 'lucide-react'; // Import icons from lucide-react

// ==== TEXT TOOLBAR ====
interface ToolbarProps {
  onFontChange?: (font: string) => void;
  onFontSizeChange?: (size: number) => void;
  onColorChange?: (color: string) => void;
  onBackgroundColorChange?: (color: string) => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onFontChange,
  onFontSizeChange,
  onColorChange,
  onBackgroundColorChange,
  onCopy,
  onDelete,
  onUndo,
  onRedo
}) => {
  const [fontSize, setFontSize] = useState<number>(115);
  const [fontFamily, setFontFamily] = useState<string>('Open Sans');
  const [fontColor, setFontColor] = useState<string>('#000000');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');

  const handleFontChange = (nextFont: Font) => {
    setFontFamily(nextFont.family);
    onFontChange?.(nextFont.family);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setFontSize(newSize);
    onFontSizeChange?.(newSize);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setFontColor(newColor);
    onColorChange?.(newColor);
  };

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setBackgroundColor(newColor);
    onBackgroundColorChange?.(newColor);
  };

  return (
    <div id='toolfix' className=" flex items-center p-2 border-b">
      <div className="flex space-x-2 mr-4">
        <FontPicker
          apiKey="AIzaSyBF9iz-ZlVitz2P0x6Ob9X63MFKf1-8_i8"
          activeFontFamily={fontFamily}
          onChange={handleFontChange}
        />

        <input
          type="number"
          className="w-16 px-2 py-1 border border-gray-200 rounded"
          value={fontSize}
          onChange={handleFontSizeChange}
        />

        <input
          type="color"
          className="w-10 h-10 p-1 border border-gray-200 rounded"
          value={fontColor}
          onChange={handleColorChange}
        />

        <input
          type="color"
          className="w-10 h-10 p-1 border border-gray-200 rounded"
          value={backgroundColor}
          onChange={handleBackgroundColorChange}
        />
      </div>

      <div className="ml-auto flex items-center space-x-4">
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Undo"
          onClick={onUndo}
        >
          <ArrowUturnLeftIcon className="h-5 w-5" />
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Redo"
          onClick={onRedo}
        >
          <ArrowUturnRightIcon className="h-5 w-5" />
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Copy"
          onClick={onCopy}
        >
          <DocumentDuplicateIcon className="h-5 w-5" />
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Delete"
          onClick={onDelete}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// ==== SHAPE TOOLBAR ====
interface ShapeToolbarProps {
  onColorChange?: (color: string) => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const ShapeToolbar: React.FC<ShapeToolbarProps> = ({
  onColorChange,
  onCopy,
  onDelete,
  onUndo,
  onRedo
}) => {
  const [shapeColor, setShapeColor] = useState<string>("#cccccc"); // Default color from shapTabContent.tsx

  const handleShapeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setShapeColor(newColor);
    onColorChange?.(newColor);
  };

  return (
    <div className="flex items-center p-2 border-b">
      <div className="flex space-x-2 mr-4">
        <input
          type="color"
          className="w-10 h-10 p-1 border border-gray-200 rounded"
          value={shapeColor}
          onChange={handleShapeColorChange}
        />
      </div>

      <div className="ml-auto flex items-center space-x-4">
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Undo"
          onClick={onUndo}
        >
          <ArrowUturnLeftIcon className="h-5 w-5" />
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Redo"
          onClick={onRedo}
        >
          <ArrowUturnRightIcon className="h-5 w-5" />
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Copy"
          onClick={onCopy}
        >
          <DocumentDuplicateIcon className="h-5 w-5" />
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Delete"
          onClick={onDelete}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// ==== IMAGE TOOLBAR ====
interface ImageToolbarProps {
  onUpload?: () => void;
  onBorderChange?: () => void;
  onCornerChange?: () => void;
  onCrop?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const ImageToolbar: React.FC<ImageToolbarProps> = ({
  onUpload,
  onBorderChange,
  onCornerChange,
  onCrop,
  onCopy,
  onDelete,
  onUndo,
  onRedo
}) => {
  return (
    <div className="flex items-center p-2 border-b">
      <div className="flex space-x-2 mr-4">
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Upload"
          onClick={onUpload}
        >
          {UploadIcon ? <UploadIcon className="h-5 w-5" /> : <svg className="h-5 w-5" /* SVG for upload */></svg>}
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Change Corners"
          onClick={onCornerChange}
        >
          {CornerIcon ? <CornerIcon className="h-5 w-5" /> : <svg className="h-5 w-5" /* SVG for corners */></svg>}
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Crop"
          onClick={onCrop}
        >
          {CropIcon ? <CropIcon className="h-5 w-5" /> : <svg className="h-5 w-5" /* SVG for crop */></svg>}
        </button>
      </div>

      <div className="ml-auto flex items-center space-x-4">
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Undo"
          onClick={onUndo}
        >
          <ArrowUturnLeftIcon className="h-5 w-5" />
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Redo"
          onClick={onRedo}
        >
          <ArrowUturnRightIcon className="h-5 w-5" />
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Copy"
          onClick={onCopy}
        >
          <DocumentDuplicateIcon className="h-5 w-5" />
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Delete"
          onClick={onDelete}
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

// ==== BACKGROUND TOOLBAR ====
interface BackgroundToolbarProps {
  onColorChange?: (color: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const BackgroundToolbar: React.FC<BackgroundToolbarProps> = ({
  onColorChange,
  onUndo,
  onRedo
}) => {
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setBackgroundColor(newColor);
    onColorChange?.(newColor);
  };

  return (
    <div className="flex items-center p-2 border-b">
      <div className="flex space-x-2 mr-4">
        <input
          type="color"
          className="w-10 h-10 p-1 border border-gray-200 rounded"
          value={backgroundColor}
          onChange={handleBackgroundColorChange}
        />
        <div className="flex items-center space-x-2">
          
          <span>Background Color</span>
        </div>
      </div>

      <div className="ml-auto flex items-center space-x-4">
        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Undo"
          onClick={onUndo}
        >
          <ArrowUturnLeftIcon className="h-5 w-5" />
        </button>

        <button
          className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
          title="Redo"
          onClick={onRedo}
        >
          <ArrowUturnRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export { Toolbar, ShapeToolbar, ImageToolbar, BackgroundToolbar };