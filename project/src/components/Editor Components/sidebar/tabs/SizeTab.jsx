import { useState } from "react";
import { Instagram, Facebook, PinIcon as Pinterest,Linkedin, Twitter } from "lucide-react";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";

export const presetSizes = [
  {
    id: "Instagram",
    icon: <Instagram className="w-6 h-6 text-gray-600" />,
    name: "Instagram Post",
    dimensions: [1080, 1080],
    description: "(1080x1080)",
  },
  {
    icon: <Instagram className="w-6 h-6 text-gray-600" />,
    name: "Instagram Story",
    dimensions: [1080, 1920],
    description: "(1080x1920)",
  },
  {
    icon: <Instagram className="w-6 h-6 text-gray-600" />,
    name: "Instagram Ad",
    dimensions: [1080, 1080],
    description: "(1080x1080)",
  },
  {
    id: "Facebook",
    icon: <Facebook className="w-6 h-6 text-gray-600" />,
    name: "Facebook Post",
    dimensions: [940, 788],
    description: "(940x788)",
  },
  {
    icon: <Facebook className="w-6 h-6 text-gray-600" />,
    name: "Facebook Cover",
    dimensions: [851, 315],
    description: "(851x315)",
  },
  {
    icon: <Facebook className="w-6 h-6 text-gray-600" />,
    name: "Facebook Ad",
    dimensions: [1200, 628],
    description: "(1200x628)",
  },
  {
    icon: <Pinterest className="w-6 h-6 text-gray-600" />,
    name: "Pinterest Post",
    dimensions: [1000, 1500],
    description: "(1000x1500)",
  },
  {
    id: "LinkedIn",
    icon: <Linkedin className="w-6 h-6 text-gray-600" />,
    name: "LinkedIn Post",
    dimensions: [1200, 627],
    description: "(1200x627)",
  },
  {
    icon: <Linkedin className="w-6 h-6 text-gray-600" />,
    name: "LinkedIn Banner",
    dimensions: [1584, 396],
    description: "(1584x396)",
  },
  {
    id: "X",
    icon: <Twitter className="w-6 h-6 text-gray-600" />,
    name: "Twitter Post",
    dimensions: [1200, 675],
    description: "(1200x675)",
  },
  {
    icon: <Twitter className="w-6 h-6 text-gray-600" />,
    name: "Twitter Header",
    dimensions: [1500, 500],
    description: "(1500x500)",
  },
];

const SizeTab = () => {
  const { canvas, updateCanvasSize } = useEditor();
  const [width, setWidth] = useState(canvas.width);
  const [height, setHeight] = useState(canvas.height);

  const handleWidthChange = (e) => {
    const newWidth = Number.parseInt(e.target.value, 10) || 0;
    setWidth(newWidth);
    updateCanvasSize(newWidth, height);
  };

  const handleHeightChange = (e) => {
    const newHeight = Number.parseInt(e.target.value, 10) || 0;
    setHeight(newHeight);
    updateCanvasSize(width, newHeight);
  };

  const handlePresetClick = (width, height) => {
    setWidth(width);
    setHeight(height);
    updateCanvasSize(width, height);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between flex-wrap gap-3">
          <label htmlFor="width" className="block text-sm mb-1">
            Width (px)
          </label>
          <input
            id="width"
            type="text"
            value={width}
            onChange={handleWidthChange}
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div className="mb-2 flex items-center justify-between flex-wrap gap-3">
          <label htmlFor="height" className="block text-sm mb-1">
            Height (px)
          </label>
          <input
            id="height"
            type="text"
            value={height}
            onChange={handleHeightChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>

      <div
        className="overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        <div className="space-y-3 pb-12">
          {presetSizes.map((preset, index) => (
            <div
              key={index}
              className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-md cursor-pointer"
              onClick={() =>
                handlePresetClick(preset.dimensions[0], preset.dimensions[1])
              }
            >
              <div className="h-5 w-5 text-gray-600">{preset.icon}</div>
              <div className="text-sm">
                {preset.name}{" "}
                <span className="text-xs text-gray-500 ml-auto">
                  {preset.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SizeTab;
