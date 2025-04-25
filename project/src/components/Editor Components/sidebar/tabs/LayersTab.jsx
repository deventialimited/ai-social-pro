import { Eye, EyeOff, Lock, Unlock, Trash } from "lucide-react";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";

function LayersTab() {
  const { layers, removeElement, handleLock, handleVisible } = useEditor();

  return (
    <div className="p-4">
      <h3 className="text-sm font-medium mb-2">
        Elements on your active page:
      </h3>

      <div className="space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className="flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50"
          >
            <div className="flex items-center gap-1 w-max">
              <span className="text-gray-500 text-lg">≡</span>
            </div>

            <div className="w-max capitalize text-xs text-gray-500">
              {layer.type}
            </div>

            <div className="flex-1 truncate text-sm">{layer.elementId}</div>

            <button
              onClick={() => handleVisible(layer.elementId)}
              className="text-gray-500 hover:text-gray-700"
            >
              {layer.visible ? (
                <Eye className="h-4 w-4" /> // Eye icon for visible state
              ) : (
                <EyeOff className="h-4 w-4" /> // Eye-off icon for hidden state
              )}
            </button>

            <button
              onClick={() => handleLock(layer.elementId)}
              className={`p-2 rounded-md hover:bg-gray-100 ${
                layer?.locked ? "bg-gray-300" : ""
              }`}
            >
              {layer?.locked ? (
                <Lock className="h-4 w-4 text-gray-600" /> // Red lock icon for locked state
              ) : (
                <Unlock className="h-4 w-4 text-gray-600" /> // Green unlock icon for unlocked state
              )}
            </button>

            <button
              onClick={() => removeElement(layer.elementId)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Trash className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LayersTab;
