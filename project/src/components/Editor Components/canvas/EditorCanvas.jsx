"use client"

import { useEffect, useRef, useState } from "react"
import { Copy, ChevronUp, ChevronDown, Trash } from "lucide-react"
import { useEditor } from "../EditorStoreHooks/FullEditorHooks"
import CanvasElement from "./CanvasElement"
import LoadingOverlay from "../common/LoadingOverlay"
import PanZoom from "react-easy-panzoom"

function EditorCanvas({
  canvasContainerRef,
  content,
  onElementSelect,
  selectedElementId,
  setSelectedElementId,
  setSpecialActiveTab,
  specialActiveTab,
}) {
  const { canvas, elements, isCanvasLoading } = useEditor()
  const [showSelectorOverlay, setShowSelectorOverlay] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showZoomDropdown, setShowZoomDropdown] = useState(false)
  const zoomLevels = [0.2, 0.3, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5]
  const containerRef = useRef(null)
  const panZoomRef = useRef(null)
  const [isPanZoomMounted, setIsPanZoomMounted] = useState(false)

  const handleSelectElement = (id, type) => {
    setSelectedElementId(id)
    onElementSelect(type)
  }

  useEffect(() => {
    if (specialActiveTab) {
      setSpecialActiveTab(null)
    }
  }, [selectedElementId])

  // Handle canvas click (background)
  const handleCanvasClick = (e) => {
    // Only select canvas if clicking directly on the canvas background
    if (e.target === e.currentTarget) {
      if (onElementSelect) {
        onElementSelect("canvas")
        setSelectedElementId(null)
        setShowSelectorOverlay(true)
        setSpecialActiveTab(null)
      }
    }
  }

  // Prevent default text selection behavior
  useEffect(() => {
    const handleSelectStart = (e) => {
      if (e.target.closest("#canvas")) {
        e.preventDefault()
      }
    }

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "a" && e.target.closest("#canvas")) {
        e.preventDefault()
      }
    }

    window.addEventListener("selectstart", handleSelectStart)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("selectstart", handleSelectStart)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".zoom-dropdown")) {
        setShowZoomDropdown(false)
      }
    }
    if (showZoomDropdown) {
      window.addEventListener("mousedown", handleClick)
    }
    return () => window.removeEventListener("mousedown", handleClick)
  }, [showZoomDropdown])

  // Track PanZoom mount status
  useEffect(() => {
    if (panZoomRef.current) {
      setIsPanZoomMounted(true)
    }
  }, [panZoomRef.current])

  // Center the canvas when zoom changes
  useEffect(() => {
    if (isPanZoomMounted && panZoomRef.current) {
      try {
        // Try to center the canvas
        if (typeof panZoomRef.current.autoCenter === "function") {
          panZoomRef.current.autoCenter()
        }
      } catch (error) {
        console.error("Error centering canvas:", error)
      }
    }
  }, [zoomLevel, isPanZoomMounted])

  // Center canvas on initial mount
  useEffect(() => {
    if (isPanZoomMounted && panZoomRef.current) {
      try {
        // Center the canvas initially
        if (typeof panZoomRef.current.autoCenter === "function") {
          panZoomRef.current.autoCenter()
        }
        // Also center after a short delay to ensure proper positioning
        const timer = setTimeout(() => {
          if (panZoomRef.current && typeof panZoomRef.current.autoCenter === "function") {
            panZoomRef.current.autoCenter()
          }
        }, 100)
        return () => clearTimeout(timer)
      } catch (error) {
        console.error("Error centering canvas:", error)
      }
    }
  }, [isPanZoomMounted])

  // Track two-finger zoom (pinch zoom)
  useEffect(() => {
    if (!containerRef.current) return

    const detectPinchZoom = () => {
      // Check if we can access the internal scale from PanZoom
      if (panZoomRef.current) {
        try {
          // Try different ways to access the scale
          let scale
          if (panZoomRef.current._stateStorage && panZoomRef.current._stateStorage.scale) {
            scale = panZoomRef.current._stateStorage.scale
          } else if (panZoomRef.current.instance && panZoomRef.current.instance.scale) {
            scale = panZoomRef.current.instance.scale
          } else if (panZoomRef.current.getTransform && typeof panZoomRef.current.getTransform === "function") {
            const transform = panZoomRef.current.getTransform()
            if (transform && transform.scale) {
              scale = transform.scale
            }
          }

          // If we found a scale and it's different from our current zoomLevel, update it
          if (scale && Math.abs(scale - zoomLevel) > 0.01) {
            setZoomLevel(scale)
          }
        } catch (error) {
          // Silently ignore errors
        }
      }
    }

    // Listen for touchmove events which might indicate pinch zoom
    const handleTouchMove = () => {
      // Use requestAnimationFrame to limit how often we check
      requestAnimationFrame(detectPinchZoom)
    }

    // Listen for wheel events which might indicate mouse wheel zoom
    const handleWheel = () => {
      // Use requestAnimationFrame to limit how often we check
      requestAnimationFrame(detectPinchZoom)
    }

    containerRef.current.addEventListener("touchmove", handleTouchMove, { passive: true })
    containerRef.current.addEventListener("wheel", handleWheel, { passive: true })

    // Also set up an interval as a fallback to periodically check the zoom level
    const intervalId = setInterval(detectPinchZoom, 200)

    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener("touchmove", handleTouchMove)
        containerRef.current.removeEventListener("wheel", handleWheel)
      }
      clearInterval(intervalId)
    }
  }, [zoomLevel])

  // Zoom controls
  const handleZoomIn = () => {
    if (panZoomRef.current) {
      // Get the current zoom level
      const currentZoom = zoomLevel

      // Find the next higher zoom level in our predefined levels
      const nextZoomIndex = zoomLevels.findIndex((level) => level > currentZoom)
      const newZoom = nextZoomIndex !== -1 ? zoomLevels[nextZoomIndex] : currentZoom * 1.2

      // Update our state
      setZoomLevel(newZoom)

      // Try to call the library's zoom method
      try {
        if (typeof panZoomRef.current.setZoom === "function") {
          panZoomRef.current.setZoom(newZoom)
        } else if (typeof panZoomRef.current.zoomIn === "function") {
          panZoomRef.current.zoomIn()
        }
      } catch (error) {
        console.error("Error zooming in:", error)
      }
    }
  }

  const handleZoomOut = () => {
    if (panZoomRef.current) {
      // Get the current zoom level
      const currentZoom = zoomLevel

      // Find the next lower zoom level in our predefined levels
      const zoomLevelsReversed = [...zoomLevels].reverse()
      const nextZoomIndex = zoomLevelsReversed.findIndex((level) => level < currentZoom)
      const newZoom = nextZoomIndex !== -1 ? zoomLevelsReversed[nextZoomIndex] : currentZoom * 0.8

      // Update our state
      setZoomLevel(newZoom)

      // Try to call the library's zoom method
      try {
        if (typeof panZoomRef.current.setZoom === "function") {
          panZoomRef.current.setZoom(newZoom)
        } else if (typeof panZoomRef.current.zoomOut === "function") {
          panZoomRef.current.zoomOut()
        }
      } catch (error) {
        console.error("Error zooming out:", error)
      }
    }
  }

  const handleZoomLevelClick = (level) => {
    // Update our state
    setZoomLevel(level)
    setShowZoomDropdown(false)

    // Try to call the library's zoom method
    if (panZoomRef.current) {
      try {
        if (typeof panZoomRef.current.setZoom === "function") {
          panZoomRef.current.setZoom(level)
        } else if (typeof panZoomRef.current.autoCenter === "function") {
          panZoomRef.current.autoCenter(1, level)
        }
      } catch (error) {
        console.error("Error setting zoom level:", error)
      }
    }
  }

  // Find the closest predefined zoom level for display
  const getDisplayZoomLevel = () => {
    // Find the closest predefined zoom level
    const closestZoomLevel = zoomLevels.reduce((prev, curr) => {
      return Math.abs(curr - zoomLevel) < Math.abs(prev - zoomLevel) ? curr : prev
    }, zoomLevels[0])

    // If we're very close to a predefined level, use that exact value
    if (Math.abs(closestZoomLevel - zoomLevel) < 0.05) {
      return Math.round(closestZoomLevel * 100)
    }

    // Otherwise, just round the current zoom level
    return Math.round(zoomLevel * 100)
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-gray-200 h-full"
      style={{
        position: "relative",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        overflow: "hidden"
      }}
    >
      {/* Canvas controls */}
      <div className="fixed top-32 right-4 float-right z-10 flex flex-col gap-1 ml-auto mr-4">
        <button className="p-1 bg-white rounded-md shadow hover:bg-gray-50">
          <Copy className="h-4 w-4" />
        </button>
        <button className="p-1 bg-white rounded-md shadow hover:bg-gray-50">
          <ChevronUp className="h-4 w-4" />
        </button>
        <button className="p-1 bg-white rounded-md shadow hover:bg-gray-50">
          <ChevronDown className="h-4 w-4" />
        </button>
        <button className="p-1 bg-white rounded-md shadow hover:bg-gray-50">
          <Trash className="h-4 w-4" />
        </button>
      </div>

      {/* Zoom controls */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-white rounded-full shadow px-2 z-40">
        <button onClick={handleZoomOut} className="p-2 hover:bg-gray-100 rounded-full">
          -
        </button>
        <div className="relative zoom-dropdown">
          <button className="w-16 text-center font-medium" onClick={() => setShowZoomDropdown((v) => !v)}>
            {getDisplayZoomLevel()}%
          </button>
          {showZoomDropdown && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded shadow z-50 flex flex-col zoom-dropdown">
              {zoomLevels.map((level) => (
                <button
                  key={level}
                  className={`px-4 py-1 hover:bg-gray-100 text-left ${
                    Math.abs(zoomLevel - level) < 0.05 ? "font-bold" : ""
                  }`}
                  onClick={() => handleZoomLevelClick(level)}
                >
                  {Math.round(level * 100)}%
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={handleZoomIn} className="p-2 hover:bg-gray-100 rounded-full">
          +
        </button>
      </div>

      {/* Canvas container with PanZoom */}
      <div className="absolute inset-0">
        <PanZoom
          ref={panZoomRef}
          minZoom={0.2}
          maxZoom={5}
          enableBoundingBox
          autoCenter
          style={{ 
            width: "100%", 
            height: "70vh",
            overflow: "hidden",
            position: "relative",
            marginBottom: "30px"
          }}
          boundaryRatioVertical={1}
          boundaryRatioHorizontal={1}
        >
          <div
            ref={canvasContainerRef}
            id="canvas"
            className="bg-white shadow-lg relative"
            style={{
              width: `${Math.max(Math.min(canvas.width / 3, 600))}px`,
              height: `${Math.max(Math.min(canvas.height / 3, 600))}px`,
              position: "relative",
              overflow: "hidden",
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...canvas.styles,
            }}
            onClick={handleCanvasClick}
          >
            {isCanvasLoading && <LoadingOverlay />}
            {elements?.map((el) => (
              <CanvasElement
                key={el.id}
                element={el}
                onSelect={handleSelectElement}
                isSelected={el.id === selectedElementId}
                showSelectorOverlay={showSelectorOverlay}
                setShowSelectorOverlay={setShowSelectorOverlay}
              />
            ))}
          </div>
        </PanZoom>
      </div>
    </div>
  )
}

export default EditorCanvas
