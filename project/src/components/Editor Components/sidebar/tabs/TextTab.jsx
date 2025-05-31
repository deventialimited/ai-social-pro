import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import { createTextElement } from "../hooks/TextHooks";
function TextTab() {
  const { addElement } = useEditor();

  const handleAddText = (category) => {
    const newElement = createTextElement(category);
    addElement(newElement);
  };

  return (
    <div className="p-4">
      <h2
        onClick={() => handleAddText("header")}
        className="text-xl font-bold cursor-pointer mb-4"
      >
        Create header
      </h2>
      <h3
        onClick={() => handleAddText("sub-header")}
        className="text-lg mb-4 cursor-pointer"
      >
        Create sub header
      </h3>
      <p
        onClick={() => handleAddText("body")}
        className="text-sm mb-4 cursor-pointer"
      >
        Create body text
      </p>
      <p
        onClick={() => handleAddText("slogan")}
        className="text-sm mb-4 cursor-pointer"
      >
        Add a slogan text
      </p>
      <p
        onClick={() => handleAddText("brandName")}
        className="text-sm mb-4 cursor-pointer"
      >
        Add a business Name
      </p>

      {/* Text formatting options would go here */}
      <div className="mt-6">
        <button
          onClick={() => handleAddText("body")}
          className="w-full cursor-pointer py-2 px-4 border rounded-md hover:bg-gray-50 mb-2"
        >
          Add Text
        </button>
      </div>
    </div>
  );
}

export default TextTab;
