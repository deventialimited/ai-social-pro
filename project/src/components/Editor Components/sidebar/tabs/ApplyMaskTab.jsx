"use client"

import { X, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks"
import MaskPreview from "./MaskPreview"
import { hardCodedShapes } from "../hooks/ShapesHooks"

function ApplyMaskTab({ onClose, selectedElementId }) {
  const [selectedElement, setSelectedElement] = useState(null)
  const [originalImage, setOriginalImage] = useState(null)
  const { updateElement, elements } = useEditor()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (selectedElementId) {
      const element = elements.find((el) => el.id === selectedElementId)
      setSelectedElement(element)

      // Store the original image when first selecting an element
      if (element && !originalImage) {
        const img = new Image()
        img.src = element.props.src
        img.crossOrigin = "anonymous" // Add this to avoid CORS issues
        img.onload = () => {
          setOriginalImage(img)
        }
      }
    }
  }, [elements, selectedElementId])

  // Filter shapes based on search query
  const filteredShapes = searchQuery
    ? hardCodedShapes.filter((shape) => shape.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : hardCodedShapes

  // Function to apply mask to the selected element
  const applyMask = (shapeId) => {
    if (!selectedElement || selectedElement.locked) return;

    // Find the selected shape
    const selectedShape = hardCodedShapes.find((shape) => shape.id === shapeId)
    if (!selectedShape) return

    // Create a canvas to apply the mask
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    // Set canvas dimensions to match the element
    canvas.width = selectedElement.styles.width || 300
    canvas.height = selectedElement.styles.height || 300

    // Draw the original image
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height)

    // Create a temporary canvas for the mask
    const maskCanvas = document.createElement("canvas")
    const maskCtx = maskCanvas.getContext("2d")
    maskCanvas.width = canvas.width
    maskCanvas.height = canvas.height

    // Draw the mask shape using the SVG from hardCodedShapes
    maskCtx.fillStyle = "#ffffff" // Use white for the mask

    // Create a temporary SVG element to draw the mask
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svgElement.setAttribute("width", canvas.width.toString())
    svgElement.setAttribute("height", canvas.height.toString())
    svgElement.setAttribute("viewBox", "0 0 100 100")
    svgElement.innerHTML = selectedShape.svg
      .replace(/<svg[^>]*>/, "")
      .replace("</svg>", "")
      .replace(/fill="currentColor"/g, 'fill="white"')

    // Convert SVG to a data URL
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)

    // Create an image from the SVG
    const maskImage = new Image()
    maskImage.crossOrigin = "anonymous" // Add this to avoid CORS issues

    // Use a promise to ensure the mask is loaded before applying
    const maskPromise = new Promise((resolve) => {
      maskImage.onload = () => {
        // Draw the mask image
        maskCtx.drawImage(maskImage, 0, 0, canvas.width, canvas.height)

        // Apply the mask using composite operation
        ctx.globalCompositeOperation = "destination-in"
        ctx.drawImage(maskCanvas, 0, 0)

        // Convert the canvas to a data URL
        const maskedImageUrl = canvas.toDataURL("image/png")

        // Update the element with the masked image
        updateElement(selectedElementId, {
          props: {
            ...selectedElement.props,
            src: maskedImageUrl,
            mask: shapeId,
            originalSrc: originalImage.src, // Store the original image source
          },
        })

        // Clean up
        URL.revokeObjectURL(svgUrl)
        resolve()
      }

      maskImage.src = svgUrl
    })

    // Handle any errors
    maskPromise.catch((error) => {
      console.error("Error applying mask:", error)
      URL.revokeObjectURL(svgUrl)
    })
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Mask image</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search masks..."
          className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 pb-10 gap-4">
        {filteredShapes.map((shape) => (
          <div
            key={shape.id}
            className="aspect-square rounded-md hover:bg-gray-200 cursor-pointer flex flex-col items-center justify-center p-2"
            onClick={() => applyMask(shape.id)}
          >
            <MaskPreview maskId={shape.id} size={60} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApplyMaskTab
