import { useState } from "react";
import { Instagram, Facebook, PinIcon as Pinterest } from "lucide-react";

const SizeTabContent = ({ canvas, updateCanvasSize }) => {
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

  const presetSizes = [
    {
      id: "Instagram",
      icon: <Instagram className="w-6 h-6 text-gray-600" />,
      name: "Instagram Post",
      dimensions: [1080, 1080],
      description: "(1080x1080)",
    },
    {
      id: "Facebook",
      icon: <Facebook className="w-6 h-6 text-gray-600" />,
      name: "Facebook Post",
      dimensions: [1200, 630],
      description: "(1200x630)",
    },
    {
      id: "LinkedIn",
      icon: <Linkedin className="w-6 h-6 text-gray-600" />,
      name: "LinkedIn Post",
      dimensions: [1200, 627],
      description: "(1200x627)",
    },
    {
      id: "X",
      icon: <Twitter className="w-6 h-6 text-gray-600" />,
      name: "Twitter Post",
      dimensions: [1200, 675],
      description: "(1200x675)",
    },
  ];

  const handlePresetClick = (width, height) => {
    setWidth(width);
    setHeight(height);
    updateCanvasSize(width, height);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 h-full overflow-y-auto">
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <label htmlFor="width" className="block text-lg font-medium mb-2">
            Width (px)
          </label>
          <input
            id="width"
            type="text"
            value={width}
            onChange={handleWidthChange}
            className="w-full p-3 text-xl focus:outline-none border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <label htmlFor="height" className="block text-lg font-medium mb-2">
            Height (px)
          </label>
          <input
            id="height"
            type="text"
            value={height}
            onChange={handleHeightChange}
            className="w-full p-3 text-xl focus:outline-none border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="space-y-6">
        {presetSizes.map((preset, index) => (
          <div
            key={index}
            className="flex items-center gap-4 cursor-pointer"
            onClick={() =>
              handlePresetClick(preset.dimensions[0], preset.dimensions[1])
            }
          >
            <div className="flex-shrink-0">{preset.icon}</div>
            <div className="text-xl text-gray-700">
              {preset.name}{" "}
              <span className="text-gray-500">{preset.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SizeTabContent;
