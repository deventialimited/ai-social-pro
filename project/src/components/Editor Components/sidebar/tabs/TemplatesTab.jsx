import { useEffect, useRef, useState } from "react";
import { useGetAllTemplatesByUserId } from "../../../../libs/templateDesignService";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import { ChevronDown, ChevronRight } from "lucide-react";

const CATEGORIES = ["branding", "slogan"];

function TemplatesTab() {
  const {
    setCanvas,
    setElements,
    setLayers,
    setBackgrounds,
    setCanvasLoading,
    canvasLoading,
    pushToHistory,
    historyRef
  } = useEditor();

  const [userId, setUserId] = useState(null);
  const [category, setCategory] = useState("branding");
  const [showPrivate, setShowPrivate] = useState(true);
  const [showPublic, setShowPublic] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?._id) {
      setUserId(storedUser._id);
    }
  }, []);

  const { data, isLoading, isError, error, refetch } =
    useGetAllTemplatesByUserId(userId);

  const templates = Array.isArray(data) ? data : data?.templates ?? [];

  const privateTemplates = templates.filter(
    (t) => t.templateCategory === category && t.templateType === "private"
  );
  const publicTemplates = templates.filter(
    (t) => t.templateCategory === category && t.templateType === "public"
  );
  console.log(publicTemplates);
  const handleLoadTemplate = async (template) => {
    try {
      setCanvasLoading(true);
      
      // Create new state object with template data
      const newState = {
        ...historyRef.current.present,
        canvas: template.canvas || historyRef.current.present.canvas,
        elements: template.elements || historyRef.current.present.elements,
        layers: template.layers || historyRef.current.present.layers,
        backgrounds: template.backgrounds || historyRef.current.present.backgrounds
      };

      // Update states
      if (template.canvas) setCanvas(template.canvas);
      if (template.elements) setElements(template.elements);
      if (template.layers) setLayers(template.layers);
      if (template.backgrounds) setBackgrounds(template.backgrounds);

      // Add to history
      pushToHistory(newState);
      
      setCanvasLoading(false);
    } catch (error) {
      setCanvasLoading(false);
      console.error("Failed to load template:", error);
    }
  };

  useEffect(() => {
    if (userId) refetch();
  }, [userId, refetch]);

  return (
    <div className="p-4 h-full flex flex-col overflow-y-auto">
      {/* Category Tabs */}
    {/* Category Tabs */}
<div className="flex border-b mb-4">
  {CATEGORIES.map((tab) => (
    <button
      key={tab}
      onClick={() => setCategory(tab)}
      className={`flex-1 text-center py-2 text-sm font-medium transition-colors ${
        category === tab
          ? "border-b-2 border-black text-black"
          : "text-gray-500 hover:text-black"
      }`}
    >
      {tab.charAt(0).toUpperCase() + tab.slice(1)}
    </button>
  ))}
</div>


      {/* Status */}
      {isLoading && <div>Loading templates...</div>}
      {isError && (
        <div className="text-red-500">
          Error: {error?.message || "Could not load templates."}
        </div>
      )}
      {canvasLoading && (
        <div className="text-sm text-gray-600 mb-2">Loading template...</div>
      )}

      {/* Private Templates */}
      <div className="mb-4">
        <div
          className="flex items-center justify-between cursor-pointer select-none mb-2"
          onClick={() => setShowPrivate(!showPrivate)}
        >
          <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
            {showPrivate ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Private Templates
          </div>
        </div>
        {showPrivate && (
          privateTemplates.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {privateTemplates.map((template) => (
                <div
                  key={template._id}
                  className="aspect-square bg-gray-200 rounded-md overflow-hidden hover:opacity-80 cursor-pointer"
                  onClick={() => handleLoadTemplate(template)}
                >
                  <img
                    src={template.templateImage}
                    alt="Private Template"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No private templates found.</div>
          )
        )}
      </div>

      {/* Public Templates */}
      <div>
        <div
          className="flex items-center justify-between cursor-pointer select-none mb-2"
          onClick={() => setShowPublic(!showPublic)}
        >
          <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
            {showPublic ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Public Templates
          </div>
        </div>
        {showPublic && (
          publicTemplates.length > 0 ? (
            <div className="flex  gap-2 ">
              {publicTemplates.map((template) => (
                <div
                  key={template._id}
                  className=" h-max w-1/2 rounded-sm  overflow-hidden border border-gray-300 hover:opacity-80 cursor-pointer"
                  onClick={() => handleLoadTemplate(template)}
                >
                  <img
                    src={template.templateImage}
                    alt="Public Template"
                    className="w-full "
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">No public templates available.</div>
          )
        )}
      </div>
    </div>
  );
}

export default TemplatesTab;
