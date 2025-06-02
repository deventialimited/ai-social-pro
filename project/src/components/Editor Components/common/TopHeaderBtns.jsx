import { Save, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import * as htmlToImage from "html-to-image";
import { toPng } from "html-to-image";
import download from 'downloadjs';

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
import SaveDropdown from "./SaveDropdown";

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
  const onSavePost = useSaveOrUpdatePostDesign();
  const onSaveTemplate = useSaveOrUpdateTemplateDesign();
  const user = JSON.parse(localStorage?.getItem("user"));
  const [templateType, setTemplateType] = useState("private");
  const [templateCategory, setTemplateCategory] = useState("branding");

  const handleDownloadImage = async () => {
    const node = document.getElementById('#canvas');
    console.log(node);
    if (!node) return;

    try {
      const dataUrl = await toPng(node, {
        cacheBust: true, // avoid stale image on re-renders
        style: {
          transform: 'scale(1)', // keep layout scale intact
          transformOrigin: 'top left',
        },
        pixelRatio: 2, // for higher resolution
      });
      console.log(dataUrl);

      download(dataUrl, 'canvas-export.png');
    } catch (error) {
      console.error('Error converting canvas to image:', error);
    }
  };
  
  const waitForImagesToLoad = async (container) => {
    const images = Array.from(container.getElementsByTagName('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalHeight !== 0) return;
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
      })
    );
  };
  
  const handleSavePostAndClose = async () => {
    setActiveElement("canvas");
    setSpecialActiveTab(null);
    setSelectedElementId(null);
    setIsSavePostLoading(true);
    await handleDownloadImage();
    return;
  
    try {
      // Replacing handleDownloadImage logic directly here
      const node = document.getElementById('#canvas'); // Remove '#' when using getElementById
      console.log(node);
      if (!node) throw new Error("Canvas element not found");
  
      // Wait for all images inside canvas to load
      await waitForImagesToLoad(node);
  
      const dataUrl = await toPng(node, {
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
        pixelRatio: 2,
      });
  
      // Convert Data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
  
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
              setIsSavePostLoading(false);
              onClose();
              clearEditor();
              toast.success("Post saved successfully");
            }, 3000);
          },
          onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to save post");
            setIsSavePostLoading(false);
            console.error("Error saving design:", error);
          },
        }
      );
    } catch (error) {
      setIsSavePostLoading(false);
      toast.error("An error occurred while saving");
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

      const scale = 5;
      const width = node.offsetWidth * scale;
      const height = node.offsetHeight * scale;

      const blob = await htmlToImage.toBlob(node, {
        skipFonts: true,
        width,
        height,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${node.offsetWidth}px`,
          height: `${node.offsetHeight}px`,
        },
        type: "image/webp",
      });

      if (!blob) {
        throw new Error("Failed to convert canvas to image.");
      }

      const file = new File([blob], `canvas_${Date.now()}.webp`, {
        type: "image/webp",
      });
      console.log(file);
      onSaveTemplate.mutate(
        {
          userId: user?._id,
          templateId: `${user?.username}-${uuidv4()}`,
          templateType,
          templateCategory,
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
      setIsSaveTemplateLoading(false);
      toast.error("An error occurred while saving");
      console.error("Error saving design:", error);
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
      if (!canvasElement) return;

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
      if (platform?.dimensions) {
        const [width, height] = platform.dimensions;
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
      <SaveDropdown
        onSave={handleSaveTemplateAndClose}
        isLoading={isSaveTemplateLoading}
        templateType={templateType}
        setTemplateType={setTemplateType}
        templateCategory={templateCategory}
        setTemplateCategory={setTemplateCategory}
      />



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
