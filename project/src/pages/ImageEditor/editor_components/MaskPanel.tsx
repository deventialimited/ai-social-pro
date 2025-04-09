import React from "react";

interface MaskPanelProps {
  onSelectMask: (maskType: string) => void;
  isOpen: boolean;
}

const MaskPanel: React.FC<MaskPanelProps> = ({ onSelectMask, isOpen }) => {
  if (!isOpen) return null;

  const masks = [
    {
      type: "circle",
      label: "Circle",
      path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
    },
    { type: "square", label: "Square", path: "M3 3h18v18H3z" },
    { type: "rectangle", label: "Rectangle", path: "M2 4h20v16H2z" },
    { type: "triangle", label: "Triangle", path: "M12 2L2 22h20L12 2z" },
    { type: "diamond", label: "Diamond", path: "M12 2l10 10-10 10L2 12 12 2z" },
    {
      type: "pentagon",
      label: "Pentagon",
      path: "M12 2L3 9.5l3.5 11h11l3.5-11z",
    },
    {
      type: "hexagon",
      label: "Hexagon",
      path: "M21 16.5v-9L12 3 3 7.5v9L12 21z",
    },
    {
      type: "octagon",
      label: "Octagon",
      path: "M7.86 2h8.28L22 7.86v8.28L16.14 22H7.86L2 16.14V7.86L7.86 2z",
    },
    {
      type: "star",
      label: "Star",
      path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    },
    {
      type: "heart",
      label: "Heart",
      path: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    },
    {
      type: "cloud",
      label: "Cloud",
      path: "M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z",
    },
    {
      type: "cross",
      label: "Cross",
      path: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    },
    {
      type: "shield",
      label: "Shield",
      path: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
    },
    {
      type: "blob1",
      label: "Blob 1",
      path: "M50,0 C60,15 60,35 50,50 C40,65 10,65 0,50 C-10,35 -10,15 0,0 C10,-15 40,-15 50,0",
    },
    {
      type: "blob2",
      label: "Blob 2",
      path: "M50,0 C70,10 70,40 50,50 C30,60 10,40 0,25 C-10,10 10,0 25,0 C40,0 45,-5 50,0",
    },
    {
      type: "wave",
      label: "Wave",
      path: "M0,10 C15,0 35,0 50,10 C65,20 85,20 100,10 L100,50 L0,50 Z",
    },
  ];


  return (
    <div className="absolute z-10 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-4 w-64">
      <div className="flex items-center justify-between mb-3 border-b pb-2">
        <h3 className="text-sm font-medium text-gray-700">Select Mask Shape</h3>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {masks.map((mask) => (
          <button
            key={mask.type}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex flex-col items-center justify-center group"
            onClick={() => onSelectMask(mask.type)}
            title={mask.label}
          >
            <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-white">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-gray-600"
              >
                <path d={mask.path} />
              </svg>
            </div>
            <span className="text-xs text-gray-600 mt-1">{mask.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MaskPanel;
