import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useEffect, useRef, useState } from "react";
import {
  useDeleteTemplateDesignById,
  useGetAllTemplatesByUserId,
} from "../../../../libs/templateDesignService";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Plus,
  SquarePlus,
  Trash2,
} from "lucide-react";

const CATEGORIES = ["branding", "slogan", "general"];

function TemplatesTab() {
  const {
    setCanvas,
    setElements,
    setLayers,
    setBackgrounds,
    setCanvasLoading,
    canvasLoading,
    pushToHistory,
    historyRef,
  } = useEditor();
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const deleteTemplateMutation = useDeleteTemplateDesignById();
  const handleDeleteTemplate = (id) => {
    setDeletingId(id);
    deleteTemplateMutation.mutate(id, {
      onSettled: () => setDeletingId(null),
    });
  };

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
        backgrounds:
          template.backgrounds || historyRef.current.present.backgrounds,
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
            {showPrivate ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            Private Templates
          </div>
        </div>
        {showPrivate &&
          (privateTemplates.length > 0 ? (
            <div className="flex gap-2">
              {privateTemplates.map((template) => (
                <div
                  key={template._id}
                  className="relative group h-max w-1/2 rounded-sm  overflow-hidden border border-gray-300 cursor-pointer"
                >
                  <img
                    src={template.templateImage}
                    alt="Private Template"
                    className="w-full"
                  />
                  <div
                    className="absolute inset-0 bg-black bg-opacity-50 gap-2 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <div onClick={() => handleLoadTemplate(template)}>
                      <SquarePlus size={20} className="text-white" />
                    </div>
                    <div onClick={() => setConfirmDeleteId(template._id)}>
                      {deletingId === template._id ? (
                        <Loader2
                          size={20}
                          className="animate-spin text-white"
                        />
                      ) : (
                        <Trash2 size={20} className="text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              No private templates found.
            </div>
          ))}
      </div>

      {/* Public Templates */}
      <div>
        <div
          className="flex items-center justify-between cursor-pointer select-none mb-2"
          onClick={() => setShowPublic(!showPublic)}
        >
          <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
            {showPublic ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            Public Templates
          </div>
        </div>
        {showPublic &&
          (publicTemplates.length > 0 ? (
            <div className="flex  gap-2 ">
              {publicTemplates.map((template) => (
                <div
                  key={template._id}
                  className=" relative group h-max w-1/2 rounded-sm  overflow-hidden border border-gray-300 cursor-pointer"
                >
                  <img
                    src={template.templateImage}
                    alt="Public Template"
                    className="w-full "
                  />
                  <div
                    className="absolute inset-0 bg-black bg-opacity-50 gap-2 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <div onClick={() => handleLoadTemplate(template)}>
                      <SquarePlus size={20} className="text-white" />
                    </div>
                    {/* <div onClick={() => setConfirmDeleteId(template._id)}>
  {deletingId === template._id ? (
    <Loader2 size={20} className="animate-spin text-white" />
  ) : (
    <Trash2 size={20} className="text-white" />
  )}
</div>
 */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              No public templates available.
            </div>
          ))}
      </div>
      <Transition appear show={!!confirmDeleteId} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[99999999999999999]"
          onClose={() => setConfirmDeleteId(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Confirm Deletion
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this template? This action
                      cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                      onClick={() => {
                        handleDeleteTemplate(confirmDeleteId);
                        setConfirmDeleteId(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

export default TemplatesTab;
