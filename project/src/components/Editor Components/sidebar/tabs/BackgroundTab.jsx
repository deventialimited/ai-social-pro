import { Search } from "lucide-react";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";

function BackgroundTab() {
  const colors = [
    "#87CEEB",
    "#FFFFFF",
    "#4169E1",
    "#FFA500",
    "#90EE90",
    "#FFD700",
    "#DA70D6",
    "#DCDCDC",
  ];

  const gradients = [
    "linear-gradient(to bottom right, #ec4899, #8b5cf6, #3b82f6)",
    "linear-gradient(to bottom right, #5eead4, #86efac, #fde68a)",
    "linear-gradient(to bottom right, #bfdbfe, #ffffff, #fdba74)",
    "linear-gradient(to bottom right, #1e3a8a, #6b21a8, #22c55e)",
    "linear-gradient(to bottom right, #ec4899, #8b5cf6, #06b6d4)",
    "linear-gradient(to bottom right, #1d4ed8, #1e40af, #111827)",
  ];

  const { updateCanvasStyles, updateBackground, canvas } = useEditor();
  console.log(canvas);
  // Handle solid background color
  const handleColorClick = (color) => {
    updateCanvasStyles({ backgroundColor: color });
    updateBackground("color", color);

    // Optional: update a specific element instead of canvas
    // updateElement("backgroundColor", color);
  };

  // Handle gradient background
  const handleGradientClick = (gradient) => {
    updateCanvasStyles({ backgroundImage: gradient, backgroundColor: "" });
    updateBackground("gradient", gradient);

    // Optional: update a specific element instead of canvas
    // updateElement("backgroundImage", gradient);
  };

  return (
    <div className="p-4">
      {/* Solid Colors */}
      <div className="flex flex-wrap gap-2 mb-4">
        {colors.map((color, index) => (
          <button
            key={index}
            className="w-8 h-8 rounded-md border border-gray-200 hover:opacity-80"
            style={{ backgroundColor: color }}
            onClick={() => handleColorClick(color)}
          ></button>
        ))}
      </div>

      {/* Search Field (optional feature) */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
        />
      </div>

      {/* Gradient Backgrounds */}
      <div className="mb-4">
        <p className="text-sm mb-2">Photos by Unsplash</p>
        <div className="grid grid-cols-2 gap-2">
          {gradients.map((gradient, index) => (
            <div
              key={index}
              className="aspect-video rounded-md overflow-hidden cursor-pointer"
              style={{ backgroundImage: gradient }}
              onClick={() => handleGradientClick(gradient)}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BackgroundTab;
