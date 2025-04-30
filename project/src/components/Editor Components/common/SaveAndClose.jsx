import { Save, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import domtoimage from "dom-to-image";
import { saveOrUpdatePostDesignFrontendController } from "../../../libs/postDesignService";

const SaveAndClose = ({
  setActiveElement,
  setSelectedElementId,
  setSpecialActiveTab,
  canvasContainerRef,
  onClose,
  postId = null,
}) => {
  const { postDesignData, allFiles } = useEditor();
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  const handleSaveAndClose = async () => {
    setActiveElement("canvas");
    setSpecialActiveTab(null);
    setSelectedElementId(null);
    setIsSaveLoading(true);

    try {
      const node = canvasContainerRef.current;
      const dataUrl = await domtoimage.toPng(node);

      // Convert base64 to File
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `canvas_${Date.now()}.png`, {
        type: "image/png",
      });
      console.log({
        postId,
        file, // postImage
        postDesignData,
        allFiles,
      });
      // Send everything to backend
      const response = await saveOrUpdatePostDesignFrontendController(
        postId,
        file, // postImage
        postDesignData,
        allFiles
      );
      console.log(response);
      onClose(); // Close the modal/drawer etc.
    } catch (error) {
      console.error("Error saving design:", error);
    } finally {
      setIsSaveLoading(false);
    }
  };

  return (
    <button
      onClick={handleSaveAndClose}
      disabled={isSaveLoading}
      className="flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
    >
      {isSaveLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </>
      ) : (
        <>
          <Save className="h-4 w-4" />
          <span>Save and Close</span>
        </>
      )}
    </button>
  );
};

export default SaveAndClose;
