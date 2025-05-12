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
import { useSaveOrUpdateTemplateDesign } from "../../../libs/templateDesignService";
import { v4 as uuidv4 } from "uuid";
import Dropdown from "./Dropdown";
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
  const [isSavePostLoading, setIsSavePostLoading] = useState(false);
  const [isSaveTemplateLoading, setIsSaveTemplateLoading] = useState(false);
  const [templateType, setTemplateType] = useState("private");
  const onSavePost = useSaveOrUpdatePostDesign();
  const onSaveTemplate = useSaveOrUpdateTemplateDesign();
  const user = JSON.parse(localStorage?.getItem("user"));
  const handleSavePostAndClose = async () => {
    setActiveElement("canvas");
    setSpecialActiveTab(null);
    setSelectedElementId(null);
    setIsSavePostLoading(true);

    try {
      const node = canvasContainerRef.current;
      const dataUrl = await domtoimage.toPng(node);

      // Convert base64 to File
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `canvas_${Date.now()}.png`, {
        type: "image/png",
      });
      onSavePost.mutate(
        {
          postId,
          postImage: file,
          postDesignData,
          allFiles,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              setIsSavePostLoading(false); // Runs regardless of success or error
              onClose(); // Close only on success
              clearEditor();
              toast.success("Save Post Successfully");
            }, 3000);
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message);
            setIsSavePostLoading(false);
            console.error("Error saving design:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error saving design:", error);
    }
  };
  const handleSaveTemplateAndClose = async () => {
    setActiveElement("canvas");
    setSpecialActiveTab(null);
    setSelectedElementId(null);
    setIsSaveTemplateLoading(true);

    try {
      const node = canvasContainerRef.current;
      const dataUrl = await domtoimage.toPng(node);

      // Convert base64 to File
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `canvas_${Date.now()}.png`, {
        type: "image/png",
      });

      onSaveTemplate.mutate(
        {
          id: null,
          templateId: `${user?.username}-${uuidv4()}`,
          templateType,
          templateImage: file,
          templateDesignData: postDesignData,
          allFiles,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              setIsSaveTemplateLoading(false);
              onClose();
              clearEditor();
              toast.success("Template saved successfully");
            }, 3000);
          },
          onError: (error) => {
            toast.error(
              error?.response?.data?.message || "Failed to save template"
            );
            setIsSaveTemplateLoading(false);
            console.error("Error saving template design:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error capturing canvas for template:", error);
      setIsSaveTemplateLoading(false);
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

      {/* <div className="relative">
       <button className="flex items-center gap-2 px-4 py-1.5 border rounded-md hover:bg-gray-50">
         <span>Change to Video</span>
         <ChevronDown className="h-4 w-4" />
       </button>
     </div> */}
      {/* <Dropdown
        options={["private", "public"]}
        value={templateType}
        setValue={(value) => {
          setTemplateType(value);
        }}
      />
      <button
        onClick={handleSaveTemplateAndClose}
        disabled={isSaveTemplateLoading}
        className="flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
      >
        {isSaveTemplateLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving as template...</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>Save As Template</span>
          </>
        )}
      </button> */}
      <button
        onClick={handleSavePostAndClose}
        disabled={isSavePostLoading}
        className="flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
      >
        {isSavePostLoading ? (
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
