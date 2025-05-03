import { Save, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import domtoimage from "dom-to-image";
import {
  getPostDesignById,
  saveOrUpdatePostDesignFrontendController,
  useSaveOrUpdatePostDesign,
} from "../../../libs/postDesignService";
import { createImageElement } from "../sidebar/hooks/ImagesHooks";
import { presetSizes } from "../sidebar/tabs/SizeTab";

const TopHeaderBtns = ({
  setActiveElement,
  setSelectedElementId,
  setSpecialActiveTab,
  canvasContainerRef,
  onClose,
  postId,
  postImage,
  defaultPlatform,
}) => {
  const {
    postDesignData,
    allFiles,
    addElement,
    updateElement,
    addFile,
    clearEditor,
    setCanvas,
    setBackgrounds,
    setElements,
    setLayers,
    updateCanvasSize,
  } = useEditor();
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const onSave = useSaveOrUpdatePostDesign();
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
      onSave.mutate(
        {
          postId,
          postImage: file,
          postDesignData,
          allFiles,
        },
        {
          onSuccess: () => {
            setIsSaveLoading(false); // Runs regardless of success or error
          },
          onError: (error) => {
            console.error("Error saving design:", error);
          },
          onSettled: () => {
            onClose(); // Close only on success
            clearEditor();
          },
        }
      );
    } catch (error) {
      console.error("Error saving design:", error);
    }
  };
  const handleAddImage = async (src) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();

      const objectUrl = URL.createObjectURL(blob);
      const newElement = createImageElement(objectUrl); // includes a unique `id`
      addElement(newElement);

      const file = new File([blob], newElement.id, { type: blob.type });
      addFile(file);
      // 1. Get the canvas element by its id
      const canvasElement = document.getElementById("#canvas");

      if (!canvasElement) {
        console.log("Canvas element not found.");
        return;
      }

      // 2. Get the width and height of the canvas element
      const canvasWidth = canvasElement.offsetWidth;
      const canvasHeight = canvasElement.offsetHeight;
      // Update the selected element with the new z-index
      updateElement(newElement.id, {
        position: { x: 0, y: 0 },
        styles: {
          ...newElement.styles,
          width: canvasWidth,
          height: canvasHeight,
          zIndex: 0,
        },
      });
    } catch (error) {
      console.error("Failed to add image:", error);
    }
  };
  const fetchPostDesign = async () => {
    try {
      const res = await getPostDesignById(postId);
      setCanvas(res?.canvas);
      setElements(res?.elements);
      setLayers(res?.layers);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (postImage) {
      handleAddImage(postImage);
    } else if (postId) {
      fetchPostDesign();
    }
    if (defaultPlatform) {
      const platform = presetSizes.find((p) => p?.id === defaultPlatform);

      if (platform && platform?.dimensions) {
        const [width, height] = platform?.dimensions;
        updateCanvasSize(width, height);
      }
    }
  }, [postId, postImage, defaultPlatform]);
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          onClose();
          setTimeout(clearEditor(), 5000);
        }}
        className="px-4 py-1.5 border rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>

      {/* <div className="relative">
       <button className="flex items-center gap-2 px-4 py-1.5 border rounded-md hover:bg-gray-50">
         <span>Change to Video</span>
         <ChevronDown className="h-4 w-4" />
       </button>
     </div> */}

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
    </div>
  );
};

export default TopHeaderBtns;
