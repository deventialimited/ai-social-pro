import TextToolbar from "./toolbars/TextToolbar";
import ImageToolbar from "./toolbars/ImageToolbar";
import ShapeToolbar from "./toolbars/ShapeToolbar";
import CanvasToolbar from "./toolbars/CanvasToolbar";

function EditorToolbar({
  activeElement = "canvas",
  specialActiveTab,
  setSpecialActiveTab,
  selectedElementId,
  setSelectedElementId,
}) {
  // This would be determined by what's selected in the canvas
  // For now we'll use a prop to control it

  // Render the appropriate toolbar based on the active element
  const renderToolbar = () => {
    switch (activeElement) {
      case "text":
        return (
          <TextToolbar
            specialActiveTab={specialActiveTab}
            setSpecialActiveTab={setSpecialActiveTab}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
          />
        );
      case "image":
        return (
          <ImageToolbar
            specialActiveTab={specialActiveTab}
            setSpecialActiveTab={setSpecialActiveTab}
          />
        );
      case "shape":
        return <ShapeToolbar />;
      case "canvas":
      default:
        return <CanvasToolbar />;
    }
  };

  return (
    <div className="p-2 border-b flex w-full items-center gap-2 bg-white">
      {renderToolbar()}
    </div>
  );
}

export default EditorToolbar;
