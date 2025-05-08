import { useEffect, useRef, useState } from "react";
import { Copy, ChevronUp, ChevronDown, Trash } from "lucide-react";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import CanvasElement from "./CanvasElement";
import LoadingOverlay from "../common/LoadingOverlay";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

function EditorCanvas({
  canvasContainerRef,
  content,
  onElementSelect,
  selectedElementId,
  setSelectedElementId,
  setSpecialActiveTab,
  specialActiveTab,
}) {
  const { canvas, elements, isCanvasLoading } = useEditor();
  const [showSelectorOverlay, setShowSelectorOverlay] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const containerRef = useRef(null);
  const transformRef = useRef(null);
  const lastZoomLevel = useRef(100);

  const handleSelectElement = (id, type) => {
    setSelectedElementId(id);
    onElementSelect(type);
  };

  useEffect(() => {
    if (specialActiveTab) {
      setSpecialActiveTab(null);
    }
  }, [selectedElementId]);

  // Handle canvas click (background)
  const handleCanvasClick = (e) => {
    // Only select canvas if clicking directly on the canvas background
    if (e.target === e.currentTarget) {
      if (onElementSelect) {
        onElementSelect("canvas");
        setSelectedElementId(null);
        setShowSelectorOverlay(true);
        setSpecialActiveTab(null);
      }
    }
  };

  // Prevent default text selection behavior and improve event handling
  useEffect(() => {
    const handleSelectStart = (e) => {
      // Only prevent selection if clicking on canvas or elements
      if (e.target.closest("#canvas")) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      // Prevent Ctrl+A selection
      if (e.ctrlKey && e.key === "a" && e.target.closest("#canvas")) {
        e.preventDefault();
      }
    };

    const handleMouseDown = (e) => {
      // If clicking on canvas background, clear selection
      if (e.target.id === "#canvas") {
        setSelectedElementId(null);
        onElementSelect("canvas");
      }
    };

    const handleMouseUp = (e) => {
      // Clear any text selection that might have occurred
      window.getSelection()?.removeAllRanges();
    };

    window.addEventListener("selectstart", handleSelectStart);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("selectstart", handleSelectStart);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onElementSelect]);

  useEffect(() => {
    const handleZoomChange = () => {
      // Get the browser zoom level using multiple methods for better cross-browser support
      const browserZoom = Math.round(
        (window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI) * 100
      );

      // Only update if zoom level has actually changed
      if (browserZoom !== lastZoomLevel.current && transformRef.current) {
        const scale = browserZoom / 100;
        
        // Smoothly animate to the new zoom level
        transformRef.current.setTransform(
          0, // x position
          0, // y position
          scale,
          300 // animation duration in ms
        );
        
        setZoomLevel(browserZoom);
        lastZoomLevel.current = browserZoom;
      }
    };

    // Handle zoom changes through various events
    const handleResize = () => {
      requestAnimationFrame(handleZoomChange);
    };

    // Listen for zoom changes through multiple events
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // Use ResizeObserver for more reliable zoom detection
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initial zoom check
    handleZoomChange();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // Handle keyboard zoom shortcuts only when canvas is focused
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle zoom shortcuts if the canvas or its children are focused
      const isCanvasFocused = document.activeElement.closest('#canvas');
      
      if (isCanvasFocused && (e.ctrlKey || e.metaKey)) {
        if (e.key === '+' || e.key === '=') {
          e.preventDefault();
          if (transformRef.current) {
            transformRef.current.zoomIn();
          }
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          if (transformRef.current) {
            transformRef.current.zoomOut();
          }
        } else if (e.key === '0') {
          e.preventDefault();
          if (transformRef.current) {
            transformRef.current.resetTransform();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

      {/* Canvas container with centering and extra space for scrolling */}
      <div className="absolute inset-0">
        <TransformWrapper
          initialScale={1}
          minScale={0.2}
          maxScale={5}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
          panning={{ disabled: false, velocityDisabled: true }}
          doubleClick={{ disabled: true }}
          limitToBounds={true}
          ref={transformRef}
          onTransformed={({ state }) => {
            if (state && state.scale) {
              const newZoom = Math.round(state.scale * 100);
              setZoomLevel(newZoom);
              lastZoomLevel.current = newZoom;
            }
          }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-white rounded-full shadow px-2 z-40">
                <button
                  onClick={() => zoomOut()}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Zoom Out (Ctrl + -)"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <span className="w-16 text-center font-medium">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => resetTransform()}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Reset Zoom (Ctrl + 0)"
                >
                  Reset
                </button>
                <button
                  onClick={() => zoomIn()}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Zoom In (Ctrl + +)"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>

              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  position: "relative"
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}
              >
                <div
                  ref={canvasContainerRef}
                  id="#canvas"
                  className="bg-white shadow-lg relative"
                  style={{
                    width: `${Math.max(Math.min(canvas.width / 3, 600))}px`,
                    height: `${Math.max(Math.min(canvas.height / 3, 600))}px`,
                    position: "relative",
                    overflow: "hidden",
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
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}

export default EditorCanvas;
