import { useEffect, useState } from "react";
import { RotateCcw, RotateCw, Lock, Copy, Trash, Sparkles } from "lucide-react";
import ColorPicker from "../../common/popups/ColorPicker";
import PositionPopup from "../../common/popups/PositionPopup";
import TransparencyPopup from "../../common/popups/TransparencyPopup";
import StrokeSelector from "../../common/popups/StrokeSelector";
import ShadowSettings from "../../common/popups/ShadowSettings";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";

function ShapeToolbar({ selectedElementId }) {
  const [shapeColor, setShapeColor] = useState("#333333");
  const [transparency, setTransparency] = useState(100);
  const { updateElement, elements } = useEditor();
  const [selectedElement, setSelectedElement] = useState(null);
  useEffect(() => {
    if (selectedElementId) {
      const selectedElement = elements.find(
        (el) => el.id === selectedElementId
      );
      console.log(selectedElement);
      setSelectedElement(selectedElement);
    }
  }, [elements, selectedElementId]);
  const [stroke, setStroke] = useState({
    width: 0,
    style: "none",
    cornerRadius: 0,
  });

  const handleColorChange = (color) => {
    setShapeColor(color);
    updateElement(selectedElement?.id, {
      styles: {
        ...selectedElement?.styles,
        fill:color,
       
      },
    });
      };

  const handleLayerPositionChange = (action) => {
    console.log("Position action:", action);
  };

  const handlePositionChange = (action) => {
    console.log("Align action:", action);
    updateElement(selectedElement?.id, {
      position: { ...selectedElement?.position, y: 0 },
      styles: {
        ...selectedElement?.styles,
        left: 0, // Optional: You can change this as needed depending on the requirement
        transform: `translate(${selectedElement?.position?.x}px, 0)`, // Apply translate with X from position.x and y=0
        position: "absolute", // Set the position to absolute
      },
    });
  };

  const handleTransparencyChange = (value) => {
    setTransparency(value);
  };

  const handleStrokeChange = (strokeSettings) => {
    setStroke(strokeSettings);
  };

  return (
    <>
      <div className="flex items-center flex-wrap gap-2">
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
        <ShadowSettings selectedElement={selectedElement} updateElement={updateElement} />

        <PositionPopup
          onLayerPositionChange={handleLayerPositionChange}
          onPositionChange={handlePositionChange}
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
    </>
  );
}

export default ShapeToolbar;
