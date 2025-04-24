import { X } from "lucide-react";
import { useState, useEffect } from "react";
import Slider from "rc-slider";
import { useEditor } from "../../../EditorStoreHooks/FullEditorHooks";
import "rc-slider/assets/index.css";

function ImageEffectsTab({ onClose, selectedElementId }) {
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

  const [effects, setEffects] = useState({
    blur: { enabled: true, value: 10 },
    brightness: { enabled: true, value: 100 },
    sepia: { enabled: true, value: 0 },
    grayscale: { enabled: true, value: 0 },
    border: { enabled: true, value: 2, color: "#000000" },
    cornerRadius: { enabled: true, value: 150 },
    shadow: {
      enabled: true,
      blur: 5,
      offsetX: 0,
      offsetY: 0,
      opacity: 100,
      color: "#000000",
    },
  });

  const handleToggleEffect = (effect) => {
    setEffects((prev) => {
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
  
          case "brightness":
            updateStyle({
              filter: newEnabled ? `brightness(${updatedEffect.value}%)` : "none",
            });
            break;
  
          case "sepia":
            updateStyle({
              filter: newEnabled ? `sepia(${updatedEffect.value}%)` : "none",
            });
            break;
  
          case "grayscale":
            updateStyle({
              filter: newEnabled ? `grayscale(${updatedEffect.value}%)` : "none",
            });
            break;
  
          case "border":
            updateStyle({
              border: newEnabled ? `${updatedEffect.value}px solid ${updatedEffect.color}` : "none",
            });
            break;
  
          case "cornerRadius":
            updateStyle({
              borderRadius: newEnabled ? `${updatedEffect.value}px` : "0px",
            });
            break;
  
          case "shadow":
            updateStyle({
              boxShadow: newEnabled
                ? `${updatedEffect.offsetX}px ${updatedEffect.offsetY}px ${updatedEffect.blur}px rgba(${hexToRgb(
                    updatedEffect.color
                  )}, ${updatedEffect.opacity / 100})`
                : "none",
            });
            break;
        }
      }
  
      return {
        ...prev,
        [effect]: updatedEffect,
      };
    });
  };
  
  const updateStyle = (styleChanges) => {
    if (!selectedElement) return;
    updateElement(selectedElement.id, {
      styles: {
        ...selectedElement.styles,
        ...styleChanges,
      },
    });
  };

  const handleChangeEffectValue = (effect, value) => {
    const updated = {
      ...effects[effect],
      value,
    };

    setEffects((prev) => ({
      ...prev,
      [effect]: updated,
    }));

    if (selectedElement) {
      switch (effect) {
        case "blur":
          updateStyle({
            filter: `blur(${updated.value}px)`,
          });
          break;
        case "brightness":
          updateStyle({
            filter: `brightness(${updated.value}%)`,
          });
          break;
        case "sepia":
          updateStyle({
            filter: `sepia(${updated.value}%)`,
          });
          break;
        case "grayscale":
          updateStyle({
            filter: `grayscale(${updated.value}%)`,
          });
          break;
        case "border":
          updateStyle({
            border: `${updated.value}px solid ${updated.color}`,
          });
          break;
        case "cornerRadius":
          updateStyle({
            borderRadius: `${updated.value}px`,
          });
          break;
      }
    }
  };

  const handleChangeShadowValue = (property, value) => {
    const updated = {
      ...effects.shadow,
      [property]: value,
    };

    setEffects((prev) => ({
      ...prev,
      shadow: updated,
    }));

    if (effects.shadow.enabled && selectedElement) {
      updateStyle({
        boxShadow: `${updated.offsetX}px ${updated.offsetY}px ${updated.blur}px rgba(${hexToRgb(
          updated.color
        )}, ${updated.opacity / 100})`,
      });
    }
  };

  const handleChangeNestedEffectValue = (effectKey, propKey, value) => {
    if (effectKey === "shadow") {
      handleChangeShadowValue(propKey, value);
    }
  };

  const handleBorderColorChange = (color) => {
    const updated = {
      ...effects.border,
      color,
    };
    setEffects((prev) => ({
      ...prev,
      border: updated,
    }));
  
    if (effects.border.enabled && selectedElement) {
      updateStyle({
        border: `${updated.value}px solid ${updated.color}`,
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
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Effects</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Blur Effect */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm">Blur</label>
          <div className="relative inline-block w-10 h-5">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={effects.blur.enabled}
              onChange={() => handleToggleEffect("blur")}
            />
            <span
              onClick={() => handleToggleEffect("blur")}
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                effects.blur.enabled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.blur.enabled ? "translate-x-5" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        {effects.blur.enabled && (
          <div className="flex items-center gap-2">
            <div className="w-full">
              <Slider
                min={0}
                max={50}
                value={effects.blur.value}
                onChange={(value) => handleChangeEffectValue("blur", value)}
                trackStyle={{ backgroundColor: "#3b82f6", height: 2 }}
                handleStyle={{
                  borderColor: "#3b82f6",
                  height: 12,
                  width: 12,
                  marginTop: -5,
                  backgroundColor: "#3b82f6",
                }}
                railStyle={{ backgroundColor: "#e5e7eb", height: 2 }}
              />
            </div>
            <input
              type="number"
              value={effects.blur.value}
              onChange={(e) =>
                handleChangeEffectValue("blur", Number.parseInt(e.target.value))
              }
              className="w-12 p-1 text-sm border rounded-md"
            />
          </div>
        )}
      </div>

      {/* Brightness Effect */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm">Brightness</label>
          <div className="relative inline-block w-10 h-5">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={effects.brightness.enabled}
              onChange={() => handleToggleEffect("brightness")}
            />
            <span
              onClick={() => handleToggleEffect("brightness")}
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                effects.brightness.enabled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.brightness.enabled ? "translate-x-5" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        {effects.brightness.enabled && (
          <div className="flex items-center gap-2">
            <div className="w-full">
              <Slider
                min={0}
                max={200}
                value={effects.brightness.value}
                onChange={(value) => handleChangeEffectValue("brightness", value)}
                trackStyle={{ backgroundColor: "#3b82f6", height: 2 }}
                handleStyle={{
                  borderColor: "#3b82f6",
                  height: 12,
                  width: 12,
                  marginTop: -5,
                  backgroundColor: "#3b82f6",
                }}
                railStyle={{ backgroundColor: "#e5e7eb", height: 2 }}
              />
            </div>
            <input
              type="number"
              value={effects.brightness.value}
              onChange={(e) =>
                handleChangeEffectValue(
                  "brightness",
                  Number.parseInt(e.target.value)
                )
              }
              className="w-12 p-1 text-sm border rounded-md"
            />
          </div>
        )}
      </div>

      {/* Sepia Effect */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm">Sepia</label>
          <div className="relative inline-block w-10 h-5">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={effects.sepia.enabled}
              onChange={() => handleToggleEffect("sepia")}
            />
            <span
              onClick={() => handleToggleEffect("sepia")}
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                effects.sepia.enabled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.sepia.enabled ? "translate-x-5" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        {effects.sepia.enabled && (
          <div className="flex items-center gap-2">
            <div className="w-full">
              <Slider
                min={0}
                max={100}
                value={effects.sepia.value}
                onChange={(value) => handleChangeEffectValue("sepia", value)}
                trackStyle={{ backgroundColor: "#3b82f6", height: 2 }}
                handleStyle={{
                  borderColor: "#3b82f6",
                  height: 12,
                  width: 12,
                  marginTop: -5,
                  backgroundColor: "#3b82f6",
                }}
                railStyle={{ backgroundColor: "#e5e7eb", height: 2 }}
              />
            </div>
            <input
              type="number"
              value={effects.sepia.value}
              onChange={(e) =>
                handleChangeEffectValue("sepia", Number.parseInt(e.target.value))
              }
              className="w-12 p-1 text-sm border rounded-md"
            />
          </div>
        )}
      </div>

      {/* Grayscale Effect */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm">Grayscale</label>
          <div className="relative inline-block w-10 h-5">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={effects.grayscale.enabled}
              onChange={() => handleToggleEffect("grayscale")}
            />
            <span
              onClick={() => handleToggleEffect("grayscale")}
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                effects.grayscale.enabled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.grayscale.enabled ? "translate-x-5" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        {effects.grayscale.enabled && (
          <div className="flex items-center gap-2">
            <div className="w-full">
              <Slider
                min={0}
                max={100}
                value={effects.grayscale.value}
                onChange={(value) => handleChangeEffectValue("grayscale", value)}
                trackStyle={{ backgroundColor: "#3b82f6", height: 2 }}
                handleStyle={{
                  borderColor: "#3b82f6",
                  height: 12,
                  width: 12,
                  marginTop: -5,
                  backgroundColor: "#3b82f6",
                }}
                railStyle={{ backgroundColor: "#e5e7eb", height: 2 }}
              />
            </div>
            <input
              type="number"
              value={effects.grayscale.value}
              onChange={(e) =>
                handleChangeEffectValue("grayscale", Number.parseInt(e.target.value))
              }
              className="w-12 p-1 text-sm border rounded-md"
            />
          </div>
        )}
      </div>

      {/* Border Effect */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm">Border</label>
          <div className="relative inline-block w-10 h-5">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={effects.border.enabled}
              onChange={() => handleToggleEffect("border")}
            />
            <span
              onClick={() => handleToggleEffect("border")}
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                effects.border.enabled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.border.enabled ? "translate-x-5" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        {effects.border.enabled && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-full">
                <Slider
                  min={0}
                  max={20}
                  value={effects.border.value}
                  onChange={(value) => handleChangeEffectValue("border", value)}
                  trackStyle={{ backgroundColor: "#3b82f6", height: 2 }}
                  handleStyle={{
                    borderColor: "#3b82f6",
                    height: 12,
                    width: 12,
                    marginTop: -5,
                    backgroundColor: "#3b82f6",
                  }}
                  railStyle={{ backgroundColor: "#e5e7eb", height: 2 }}
                />
              </div>
              <input
                type="number"
                value={effects.border.value}
                onChange={(e) =>
                  handleChangeEffectValue("border", Number.parseInt(e.target.value))
                }
                className="w-12 p-1 text-sm border rounded-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={effects.border.color}
                onChange={(e) => handleBorderColorChange(e.target.value)}
                className="w-8 h-8 p-0 border border-gray-300"
              />
            </div>
          </>
        )}
      </div>

      {/* Corner Radius Effect */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm">Corner Radius</label>
          <div className="relative inline-block w-10 h-5">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={effects.cornerRadius.enabled}
              onChange={() => handleToggleEffect("cornerRadius")}
            />
            <span
              onClick={() => handleToggleEffect("cornerRadius")}
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                effects.cornerRadius.enabled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.cornerRadius.enabled ? "translate-x-5" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        {effects.cornerRadius.enabled && (
          <div className="flex items-center gap-2">
            <div className="w-full">
              <Slider
                min={0}
                max={500}
                value={effects.cornerRadius.value}
                onChange={(value) =>
                  handleChangeEffectValue("cornerRadius", value)
                }
                trackStyle={{ backgroundColor: "#3b82f6", height: 2 }}
                handleStyle={{
                  borderColor: "#3b82f6",
                  height: 12,
                  width: 12,
                  marginTop: -5,
                  backgroundColor: "#3b82f6",
                }}
                railStyle={{ backgroundColor: "#e5e7eb", height: 2 }}
              />
            </div>
            <input
              type="number"
              value={effects.cornerRadius.value}
              onChange={(e) =>
                handleChangeEffectValue(
                  "cornerRadius",
                  Number.parseInt(e.target.value)
                )
              }
              className="w-12 p-1 text-sm border rounded-md"
            />
          </div>
        )}
      </div>

      {/* Shadow Effect */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm">Shadow</label>
          <div className="relative inline-block w-10 h-5">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={effects.shadow.enabled}
              onChange={() => handleToggleEffect("shadow")}
            />
            <span
              onClick={() => handleToggleEffect("shadow")}
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                effects.shadow.enabled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.shadow.enabled ? "translate-x-5" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        {effects.shadow.enabled && (
          <>
            {/* Shadow Blur */}
            <div className="ml-4 mb-2">
              <label className="block mb-1 text-xs">Blur</label>
              <div className="flex items-center gap-2">
                <div className="w-full">
                  <Slider
                    min={0}
                    max={50}
                    value={effects.shadow.blur}
                    onChange={(value) => handleChangeNestedEffectValue("shadow", "blur", value)}
                    trackStyle={{ backgroundColor: "#3b82f6", height: 2 }}
                    handleStyle={{
                      borderColor: "#3b82f6",
                      height: 12,
                      width: 12,
                      marginTop: -5,
                      backgroundColor: "#3b82f6",
                    }}
                    railStyle={{ backgroundColor: "#e5e7eb", height: 2 }}
                  />
                </div>
                <input
                  type="number"
                  value={effects.shadow.blur}
                  onChange={(e) =>
                    handleChangeNestedEffectValue("shadow", "blur", Number.parseInt(e.target.value))
                  }
                  className="w-12 p-1 text-sm border rounded-md"
                />
              </div>
            </div>

            {/* Shadow Offset X */}
            <div className="ml-4 mb-2">
              <label className="block mb-1 text-xs">Offset X</label>
              <div className="flex items-center gap-2">
                <div className="w-full">
                  <Slider
                    min={-50}
                    max={50}
                    value={effects.shadow.offsetX}
                    onChange={(value) => handleChangeShadowValue("offsetX", value)}
                    trackStyle={{ backgroundColor: "#3b82f6", height: 2 }}
                    handleStyle={{
                      borderColor: "#3b82f6",
                      height: 12,
                      width: 12,
                      marginTop: -5,
                      backgroundColor: "#3b82f6",
                    }}
                    railStyle={{ backgroundColor: "#e5e7eb", height: 2 }}
                  />
                </div>
                <input
                  type="number"
                  value={effects.shadow.offsetX}
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
            <div className="ml-4 mb-2">
              <label className="block mb-1 text-xs">Offset Y</label>
              <div className="flex items-center gap-2">
                <div className="w-full">
                  <Slider
                    min={-50}
                    max={50}
                    value={effects.shadow.offsetY}
                    onChange={(value) => handleChangeShadowValue("offsetY", value)}
                    trackStyle={{ backgroundColor: "#3b82f6", height: 2 }}
                    handleStyle={{
                      borderColor: "#3b82f6",
                      height: 12,
                      width: 12,
                      marginTop: -5,
                      backgroundColor: "#3b82f6",
                    }}
                    railStyle={{ backgroundColor: "#e5e7eb", height: 2 }}
                  />
                </div>
                <input
                  type="number"
                  value={effects.shadow.offsetY}
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
            <div className="ml-4 mb-2">
              <label className="block mb-1 text-xs">Opacity</label>
              <div className="flex items-center gap-2">
                <div className="w-full">
                  <Slider
                    min={0}
                    max={100}
                    value={effects.shadow.opacity}
                    onChange={(value) => handleChangeShadowValue("opacity", value)}
                    trackStyle={{ backgroundColor: "#3b82f6", height: 2 }}
                    handleStyle={{
                      borderColor: "#3b82f6",
                      height: 12,
                      width: 12,
                      marginTop: -5,
                      backgroundColor: "#3b82f6",
                    }}
                    railStyle={{ backgroundColor: "#e5e7eb", height: 2 }}
                  />
                </div>
                <input
                  type="number"
                  value={effects.shadow.opacity}
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
            <div className="ml-4 mb-2">
              <label className="block mb-1 text-xs">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={effects.shadow.color}
                  onChange={(e) => handleChangeShadowValue("color", e.target.value)}
                  className="w-8 h-8 p-0 border border-gray-300"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ImageEffectsTab;
