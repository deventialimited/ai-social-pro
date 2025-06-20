import { Eye, EyeOff, Lock, Unlock, Trash } from "lucide-react";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { useMemo } from "react";

function LayersTab({ selectedElementId, setSelectedElementId, setActiveElement }) {
  const {
    layers,
    setLayers,
    removeElement,
    handleLock,
    handleVisible,
    updateElement,
    elements,
  } = useEditor();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Enable drag after 8px movement
      },
    })
  );

  const layerIds = useMemo(() => layers.map((layer) => layer.id), [layers]);

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLayers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update z-index of elements based on new layer order
        newItems.forEach((layer, index) => {
          const element = elements.find((el) => el.id === layer.elementId);
          if (element) {
            updateElement(element.id, {
              styles: {
                ...element.styles,
                zIndex: newItems.length - index, // Higher index = higher z-index
              },
            });
          }
        });

        return newItems;
      });
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-2">
        Elements on your active page:
      </h3>

      <div
        className="space-y-2 max-h-96 overflow-y-auto rounded-md bg-white hide-scrollbar"
        style={{ minHeight: 0 }}
      >
        <style>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }

          .hide-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}</style>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={layerIds}
            strategy={verticalListSortingStrategy}
          >
            {layers.map((layer, index) => (
              <SortableItem
                key={layer.id}
                layer={layer}
                index={index}
                removeElement={removeElement}
                handleLock={handleLock}
                handleVisible={handleVisible}
                selectedElementId={selectedElementId}
                setSelectedElementId={setSelectedElementId}
                setActiveElement={setActiveElement}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function SortableItem({
  layer,
  index,
  removeElement,
  handleLock,
  handleVisible,
  selectedElementId,
  setSelectedElementId,
  setActiveElement,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e) => {
    if (e.target.closest('button') || e.target.closest('.drag-handle')) return;
    setSelectedElementId(layer.elementId);
    setActiveElement(layer.type);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-md border hover:bg-gray-50 bg-white transition-shadow ${
        isDragging ? "shadow-lg" : ""
      }  ${
        selectedElementId === layer?.elementId ? "border-2 border-blue-500" : "border-gray-200"
      }`}
      onClick={handleClick}
    >
      {/* Drag Handle */}
      <div 
        className="drag-handle cursor-grab hover:bg-gray-100 p-1 rounded"
        {...listeners}
        {...attributes}
      >
        <span className="text-gray-500 text-lg">≡</span>
      </div>

      <div className="w-max capitalize text-xs text-gray-500">{layer.type}</div>

      {/* Element ID */}
      <div className="flex-1 truncate text-sm">
        {layer.elementId}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleVisible(layer.elementId);
        }}
        className="text-gray-500 hover:text-gray-700"
      >
        {layer.visible ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleLock(layer.elementId);
        }}
        className={`p-2 rounded-md hover:bg-gray-100 ${
          layer?.locked ? "bg-gray-300" : ""
        }`}
      >
        {layer?.locked ? (
          <Lock className="h-4 w-4 text-gray-600" />
        ) : (
          <Unlock className="h-4 w-4 text-gray-600" />
        )}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          removeElement(layer.elementId);
        }}
        className="text-gray-500 hover:text-gray-700"
      >
        <Trash className="h-4 w-4" />
      </button>
    </div>
  );
}

export default LayersTab;
