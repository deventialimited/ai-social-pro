// @ts-nocheck

import type React from "react";
import { v4 as uuidv4 } from "uuid";

// Define shape types
type ShapeType =
  | "square"
  | "circle"
  | "star"
  | "triangle"
  | "pentagon"
  | "hexagon"
  | "speech-bubble"
  | "cross"
  | "oval"
  | "cloud"
  | "arrow-left"
  | "arrow-right"
  | "arrow-down"
  | "arrow-up";

// Define shape object structure
interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  zIndex: number;
  rotation: number;
}

interface ShapesTabContentProps {
  onAddShape: (shape: Shape) => void;
}

const ShapesTabContent: React.FC<ShapesTabContentProps> = ({ onAddShape }) => {
  // Available shapes with their SVG paths or components
  const shapes: { type: ShapeType; component: React.ReactNode }[] = [
    {
      type: "square",
      component: <div className="w-full h-full bg-gray-400 rounded-sm"></div>,
    },
    {
      type: "circle",
      component: <div className="w-full h-full bg-gray-400 rounded-full"></div>,
    },
    {
      type: "star",
      component: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="currentColor"
            d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"
            className="text-gray-400"
          />
        </svg>
      ),
    },
    {
      type: "triangle",
      component: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="currentColor"
            d="M1,21H23L12,2L1,21Z"
            className="text-gray-400"
          />
        </svg>
      ),
    },
    {
      type: "pentagon",
      component: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="currentColor"
            d="M12,2L1,9.5L4.5,21H19.5L23,9.5L12,2Z"
            className="text-gray-400"
          />
        </svg>
      ),
    },
    {
      type: "hexagon",
      component: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="currentColor"
            d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z"
            className="text-gray-400"
          />
        </svg>
      ),
    },
    {
      type: "speech-bubble",
      component: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="currentColor"
            d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2Z"
            className="text-gray-400"
          />
        </svg>
      ),
    },
    {
      type: "cross",
      component: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="currentColor"
            d="M10,2H14V8H20V12H14V22H10V12H4V8H10V2Z"
            className="text-gray-400"
          />
        </svg>
      ),
    },
    {
      type: "oval",
      component: (
        <div
          className="w-full h-full bg-gray-400 rounded-full"
          style={{ height: "75%" }}
        ></div>
      ),
    },
    {
      type: "cloud",
      component: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="currentColor"
            d="M19.35,10.03C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.03C2.34,8.36 0,10.9 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.03Z"
            className="text-gray-400"
          />
        </svg>
      ),
    },
    {
      type: "arrow-left",
      component: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="currentColor"
            d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"
            className="text-gray-400"
          />
        </svg>
      ),
    },
    {
      type: "arrow-right",
      component: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="currentColor"
            d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
            className="text-gray-400"
          />
        </svg>
      ),
    },
    {
      type: "arrow-up",
      component: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="currentColor"
            d="M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z"
            className="text-gray-400"
          />
        </svg>
      ),
    },
    {
      type: "arrow-down",
      component: (
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path
            fill="currentColor"
            d="M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z"
            className="text-gray-400"
          />
        </svg>
      ),
    },
  ];

  // Handle shape click
  const handleShapeClick = (type: ShapeType) => {
    // Create a new shape with default properties
    const newShape: Shape = {
      id: uuidv4(),
      type,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      color: "#cccccc",
      zIndex: 1,
      rotation: 0, // Adding the missing rotation property with default value 0
    };
    // Pass the new shape to parent component
    onAddShape(newShape);
  };

  return (
    <div className="w-full p-4">
      <h3 className="text-lg font-medium mb-4">Shapes</h3>
      <div className="grid grid-cols-4 gap-4">
        {shapes.map((shape, index) => (
          <div
            key={index}
            className="aspect-square border border-gray-300 rounded-md p-2 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => handleShapeClick(shape.type)}
          >
            {shape.component}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShapesTabContent;
