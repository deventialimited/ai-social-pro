
import { useMemo } from "react"
import { hardCodedShapes } from "../hooks/ShapesHooks"

function MaskPreview({ maskId, size = 40 }) {
  // Find the shape by ID
  const shape = useMemo(() => {
    return hardCodedShapes.find((s) => s.id === maskId) || hardCodedShapes[0]
  }, [maskId])

  // Render the SVG directly from the hardCodedShapes array
  return (
    <div
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{
        __html: shape.svg.replace(/currentColor/g, "#D3D3D3"), // Replace currentColor with a visible color
      }}
    />
  )
}

export default MaskPreview
