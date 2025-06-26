import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, ChevronUp, ChevronDown, Trash } from "lucide-react";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import CanvasElement from "./CanvasElement";
import LoadingOverlay from "../common/LoadingOverlay";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { generateReplacedPostDesignValues } from "./helpers/generateReplacedPostDesignValues";
import useAlignmentGuides from "./helpers/useAlignmentGuides";
import AlignmentGuides from "./AlignmentGuides";

function EditorCanvas({
  canvasContainerRef,
  content,
  onElementSelect,
  selectedElementId,
  setSelectedElementId,
  setSpecialActiveTab,
  specialActiveTab,
}) {
  const {
    canvas,
    elements,
    isCanvasLoading,
    postOtherValues,
    selectedTemplateId,
    setSelectedTemplateId,
    setCanvasLoading,
    removeElement,
    allFiles,
    setElements,
    setCanvas,
    setLayers,
    setAllFiles,
    layers,
    backgrounds,
    setBackgrounds,
  } = useEditor();

  const [showSelectorOverlay, setShowSelectorOverlay] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showZoomDropdown, setShowZoomDropdown] = useState(false);
  const zoomLevels = [50, 75, 100, 150, 200, 300];
  const containerRef = useRef(null);
  const transformRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  const handleGenerate = useCallback(async () => {
    setCanvasLoading(true);
    const result = await generateReplacedPostDesignValues(postOtherValues, {
      canvas,
      elements,
      layers,
      backgrounds,
    });
    setCanvas(result?.canvas);
    setElements(result?.elements);
    setLayers(result?.layers);
    setAllFiles(result?.allFiles);
    setBackgrounds(result?.backgrounds);
    setSelectedTemplateId(null);
    setCanvasLoading(false);
  }, [postOtherValues, canvas, elements, layers, backgrounds]);
  // console.log(postOtherValues);
  console.log(elements);
  useEffect(() => {
    const shouldGenerate =
      selectedTemplateId &&
      (canvas ||
        elements?.length ||
        layers?.length ||
        Object.keys(backgrounds || {}).length);

    if (shouldGenerate) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }
    handleResize(); // set on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Add delete handler
  useEffect(() => {
    const handleDelete = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          selectedElementId &&
          !e.target.closest("input") &&
          !e.target.closest("textarea")
        ) {
          e.preventDefault();
          removeElement(selectedElementId);
          setSelectedElementId(null);
          setSpecialActiveTab(null);
        }
      }
    };

    window.addEventListener("keydown", handleDelete);
    return () => window.removeEventListener("keydown", handleDelete);
  }, [
    selectedElementId,
    removeElement,
    setSelectedElementId,
    setSpecialActiveTab,
  ]);

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

  // Prevent default text selection behavior
  useEffect(() => {
    const handleSelectStart = (e) => {
      if (e.target.closest("#canvas")) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "a" && e.target.closest("#canvas")) {
        e.preventDefault();
      }
    };

    window.addEventListener("selectstart", handleSelectStart);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("selectstart", handleSelectStart);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".zoom-dropdown")) {
        setShowZoomDropdown(false);
      }
    };
    if (showZoomDropdown) {
      window.addEventListener("mousedown", handleClick);
    }
    return () => window.removeEventListener("mousedown", handleClick);
  }, [showZoomDropdown]);

  // Alignment guides integration
  const { guides, getAlignmentGuides, snapToGuides, clearGuides } = useAlignmentGuides(elements);

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
        overflow: "hidden",
      }}
    >
      {/* Canvas controls */}
      {/* <div className="fixed md:top-32 md:mt-0 pt-12 md:right-4 right-8 float-right z-10 flex md:flex-col flex-row gap-1 ml-auto mr-4">
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
      </div> */}

      {/* Canvas container */}
      <div className="absolute inset-0">
        <TransformWrapper
          initialScale={1}
          minScale={0.2}
          maxScale={5}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
          panning={{ disabled: false, velocityDisabled: false }}
          doubleClick={{ disabled: true }}
          limitToBounds={true}
          ref={transformRef}
          onTransformed={({ state }) => {
            if (state && state.scale) {
              const newZoom = Math.round(state.scale * 100);
              setZoomLevel(newZoom);
            }
          }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="fixed md:bottom-6 bottom-20 right-6 flex items-center gap-2 bg-white rounded-full shadow px-2 z-40">
                <button
                  onClick={() => zoomOut()}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  -
                </button>
                <div className="relative zoom-dropdown">
                  <button
                    className="w-16 text-center font-medium"
                    // onClick={() => setShowZoomDropdown((v) => !v)}
                  >
                    {zoomLevel}%
                  </button>
                  {showZoomDropdown && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded shadow z-50 flex flex-col zoom-dropdown">
                      {zoomLevels.map((level) => (
                        <button
                          key={level}
                          className={`px-4 py-1 hover:bg-gray-100 text-left ${
                            zoomLevel === level ? "font-bold" : ""
                          }`}
                          onClick={() => {
                            const scale = level / 100;

                            if (
                              transformRef.current &&
                              containerRef.current &&
                              canvasContainerRef.current
                            ) {
                              let translateX = 0;
                              let translateY = 0;

                              // Set specific transform values based on zoom level
                              switch (level) {
                                case 50:
                                  translateX = 190.75;
                                  translateY = 133.75;
                                  break;
                                case 75:
                                  translateX = 93.88;
                                  translateY = 65.38;
                                  break;
                                case 100:
                                  translateX = 0;
                                  translateY = 0;
                                  break;
                                case 150:
                                  translateX = 0;
                                  translateY = -41.5667;
                                  break;
                                case 200:
                                  translateX = -623;
                                  translateY = -475;
                                  break;
                                case 300:
                                  translateX = -1246;
                                  translateY = -950;
                                  break;
                                default:
                                  // For any other zoom level, calculate dynamically
                                  const container = containerRef.current;
                                  const canvas = canvasContainerRef.current;
                                  const containerRect =
                                    container.getBoundingClientRect();
                                  const canvasRect =
                                    canvas.getBoundingClientRect();
                                  const scaledWidth = canvasRect.width * scale;
                                  const scaledHeight =
                                    canvasRect.height * scale;
                                  translateX =
                                    (containerRect.width - scaledWidth) / 2;
                                  translateY =
                                    (containerRect.height - scaledHeight) / 2;
                              }

                              transformRef.current.setTransform(
                                translateX,
                                translateY,
                                scale
                              );
                              setZoomLevel(level);
                              setShowZoomDropdown(false);
                            }
                          }}
                        >
                          {level}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => zoomIn()}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  +
                </button>
              </div>

              {/* <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: isMobile ? "50vh" : "70vh",
                  overflow: "hidden",
                  position: "relative",
                  marginBottom: "30px",
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <div
                  ref={canvasContainerRef}
                  id="#canvas"
                  className="bg-white shadow-lg relative"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    ...canvas.styles,
                    width: `${Math.max(Math.min(canvas.width / 3, 600))}px`,
                    height: `${Math.max(Math.min(canvas.height / 3, 600))}px`,
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
              </TransformComponent> */}

              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: isMobile ? "50vh" : "70vh",
                  overflow: "hidden",
                  position: "relative",
                  marginBottom: "30px",
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* Main visible canvas */}
                <div className="absolute left-0 z-10 right-0 top-0 bottom-0 flex items-center justify-center">
                  <div
                    ref={canvasContainerRef}
                    id="#canvas"
                    className="bg-white border-2 border-blue-500 shadow-lg overflow-hidden relative z-0"
                    style={{
                      ...canvas.styles,
                      width: `${Math.max(Math.min(canvas.width / 3, 600))}px`,
                      height: `${Math.max(Math.min(canvas.height / 3, 600))}px`,
                      boxSizing: "border-box", // 🟢 Add this line
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
                        getAlignmentGuides={getAlignmentGuides}
                        snapToGuides={snapToGuides}
                        clearGuides={clearGuides}
                        guides={guides}
                      />
                    ))}
                    {/* Alignment Guides Overlay (should be last for stacking) */}
                    <AlignmentGuides
                      guides={guides}
                      containerWidth={`${Math.max(
                        Math.min(canvas.width / 3, 600)
                      )}px`}
                      containerHeight={`${Math.max(
                        Math.min(canvas.height / 3, 600)
                      )}px`}
                    />
                  </div>
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
