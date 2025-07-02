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
    removeFileByName,
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

  const sortedLayers = useMemo(() => {
    return [...layers]
      .map(layer => {
        const element = elements.find(el => el.id === layer.elementId);
        return {
          ...layer,
          zIndex: element?.styles?.zIndex ?? 0,
          position: element?.position ?? { x: 0, y: 0 },
        };
      })
      .sort((a, b) => b.zIndex - a.zIndex); // Higher zIndex = top of list
  }, [layers, elements]);
  
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  
    const oldIndex = sortedLayers.findIndex(item => item.id === active.id);
    const newIndex = sortedLayers.findIndex(item => item.id === over.id);
  
    const newSorted = arrayMove(sortedLayers, oldIndex, newIndex);
  
    // Update zIndex based on new visual order
    newSorted.forEach((layer, index) => {
      const element = elements.find(el => el.id === layer.elementId);
      if (element) {
        updateElement(element.id, {
          styles: {
            ...element.styles,
            zIndex: newSorted.length - index,
          },
        });
      }
    });
  
    // Update layers order (though technically zIndex now drives render order)
    setLayers(newSorted.map(layer => {
      const { zIndex, position, ...cleanLayer } = layer; // remove injected props
      return cleanLayer;
    }));
  }
  
  

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h3 className="text-sm font-medium mb-2">
        Elements on your active page:
      </h3>

      <div
        className="space-y-2 h-max rounded-md bg-white"
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
  items={sortedLayers.map(layer => layer.id)}
  strategy={verticalListSortingStrategy}
>
  {sortedLayers.map((layer, index) => (
    <SortableItem
      key={layer.id}
      layer={layer}
      index={index}
      removeElement={removeElement}
                removeFileByName={removeFileByName}
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
  removeFileByName,
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
    position: "relative", // ✅ This makes transform work
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : "auto", // Optional: makes it show above other elements
    opacity: isDragging ? 0.5 : 1,      // Optional: visual feedback
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
        <span className="ml-2 text-xs text-gray-400">
          ({layer.position.x}, {layer.position.y})
        </span>
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
          if (layer.type === "image") {
            // If it's a file, remove the associated file as well
            removeFileByName(layer.elementId);
          }
        }}
        className="text-gray-500 hover:text-gray-700"
      >
        <Trash className="h-4 w-4" />
      </button>
    </div>
  );
}

export default LayersTab;
