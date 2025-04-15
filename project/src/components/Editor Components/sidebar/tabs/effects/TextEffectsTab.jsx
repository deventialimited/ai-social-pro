import { X } from "lucide-react"
import { useState } from "react"

function TextEffectsTab({ onClose }) {
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
  })

  const handleToggleEffect = (effect) => {
    setEffects((prev) => ({
      ...prev,
      [effect]: {
        ...prev[effect],
        enabled: !prev[effect].enabled,
      },
    }))
  }

  const handleChangeEffectValue = (effect, value) => {
    setEffects((prev) => ({
      ...prev,
      [effect]: {
        ...prev[effect],
        value: value,
      },
    }))
  }

  const handleChangeBackgroundValue = (property, value) => {
    setEffects((prev) => ({
      ...prev,
      background: {
        ...prev.background,
        [property]: value,
      },
    }))
  }

  const handleChangeShadowValue = (property, value) => {
    setEffects((prev) => ({
      ...prev,
      shadow: {
        ...prev.shadow,
        [property]: value,
      },
    }))
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Effects</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Blur Effect */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-lg">Blur</label>
          <div className="relative inline-block w-12 h-6">
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
                className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.blur.enabled ? "translate-x-6" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="50"
            value={effects.blur.value}
            onChange={(e) => handleChangeEffectValue("blur", Number.parseInt(e.target.value))}
            className="w-full"
            disabled={!effects.blur.enabled}
          />
          <input
            type="number"
            value={effects.blur.value}
            onChange={(e) => handleChangeEffectValue("blur", Number.parseInt(e.target.value))}
            className="w-16 p-2 border rounded-md"
            disabled={!effects.blur.enabled}
          />
        </div>
      </div>

      {/* Text Stroke Effect */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-lg">Text Stroke</label>
          <div className="relative inline-block w-12 h-6">
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
                className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.textStroke.enabled ? "translate-x-6" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gray-200 border border-gray-300 grid grid-cols-2 grid-rows-2">
            <div className="bg-white"></div>
            <div className="bg-gray-500"></div>
            <div className="bg-gray-500"></div>
            <div className="bg-white"></div>
          </div>
          <input
            type="number"
            value={effects.textStroke.value}
            onChange={(e) => handleChangeEffectValue("textStroke", Number.parseInt(e.target.value))}
            className="w-full p-2 border rounded-md"
            disabled={!effects.textStroke.enabled}
          />
          <div className="flex flex-col">
            <button className="px-2 py-1 border rounded-t-md hover:bg-gray-100">▲</button>
            <button className="px-2 py-1 border rounded-b-md border-t-0 hover:bg-gray-100">▼</button>
          </div>
        </div>
      </div>

      {/* Background Effect */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-lg">Background</label>
          <div className="relative inline-block w-12 h-6">
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
                className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.background.enabled ? "translate-x-6" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>

        {/* Corner Radius */}
        <div className="ml-4 mb-4">
          <label className="block mb-1">Corner radius</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={effects.background.cornerRadius}
              onChange={(e) => handleChangeBackgroundValue("cornerRadius", Number.parseInt(e.target.value))}
              className="w-full"
              disabled={!effects.background.enabled}
            />
            <input
              type="number"
              value={effects.background.cornerRadius}
              onChange={(e) => handleChangeBackgroundValue("cornerRadius", Number.parseInt(e.target.value))}
              className="w-16 p-2 border rounded-md"
              disabled={!effects.background.enabled}
            />
          </div>
        </div>

        {/* Padding */}
        <div className="ml-4 mb-4">
          <label className="block mb-1">Padding</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={effects.background.padding}
              onChange={(e) => handleChangeBackgroundValue("padding", Number.parseInt(e.target.value))}
              className="w-full"
              disabled={!effects.background.enabled}
            />
            <input
              type="number"
              value={effects.background.padding}
              onChange={(e) => handleChangeBackgroundValue("padding", Number.parseInt(e.target.value))}
              className="w-16 p-2 border rounded-md"
              disabled={!effects.background.enabled}
            />
          </div>
        </div>

        {/* Opacity */}
        <div className="ml-4 mb-4">
          <label className="block mb-1">Opacity</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={effects.background.opacity}
              onChange={(e) => handleChangeBackgroundValue("opacity", Number.parseInt(e.target.value))}
              className="w-full"
              disabled={!effects.background.enabled}
            />
            <input
              type="number"
              value={effects.background.opacity}
              onChange={(e) => handleChangeBackgroundValue("opacity", Number.parseInt(e.target.value))}
              className="w-16 p-2 border rounded-md"
              disabled={!effects.background.enabled}
            />
          </div>
        </div>

        {/* Color */}
        <div className="ml-4 mb-4">
          <label className="block mb-1">Color</label>
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 border border-gray-300"
              style={{ backgroundColor: effects.background.color }}
            ></div>
          </div>
        </div>
      </div>

      {/* Shadow Effect */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-lg">Shadow</label>
          <div className="relative inline-block w-12 h-6">
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
                className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all ${
                  effects.shadow.enabled ? "translate-x-6" : ""
                }`}
              ></span>
            </span>
          </div>
        </div>

        {/* Shadow Blur */}
        <div className="ml-4 mb-4">
          <label className="block mb-1">Blur</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="50"
              value={effects.shadow.blur}
              onChange={(e) => handleChangeShadowValue("blur", Number.parseInt(e.target.value))}
              className="w-full"
              disabled={!effects.shadow.enabled}
            />
            <input
              type="number"
              value={effects.shadow.blur}
              onChange={(e) => handleChangeShadowValue("blur", Number.parseInt(e.target.value))}
              className="w-16 p-2 border rounded-md"
              disabled={!effects.shadow.enabled}
            />
          </div>
        </div>

        {/* Shadow Offset X */}
        <div className="ml-4 mb-4">
          <label className="block mb-1">Offset X</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-50"
              max="50"
              value={effects.shadow.offsetX}
              onChange={(e) => handleChangeShadowValue("offsetX", Number.parseInt(e.target.value))}
              className="w-full"
              disabled={!effects.shadow.enabled}
            />
            <input
              type="number"
              value={effects.shadow.offsetX}
              onChange={(e) => handleChangeShadowValue("offsetX", Number.parseInt(e.target.value))}
              className="w-16 p-2 border rounded-md"
              disabled={!effects.shadow.enabled}
            />
          </div>
        </div>

        {/* Shadow Offset Y */}
        <div className="ml-4 mb-4">
          <label className="block mb-1">Offset Y</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-50"
              max="50"
              value={effects.shadow.offsetY}
              onChange={(e) => handleChangeShadowValue("offsetY", Number.parseInt(e.target.value))}
              className="w-full"
              disabled={!effects.shadow.enabled}
            />
            <input
              type="number"
              value={effects.shadow.offsetY}
              onChange={(e) => handleChangeShadowValue("offsetY", Number.parseInt(e.target.value))}
              className="w-16 p-2 border rounded-md"
              disabled={!effects.shadow.enabled}
            />
          </div>
        </div>

        {/* Shadow Opacity */}
        <div className="ml-4 mb-4">
          <label className="block mb-1">Opacity</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={effects.shadow.opacity}
              onChange={(e) => handleChangeShadowValue("opacity", Number.parseInt(e.target.value))}
              className="w-full"
              disabled={!effects.shadow.enabled}
            />
            <input
              type="number"
              value={effects.shadow.opacity}
              onChange={(e) => handleChangeShadowValue("opacity", Number.parseInt(e.target.value))}
              className="w-16 p-2 border rounded-md"
              disabled={!effects.shadow.enabled}
            />
          </div>
        </div>

        {/* Shadow Color */}
        <div className="ml-4 mb-4">
          <label className="block mb-1">Color</label>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 border border-gray-300" style={{ backgroundColor: effects.shadow.color }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextEffectsTab
