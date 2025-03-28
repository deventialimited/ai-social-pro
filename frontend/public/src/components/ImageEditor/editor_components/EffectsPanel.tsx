// @ts-nocheck
"use client";
import React from "react";
import { X } from "lucide-react";

interface EffectsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  effects: {
    blur: number;
    brightness: number;
    sepia: number;
    grayscale: number;
    border: number;
    cornerRadius: number;
    shadow: {
      blur: number;
      offsetX: number;
    };
  };
  onEffectChange: (effect: string, value: number) => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
  isOpen,
  onClose,
  effects,
  onEffectChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute left-0 top-[150px] bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-[300px] z-[100] ml-[100px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg">Effects</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Blur */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Blur</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={effects.blur}
            onChange={(e) => onEffectChange("blur", Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Brightness */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Brightness</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={effects.brightness}
            onChange={(e) =>
              onEffectChange("brightness", Number(e.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Sepia */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Sepia</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={effects.sepia}
            onChange={(e) => onEffectChange("sepia", Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Grayscale */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Grayscale</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={effects.grayscale}
            onChange={(e) =>
              onEffectChange("grayscale", Number(e.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Border */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Border</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            value={effects.border}
            onChange={(e) => onEffectChange("border", Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Corner Radius */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Corner Radius</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={effects.cornerRadius}
            onChange={(e) =>
              onEffectChange("cornerRadius", Number(e.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Shadow Blur */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Shadow Blur</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={effects.shadow.blur}
            onChange={(e) =>
              onEffectChange("shadow.blur", Number(e.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Shadow Offset X */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Shadow Offset X</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={effects.shadow.offsetX}
            onChange={(e) =>
              onEffectChange("shadow.offsetX", Number(e.target.value))
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
