import { X } from "lucide-react";
import { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

function ImageEffectsTab({ onClose }) {
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
    setEffects((prev) => ({
      ...prev,
      [effect]: {
        ...prev[effect],
        enabled: !prev[effect].enabled,
      },
    }));
  };

  const handleChangeEffectValue = (effect, value) => {
    setEffects((prev) => ({
      ...prev,
      [effect]: {
        ...prev[effect],
        value: value,
      },
    }));
  };

  const handleChangeShadowValue = (property, value) => {
    setEffects((prev) => ({
      ...prev,
      shadow: {
        ...prev.shadow,
        [property]: value,
      },
    }));
  };

  return (
    <div className="p-4 h-[400px] overflow-y-auto">
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
        <div className="flex items-center gap-2">
          <div className="w-full">
            <Slider
              min={0}
              max={50}
              value={effects.blur.value}
              onChange={(value) => handleChangeEffectValue("blur", value)}
              disabled={!effects.blur.enabled}
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
            disabled={!effects.blur.enabled}
          />
        </div>
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
        <div className="flex items-center gap-2">
          <div className="w-full">
            <Slider
              min={0}
              max={200}
              value={effects.brightness.value}
              onChange={(value) => handleChangeEffectValue("brightness", value)}
              disabled={!effects.brightness.enabled}
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
            disabled={!effects.brightness.enabled}
          />
        </div>
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
        <div className="flex items-center gap-2 mb-1">
          <div className="w-full">
            <Slider
              min={0}
              max={20}
              value={effects.border.value}
              onChange={(value) => handleChangeEffectValue("border", value)}
              disabled={!effects.border.enabled}
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
            disabled={!effects.border.enabled}
          />
          <div className="flex flex-col">
            <button className="px-1 py-0.5 text-xs border rounded-t-md hover:bg-gray-100">
              ▲
            </button>
            <button className="px-1 py-0.5 text-xs border rounded-b-md border-t-0 hover:bg-gray-100">
              ▼
            </button>
          </div>
        </div>
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
        <div className="flex items-center gap-2">
          <div className="w-full">
            <Slider
              min={0}
              max={500}
              value={effects.cornerRadius.value}
              onChange={(value) =>
                handleChangeEffectValue("cornerRadius", value)
              }
              disabled={!effects.cornerRadius.enabled}
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
            disabled={!effects.cornerRadius.enabled}
          />
        </div>
      </div>

      {/* Border Color */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={effects.border.color}
            onChange={(e) =>
              handleChangeEffectValue("border", {
                ...effects.border,
                color: e.target.value,
              })
            }
            className="w-8 h-8 p-0 border border-gray-300"
            disabled={!effects.border.enabled}
          />
        </div>
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

        {/* Shadow Blur */}
        <div className="ml-4 mb-2">
          <label className="block mb-1 text-xs">Blur</label>
          <div className="flex items-center gap-2">
            <div className="w-full">
              <Slider
                min={0}
                max={50}
                value={effects.shadow.blur}
                onChange={(value) => handleChangeShadowValue("blur", value)}
                disabled={!effects.shadow.enabled}
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
                handleChangeShadowValue("blur", Number.parseInt(e.target.value))
              }
              className="w-12 p-1 text-sm border rounded-md"
              disabled={!effects.shadow.enabled}
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
                disabled={!effects.shadow.enabled}
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
              disabled={!effects.shadow.enabled}
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
                disabled={!effects.shadow.enabled}
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
              disabled={!effects.shadow.enabled}
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
                disabled={!effects.shadow.enabled}
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
              disabled={!effects.shadow.enabled}
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
              disabled={!effects.shadow.enabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageEffectsTab;
