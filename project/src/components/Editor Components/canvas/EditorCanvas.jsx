import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
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
    zoomLevel,
    setZoomLevel,
  } = useEditor();

  const [showSelectorOverlay, setShowSelectorOverlay] = useState(true);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [canvasRect, setCanvasRect] = useState(null);
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
  const { guides, getAlignmentGuides, snapToGuides, clearGuides } =
    useAlignmentGuides(
      elements,
      Math.max(Math.min(canvas?.width / 3, 600)) || 0,
      Math.max(Math.min(canvas?.height / 3, 600)) || 0
    );

  useLayoutEffect(() => {
    if (canvasContainerRef.current) {
      const updateRect = () => {
        setCanvasRect(canvasContainerRef.current.getBoundingClientRect());
      };
      updateRect();
      window.addEventListener("resize", updateRect);
      return () => window.removeEventListener("resize", updateRect);
    }
  }, [canvasContainerRef, scale, position]);

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
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div
          className="relative"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease-out",
          }}
        >
          <div
            ref={canvasContainerRef}
            id="canvas" // ✅ Fix the incorrect id (remove '#')
            className="bg-white border-2 border-blue-500 shadow-lg overflow-hidden relative z-0"
            style={{
              ...canvas?.styles,
              width: `${Math.max(Math.min(canvas?.width / 3, 600))}px`,
              height: `${Math.max(Math.min(canvas?.height / 3, 600))}px`,
              boxSizing: "border-box",
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
            <AlignmentGuides
              guides={guides}
              containerWidth={`${Math.max(Math.min(canvas?.width / 3, 600))}px`}
              containerHeight={`${Math.max(
                Math.min(canvas?.height / 3, 600)
              )}px`}
            />
          </div>
        </div>
        <div className="fixed md:bottom-6 bottom-20 right-6 flex items-center gap-2 bg-white rounded-full shadow px-2 z-40">
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 10, 10))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            -
          </button>
          <div className="relative zoom-dropdown">
            <button
              className="w-16 text-center font-medium"
              onClick={() => setShowZoomDropdown((v) => !v)}
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
                      setZoomLevel(level);
                      setShowZoomDropdown(false);
                    }}
                  >
                    {level}%
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 10, 500))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditorCanvas;
