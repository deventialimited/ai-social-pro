import { useEffect, useRef, useState } from "react";
import { useGetAllTemplatesByUserId } from "../../../../libs/templateDesignService";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";

function TemplatesTab() {
  const {
    setCanvas,
    setElements,
    setLayers,
    setBackgrounds,
    setCanvasLoading,
    canvasLoading,
    setPostDesignData,
  } = useEditor();
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState(null);
  const fileInputRef = useRef(null);

  // Set userId from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?._id) {
      setUserId(storedUser._id);
    }
  }, []);

  // Fetch templates by userId
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useGetAllTemplatesByUserId(userId);

  // Normalize templates
  const templates = Array.isArray(data) ? data : data?.templates ?? [];

  // Template handling
  const handleLoadTemplate = async (template) => {
    try {
      setCanvasLoading(true);

      // Store the complete template data including ID
      setPostDesignData({
        _id: template._id,
        templateId: template.templateId,
        canvas: template.canvas,
        elements: template.elements,
        layers: template.layers,
        backgrounds: template.backgrounds,
      });

      // Load the template data into the editor
      if (template.canvas) {
        setCanvas(template.canvas);
      }
      if (template.elements) {
        setElements(template.elements);
      }
      if (template.layers) {
        setLayers(template.layers);
      }
      if (template.backgrounds) {
        setBackgrounds(template.backgrounds);
      }

      setCanvasLoading(false);
    } catch (error) {
      setCanvasLoading(false);
      console.error("Failed to load template:", error);
    }
  };

  // Add a refetch effect when the component mounts
  useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [userId, refetch]);

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Optional Search Field (disabled) */}
      {/* 
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search Templates"
            className="w-full pl-9 pr-3 py-2 border rounded-md text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      */}

      {/* Loading/Error Messages */}
      {isLoading && <div>Loading templates...</div>}
      {isError && <div className="text-red-500">Error: {error?.message || "Could not load templates."}</div>}

      {/* Template Loading Indicator */}
      {canvasLoading && (
        <div className="text-sm text-gray-600 mb-2">Loading template...</div>
      )}

      {/* Gallery */}
      {!isLoading && !isError && (
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 2px)" }}>
          <div className="grid grid-cols-2 gap-2">
            {templates.length > 0 ? (
              templates.map((template) => (
                <div
                  key={template._id}
                  className="aspect-square bg-gray-200 rounded-md overflow-hidden hover:opacity-80 cursor-pointer"
                  onClick={() => handleLoadTemplate(template)}
                >
                  <img
                    src={template.templateImage}
                    alt="Template"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-500">
                No templates found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplatesTab;
