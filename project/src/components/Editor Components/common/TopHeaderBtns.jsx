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
import toast from "react-hot-toast";

const TopHeaderBtns = ({
  setActiveElement,
  setSelectedElementId,
  setSpecialActiveTab,
  canvasContainerRef,
  onClose,
  postId,
  postImage,
  defaultPlatform,
  postDetails,
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
    setCanvasLoading,
    setPostOtherValues,
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

      // --- High resolution image export ---
      const scale = 2;
      const style = window.getComputedStyle(node);
      const width = node.scrollWidth || parseInt(style.width);
      const height = node.scrollHeight || parseInt(style.height);

      const dataUrl = await domtoimage.toPng(node, {
        width: width * scale,
        height: height * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${width}px`,
          height: `${height}px`,
        },
      });

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
            setTimeout(() => {
              setIsSaveLoading(false);
              onClose();
              clearEditor();
              toast.success("Save Post Successfully");
            }, 3000);
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message);
            setIsSaveLoading(false);
            console.error("Error saving design:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error saving design:", error);
      setIsSaveLoading(false);
    }
  };

  const handleAddImage = async (src) => {
    try {
      setCanvasLoading(true);
      const response = await fetch(src, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const blob = await response.blob();

      const objectUrl = URL.createObjectURL(blob);
      const newElement = createImageElement(objectUrl);
      addElement(newElement);

      const file = new File([blob], newElement.id, { type: blob.type });
      addFile(file);

      const canvasElement = document.getElementById("#canvas");

      if (!canvasElement) {
        console.log("Canvas element not found.");
        return;
      }

      const canvasWidth = canvasElement.offsetWidth;
      const canvasHeight = canvasElement.offsetHeight;

      updateElement(newElement.id, {
        position: { x: 0, y: 0 },
        styles: {
          ...newElement.styles,
          width: canvasWidth,
          height: canvasHeight,
          zIndex: 0,
        },
      });
      setCanvasLoading(false);
    } catch (error) {
      setCanvasLoading(false);
      console.error("Failed to add image:", error);
    }
  };

  const fetchPostDesign = async () => {
    try {
      setCanvasLoading(true);
      const res = await getPostDesignById(postId);
      setCanvas(res?.canvas);
      setElements(res?.elements);
      setLayers(res?.layers);
      setCanvasLoading(false);
    } catch (error) {
      setCanvasLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (postDetails) {
      setPostOtherValues({
        siteLogo: postDetails?.domainId?.siteLogo,
        siteColors: postDetails?.domainId?.colors,
      });
    }
  }, [postDetails]);

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
