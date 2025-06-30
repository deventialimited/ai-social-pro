import { useRef } from "react";
import { useEditor } from "../../EditorStoreHooks/FullEditorHooks";
import { createTextElement } from "../hooks/TextHooks";
function TextTab() {
  const {
    addElement,
    postOtherValues,
    setCanvasLoading,
    zoomLevel,
    setZoomLevel,
  } = useEditor();

  const handleAddText = (category) => {
    if (zoomLevel !== 100) {
      setCanvasLoading(true);
      let previousZoomLevel = zoomLevel;
      // Switch to 100% zoom
      setZoomLevel(100);
      setTimeout(() => {
        const defaultText = "Add a Text";
        const text =
          category === "slogan"
            ? postOtherValues?.slogan || defaultText
            : category === "brandName"
            ? postOtherValues?.brandName || defaultText
            : defaultText;

        const newElement = createTextElement(category, text);
        addElement(newElement);
        setZoomLevel(previousZoomLevel);
        setCanvasLoading(false);
      }, 1000); // Simulate loading time
    } else {
      const defaultText = "Add a Text";
      const text =
        category === "slogan"
          ? postOtherValues?.slogan || defaultText
          : category === "brandName"
          ? postOtherValues?.brandName || defaultText
          : defaultText;

      const newElement = createTextElement(category, text);
      addElement(newElement);
    }
  };

  return (
    <div className="p-4 overflow-auto max-h-[30vh] sm:overflow-visible sm:max-h-none">
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
