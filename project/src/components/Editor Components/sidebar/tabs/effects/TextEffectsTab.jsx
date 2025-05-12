import { X } from "lucide-react";
import { useState, useEffect } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useEditor } from "../../../EditorStoreHooks/FullEditorHooks";
import { parseTextShadow } from "../../hooks/TextHooks";

function TextEffectsTab({ onClose, selectedElementId }) {
  const [selectedElement, setSelectedElement] = useState(null);
  const { updateElement, elements } = useEditor();

  useEffect(() => {
    if (selectedElementId) {
      const selectedElement = elements.find(
        (el) => el.id === selectedElementId
      );
      setSelectedElement(selectedElement);
    }
  }, [elements, selectedElementId]);

  const handleToggleEffect = (effect) => {
    const prev = selectedElement?.effects;
    const newEnabled = !prev[effect].enabled;
    const updatedEffect = { ...prev[effect], enabled: newEnabled };

    // Apply or remove styles
    if (selectedElement) {
      switch (effect) {
        case "blur":
          updateStyle({
            filter: newEnabled ? `blur(${updatedEffect.value}px)` : "none",
          });
          break;

        case "textStroke":
          updateStyle({
            WebkitTextStroke: newEnabled
              ? `${updatedEffect.value}px ${updatedEffect.color}`
              : null,
          });
          break;

        case "background":
          updateStyle(
            newEnabled
              ? {
                  backgroundColor: updatedEffect.color,
                  // padding: `${updatedEffect.padding}px`,
                  borderRadius: `${updatedEffect.cornerRadius}px`,
                  opacity: updatedEffect.opacity / 100,
                }
              : {
                  backgroundColor: "transparent",
                  // padding: "0px",
                  borderRadius: "0px",
                  opacity: 1,
                }
          );
          break;

        case "shadow":
          updateStyle({
            textShadow: newEnabled
              ? `${updatedEffect.offsetX}px ${updatedEffect.offsetY}px ${
                  updatedEffect.blur
                }px rgba(${hexToRgb(updatedEffect.color)}, ${
                  updatedEffect.opacity / 100
                })`
              : "none",
          });
          break;
      }
    }
    updateEffects({
      ...prev,
      [effect]: updatedEffect,
    });
  };

  const updateStyle = (styleChanges) => {
    if (!selectedElement || selectedElement.locked) return;
    updateElement(selectedElement.id, {
      styles: {
        ...selectedElement.styles,
        ...styleChanges,
      },
    });
  };

  const updateEffects = (effectsChanges) => {
    if (!selectedElement || selectedElement.locked) return;
    updateElement(selectedElement.id, {
      effects: {
        ...selectedElement.effects,
        ...effectsChanges,
      },
    });
  };

  const handleChangeEffectValue = (effect, value) => {
    const prev = selectedElement?.effects;
    const updated = {
      ...prev[effect],
      value,
    };
    updateEffects({
      ...prev,
      [effect]: updated,
    });

    if (effect === "textStroke") {
      updateStyle({
        WebkitTextStroke: `${updated.value}px ${updated.color}`,
      });
    }
  };

  const handleBlurChange = (value) => {
    handleChangeEffectValue("blur", value);
    updateStyle({
      filter: `blur(${value}px)`,
    });
  };

  const handleChangeBackgroundValue = (property, value) => {
    const prev = selectedElement?.effects;
    const updated = {
      ...prev.background,
      [property]: value,
    };
    updateEffects({
      ...prev,
      background: updated,
    });

    if (selectedElement?.effects.background.enabled) {
      const baseWidth = parseFloat(selectedElement.styles?.width) || 0;
      const baseHeight = parseFloat(selectedElement.styles?.height) || 0;
      updateStyle({
        backgroundColor: `rgba(${hexToRgb(updated.color)}, ${
          updated.opacity / 100
        })`,
        borderRadius: `${updated.cornerRadius}px`,
        position: "relative",
        padding: updated.padding,
        boxSizing: "content-box",
      });
    }
  };

  const handleChangeShadowValue = (property, value) => {
    const prev = selectedElement?.effects;
    const updated = {
      ...prev.shadow,
      [property]: value,
    };
    updateEffects({
      ...prev,
      shadow: updated,
    });
    if (selectedElement?.effects.shadow.enabled) {
      updateStyle({
        textShadow: `${updated.offsetX}px ${updated.offsetY}px ${
          updated.blur
        }px rgba(${hexToRgb(updated.color)}, ${updated.opacity / 100})`,
      });
    }
  };

  const handleChangeNestedEffectValue = (effectKey, propKey, value) => {
    if (effectKey === "shadow") {
      handleChangeShadowValue(propKey, value);
    } else if (effectKey === "background") {
      handleChangeBackgroundValue(propKey, value);
    }
  };

  const handleTextStrokeColorChange = (color) => {
    const prev = selectedElement?.effects;
    const updated = {
      ...prev.textStroke,
      color,
    };
    updateEffects({
      ...prev,
      textStroke: updated,
    });

    if (selectedElement?.effects.textStroke.enabled) {
      updateStyle({
        WebkitTextStroke: `${updated.value}px ${updated.color}`,
      });
    }
  };

  const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  };

  return (
    <div className="p-2 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Effects</h2>
        <button
          onClick={onClose}
          className="p-0.5 hover:bg-gray-100 rounded-full"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Blur Effect */}
      <div className="mb-3  ">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs">Blur</label>
          <div className="relative inline-block w-8 h-4">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={selectedElement?.effects.blur.enabled}
              onChange={() => handleToggleEffect("blur")}
            />
            <span
              onClick={() => handleToggleEffect("blur")}
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                selectedElement?.effects.blur.enabled
                  ? "bg-blue-500"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-3 w-3 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  selectedElement?.effects.blur.enabled ? "translate-x-4" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        {selectedElement?.effects.blur.enabled && (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Slider
                min={0}
                max={50}
                value={selectedElement?.effects.blur.value}
                onChange={(value) => handleBlurChange(value)}
              />
            </div>
            <input
              type="number"
              value={selectedElement?.effects.blur.value}
              onChange={(e) =>
                handleChangeEffectValue("blur", Number.parseInt(e.target.value))
              }
              className="w-12 p-1 text-sm border rounded-md"
            />
          </div>
        )}
      </div>

      {/* Text Stroke Effect */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs">Text Stroke</label>
          <div className="relative inline-block w-8 h-4">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={selectedElement?.effects.textStroke.enabled}
              onChange={() => handleToggleEffect("textStroke")}
            />
            <span
              onClick={() => handleToggleEffect("textStroke")}
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                selectedElement?.effects.textStroke.enabled
                  ? "bg-blue-500"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-3 w-3 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  selectedElement?.effects.textStroke.enabled
                    ? "translate-x-4"
                    : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        {selectedElement?.effects.textStroke.enabled && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="color"
                value={selectedElement?.effects.textStroke.color}
                onChange={(e) => handleTextStrokeColorChange(e.target.value)}
                className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="number"
                value={selectedElement?.effects.textStroke.value}
                onChange={(e) =>
                  handleChangeEffectValue(
                    "textStroke",
                    Number.parseInt(e.target.value)
                  )
                }
                className="w-12 p-1 text-sm border rounded-md"
              />
            </div>
          </>
        )}
      </div>

      {/* Background Effect */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs">Background</label>
          <div className="relative inline-block w-8 h-4">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={selectedElement?.effects.background.enabled}
              onChange={() => handleToggleEffect("background")}
            />
            <span
              onClick={() => handleToggleEffect("background")}
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                selectedElement?.effects.background.enabled
                  ? "bg-blue-500"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-3 w-3 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  selectedElement?.effects.background.enabled
                    ? "translate-x-4"
                    : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        {selectedElement?.effects.background.enabled && (
          <>
            {/* Color */}
            <div className="ml-2 mb-2">
              <div className="flex items-center gap-2">
                <label className="text-xs">Color</label>
                <input
                  type="color"
                  value={selectedElement?.effects.background.color}
                  onChange={(e) =>
                    handleChangeBackgroundValue("color", e.target.value)
                  }
                  className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer"
                />
              </div>
            </div>
            {/* Corner Radius */}
            <div className="ml-2 mb-2">
              <label className="block mb-1 text-xs">Corner radius</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Slider
                    min={0}
                    max={100}
                    value={selectedElement?.effects.background.cornerRadius}
                    onChange={(value) =>
                      handleChangeBackgroundValue("cornerRadius", value)
                    }
                  />
                </div>
                <input
                  type="number"
                  value={selectedElement?.effects.background.cornerRadius}
                  onChange={(e) =>
                    handleChangeBackgroundValue(
                      "cornerRadius",
                      Number.parseInt(e.target.value)
                    )
                  }
                  className="w-12 p-1 text-sm border rounded-md"
                />
              </div>
            </div>

            {/* Padding */}
            <div className="ml-2 mb-2">
              <label className="block mb-1 text-xs">Padding</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Slider
                    min={0}
                    max={100}
                    value={selectedElement?.effects.background.padding}
                    onChange={(value) =>
                      handleChangeBackgroundValue("padding", value)
                    }
                  />
                </div>
                <input
                  type="number"
                  value={selectedElement?.effects.background.padding}
                  onChange={(e) =>
                    handleChangeBackgroundValue(
                      "padding",
                      Number.parseInt(e.target.value)
                    )
                  }
                  className="w-12 p-1 text-sm border rounded-md"
                />
              </div>
            </div>

            {/* Opacity */}
            <div className="ml-2 mb-2">
              <label className="block mb-1 text-xs">Opacity</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Slider
                    min={0}
                    max={100}
                    value={selectedElement?.effects.background.opacity}
                    onChange={(value) =>
                      handleChangeBackgroundValue("opacity", value)
                    }
                  />
                </div>
                <input
                  type="number"
                  value={selectedElement?.effects.background.opacity}
                  onChange={(e) =>
                    handleChangeBackgroundValue(
                      "opacity",
                      Number.parseInt(e.target.value)
                    )
                  }
                  className="w-12 p-1 text-sm border rounded-md"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Shadow Effect */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs">Shadow</label>
          <div className="relative inline-block w-8 h-4">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={selectedElement?.effects.shadow.enabled}
              onChange={() => handleToggleEffect("shadow")}
            />
            <span
              onClick={() => handleToggleEffect("shadow")}
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                selectedElement?.effects.shadow.enabled
                  ? "bg-blue-500"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-3 w-3 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  selectedElement?.effects.shadow.enabled ? "translate-x-4" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        {selectedElement?.effects.shadow.enabled && (
          <>
            {/* Shadow Blur */}
            <div className="ml-2 mb-2">
              <label className="block mb-1 text-xs">Blur</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Slider
                    min={0}
                    max={50}
                    value={selectedElement?.effects.shadow.blur}
                    onChange={(value) =>
                      handleChangeNestedEffectValue("shadow", "blur", value)
                    }
                  />
                </div>
                <input
                  type="number"
                  value={selectedElement?.effects.shadow.blur}
                  onChange={(e) =>
                    handleChangeNestedEffectValue(
                      "shadow",
                      "blur",
                      Number.parseInt(e.target.value)
                    )
                  }
                  className="w-12 p-1 text-sm border rounded-md"
                />
              </div>
            </div>

            {/* Shadow Offset X */}
            <div className="ml-2 mb-2">
              <label className="block mb-1 text-xs">Offset X</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Slider
                    min={-50}
                    max={50}
                    value={selectedElement?.effects.shadow.offsetX}
                    onChange={(value) =>
                      handleChangeShadowValue("offsetX", value)
                    }
                  />
                </div>
                <input
                  type="number"
                  value={selectedElement?.effects.shadow.offsetX}
                  onChange={(e) =>
                    handleChangeShadowValue(
                      "offsetX",
                      Number.parseInt(e.target.value)
                    )
                  }
                  className="w-12 p-1 text-sm border rounded-md"
                />
              </div>
            </div>

            {/* Shadow Offset Y */}
            <div className="ml-2 mb-2">
              <label className="block mb-1 text-xs">Offset Y</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Slider
                    min={-50}
                    max={50}
                    value={selectedElement?.effects.shadow.offsetY}
                    onChange={(value) =>
                      handleChangeShadowValue("offsetY", value)
                    }
                  />
                </div>
                <input
                  type="number"
                  value={selectedElement?.effects.shadow.offsetY}
                  onChange={(e) =>
                    handleChangeShadowValue(
                      "offsetY",
                      Number.parseInt(e.target.value)
                    )
                  }
                  className="w-12 p-1 text-sm border rounded-md"
                />
              </div>
            </div>

            {/* Shadow Opacity */}
            <div className="ml-2 mb-2">
              <label className="block mb-1 text-xs">Opacity</label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Slider
                    min={0}
                    max={100}
                    value={selectedElement?.effects.shadow.opacity}
                    onChange={(value) =>
                      handleChangeShadowValue("opacity", value)
                    }
                  />
                </div>
                <input
                  type="number"
                  value={selectedElement?.effects.shadow.opacity}
                  onChange={(e) =>
                    handleChangeShadowValue(
                      "opacity",
                      Number.parseInt(e.target.value)
                    )
                  }
                  className="w-12 p-1 text-sm border rounded-md"
                />
              </div>
            </div>

            {/* Shadow Color */}
            <div className="ml-2 mb-16">
              <div className="flex items-center gap-2">
                <label className="text-xs">Color</label>
                <input
                  type="color"
                  value={selectedElement?.effects.shadow.color}
                  onChange={(e) =>
                    handleChangeShadowValue("color", e.target.value)
                  }
                  className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TextEffectsTab;
