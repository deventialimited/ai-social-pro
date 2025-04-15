import { useState } from "react";
import {
  RotateCcw,
  RotateCw,
  Upload,
  Crop,
  ImageIcon,
  Lock,
  Copy,
  Trash,
  Sparkles,
} from "lucide-react";
import FlipPopup from "../../common/popups/FlipPopup";
import PositionPopup from "../../common/popups/PositionPopup";
import TransparencyPopup from "../../common/popups/TransparencyPopup";

function ImageToolbar({ specialActiveTab, setSpecialActiveTab }) {
  const [transparency, setTransparency] = useState(100);

  const handleFlip = (direction) => {
    console.log("Flip direction:", direction);
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

          <FlipPopup onFlip={handleFlip} />

          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-md ${
              specialActiveTab === "image-effects"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
            onClick={() => {
              specialActiveTab === "image-effects"
                ? setSpecialActiveTab(null)
                : setSpecialActiveTab("image-effects");
            }}
          >
            <Sparkles className="h-5 w-5" />
            <span className="w-max">Effects</span>
          </button>

          <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100">
            <span className="w-max">Fit to page</span>
          </button>

          <button
            className={`flex items-center gap-1 px-3 py-2 rounded-md ${
              specialActiveTab === "apply-mask"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
            onClick={() => {
              specialActiveTab === "apply-mask"
                ? setSpecialActiveTab(null)
                : setSpecialActiveTab("apply-mask");
            }}
          >
            <span className="w-max">Apply mask</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border">
            <Crop className="h-5 w-5 text-gray-600" />
            <span className="w-max">Crop</span>
          </button>

          <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border">
            <Upload className="h-5 w-5 text-gray-600" />
            <span className="w-max">Upload</span>
          </button>

          <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 border">
            <ImageIcon className="h-5 w-5 text-gray-600" />
            <span className="w-max">Change Image</span>
          </button>

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

export default ImageToolbar;
