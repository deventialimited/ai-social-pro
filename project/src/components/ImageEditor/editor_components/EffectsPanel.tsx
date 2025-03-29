// @ts-nocheck
"use client"
import type React from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"

interface EffectsPanelProps {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  onBrightnessChange: (value: number) => void
  onContrastChange: (value: number) => void
  onSaturationChange: (value: number) => void
  onBlurChange: (value: number) => void
  onApplyPreset: (preset: { brightness: number; contrast: number; saturation: number; blur: number }) => void
  onReset: () => void
  onClose: () => void
}

const EffectsPanel: React.FC<EffectsPanelProps> = ({
  brightness,
  contrast,
  saturation,
  blur = 0,
  onBrightnessChange,
  onContrastChange,
  onSaturationChange,
  onBlurChange,
  onApplyPreset,
  onReset,
  onClose,
}) => {
  const presets = [
    { name: "Vivid", brightness: 110, contrast: 120, saturation: 130, blur: 0 },
    { name: "Muted", brightness: 90, contrast: 90, saturation: 70, blur: 0 },
    { name: "B&W", brightness: 100, contrast: 120, saturation: 0, blur: 0 },
    { name: "Warm", brightness: 105, contrast: 95, saturation: 110, blur: 0 },
    { name: "Cool", brightness: 95, contrast: 105, saturation: 90, blur: 0 },
    { name: "Vintage", brightness: 90, contrast: 85, saturation: 70, blur: 0 },
    { name: "Soft Focus", brightness: 105, contrast: 90, saturation: 95, blur: 5 },
  ]

  return (
    <div className="w-64 border-l bg-white h-full overflow-auto">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-lg font-medium">Effects</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="adjust" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="adjust">Adjust</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>

        <TabsContent value="adjust" className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Brightness</label>
              <span className="text-sm text-gray-500">{brightness}%</span>
            </div>
            <Slider
              value={[brightness]}
              min={0}
              max={200}
              step={1}
              onValueChange={(value) => onBrightnessChange(value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Contrast</label>
              <span className="text-sm text-gray-500">{contrast}%</span>
            </div>
            <Slider
              value={[contrast]}
              min={0}
              max={200}
              step={1}
              onValueChange={(value) => onContrastChange(value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Saturation</label>
              <span className="text-sm text-gray-500">{saturation}%</span>
            </div>
            <Slider
              value={[saturation]}
              min={0}
              max={200}
              step={1}
              onValueChange={(value) => onSaturationChange(value[0])}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">Blur</label>
              <span className="text-sm text-gray-500">{blur}px</span>
            </div>
            <Slider value={[blur]} min={0} max={20} step={1} onValueChange={(value) => onBlurChange(value[0])} />
          </div>

          <Button variant="outline" className="w-full mt-4" onClick={onReset}>
            Reset
          </Button>
        </TabsContent>

        <TabsContent value="presets" className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                className="h-auto py-2 justify-start"
                onClick={() => onApplyPreset(preset)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EffectsPanel
