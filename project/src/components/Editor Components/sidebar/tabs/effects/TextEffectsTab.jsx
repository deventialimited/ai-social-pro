import { X } from "lucide-react";
import { useState,useEffect } from "react";
import Slider from "rc-slider";
import { useEditor } from "../../../EditorStoreHooks/FullEditorHooks";
import "rc-slider/assets/index.css";

function TextEffectsTab({ onClose,selectedElementId }) {
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
    blur: { enabled: true, value: 0 },
    textStroke: { enabled: true, value: 2, color: "#808080" },
    background: {
      enabled: true,
      cornerRadius: 0,
      padding: 0,
      opacity: 100,
      color: "#FFFFFF",
    },
    shadow: {
      enabled: true,
      blur: 0,
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

  const handleChangeBackgroundValue = (property, value) => {
    setEffects((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        [property]: value,
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
    <div className="p-2 h-[400px] overflow-y-auto">
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
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs">Blur</label>
          <div className="relative inline-block w-8 h-4">
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
                className={`absolute h-3 w-3 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.blur.enabled ? "translate-x-4" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Slider
              min={0}
              max={50}
              value={effects.blur.value}
              onChange={(value) => handleChangeEffectValue("blur", value)}
              disabled={!effects.blur.enabled}
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

      {/* Text Stroke Effect */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs">Text Stroke</label>
          <div className="relative inline-block w-8 h-4">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={effects.textStroke.enabled}
              onChange={() => handleToggleEffect("textStroke")}
            />
            <span
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                effects.textStroke.enabled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-3 w-3 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.textStroke.enabled ? "translate-x-4" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gray-200 border border-gray-300 grid grid-cols-2 grid-rows-2">
            <div className="bg-white"></div>
            <div className="bg-gray-500"></div>
            <div className="bg-gray-500"></div>
            <div className="bg-white"></div>
          </div>
          <input
            type="number"
            value={effects.textStroke.value}
            onChange={(e) =>
              handleChangeEffectValue(
                "textStroke",
                Number.parseInt(e.target.value)
              )
            }
            className="w-12 p-1 text-sm border rounded-md"
            disabled={!effects.textStroke.enabled}
          />
          <div className="flex flex-col">
            <button className="px-1 py-0.5 border rounded-t-md hover:bg-gray-100 text-xs">
              ▲
            </button>
            <button className="px-1 py-0.5 border rounded-b-md border-t-0 hover:bg-gray-100 text-xs">
              ▼
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs">Color</label>
          <input
            type="color"
            value={effects.textStroke.color}
            onChange={(e) =>
              handleChangeEffectValue("textStroke", {
                ...effects.textStroke,
                color: e.target.value,
              })
            }
            className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer"
            disabled={!effects.textStroke.enabled}
          />
        </div>
      </div>

      {/* Background Effect */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs">Background</label>
          <div className="relative inline-block w-8 h-4">
            <input
              type="checkbox"
              className="opacity-0 w-0 h-0"
              checked={effects.background.enabled}
              onChange={() => handleToggleEffect("background")}
            />
            <span
              className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all ${
                effects.background.enabled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute h-3 w-3 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.background.enabled ? "translate-x-4" : ""
                }`}
              ></span>
            </span>
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
                value={effects.background.cornerRadius}
                onChange={(value) =>
                  handleChangeBackgroundValue("cornerRadius", value)
                }
                disabled={!effects.background.enabled}
              />
            </div>
            <input
              type="number"
              value={effects.background.cornerRadius}
              onChange={(e) =>
                handleChangeBackgroundValue(
                  "cornerRadius",
                  Number.parseInt(e.target.value)
                )
              }
              className="w-12 p-1 text-sm border rounded-md"
              disabled={!effects.background.enabled}
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
                value={effects.background.padding}
                onChange={(value) =>
                  handleChangeBackgroundValue("padding", value)
                }
                disabled={!effects.background.enabled}
              />
            </div>
            <input
              type="number"
              value={effects.background.padding}
              onChange={(e) =>
                handleChangeBackgroundValue(
                  "padding",
                  Number.parseInt(e.target.value)
                )
              }
              className="w-12 p-1 text-sm border rounded-md"
              disabled={!effects.background.enabled}
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
                value={effects.background.opacity}
                onChange={(value) =>
                  handleChangeBackgroundValue("opacity", value)
                }
                disabled={!effects.background.enabled}
              />
            </div>
            <input
              type="number"
              value={effects.background.opacity}
              onChange={(e) =>
                handleChangeBackgroundValue(
                  "opacity",
                  Number.parseInt(e.target.value)
                )
              }
              className="w-12 p-1 text-sm border rounded-md"
              disabled={!effects.background.enabled}
            />
          </div>
        </div>

        {/* Color */}
        <div className="ml-2 mb-2">
          <div className="flex items-center gap-2">
            <label className="text-xs">Color</label>
            <input
              type="color"
              value={effects.background.color}
              onChange={(e) =>
                handleChangeBackgroundValue("color", e.target.value)
              }
              className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer"
              disabled={!effects.background.enabled}
            />
          </div>
        </div>
      </div>

      {/* Shadow Effect */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs">Shadow</label>
          <div className="relative inline-block w-8 h-4">
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
                className={`absolute h-3 w-3 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.shadow.enabled ? "translate-x-4" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>

        {/* Shadow Blur */}
        <div className="ml-2 mb-2">
          <label className="block mb-1 text-xs">Blur</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Slider
                min={0}
                max={50}
                value={effects.shadow.blur}
                onChange={(value) => handleChangeShadowValue("blur", value)}
                disabled={!effects.shadow.enabled}
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
        <div className="ml-2 mb-2">
          <label className="block mb-1 text-xs">Offset X</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Slider
                min={-50}
                max={50}
                value={effects.shadow.offsetX}
                onChange={(value) => handleChangeShadowValue("offsetX", value)}
                disabled={!effects.shadow.enabled}
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
        <div className="ml-2 mb-2">
          <label className="block mb-1 text-xs">Offset Y</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Slider
                min={-50}
                max={50}
                value={effects.shadow.offsetY}
                onChange={(value) => handleChangeShadowValue("offsetY", value)}
                disabled={!effects.shadow.enabled}
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
        <div className="ml-2 mb-2">
          <label className="block mb-1 text-xs">Opacity</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Slider
                min={0}
                max={100}
                value={effects.shadow.opacity}
                onChange={(value) => handleChangeShadowValue("opacity", value)}
                disabled={!effects.shadow.enabled}
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
        <div className="ml-2 mb-2">
          <div className="flex items-center gap-2">
            <label className="text-xs">Color</label>
            <input
              type="color"
              value={effects.shadow.color}
              onChange={(e) => handleChangeShadowValue("color", e.target.value)}
              className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer"
              disabled={!effects.shadow.enabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextEffectsTab;
