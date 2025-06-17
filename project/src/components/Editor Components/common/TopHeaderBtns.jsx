import { Save, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import * as htmlToImage from "html-to-image";
import { toPng } from "html-to-image";
import download from "downloadjs";

import {
  getPostDesignById,
  saveOrUpdatePostDesignFrontendController,
  useSaveOrUpdatePostDesign,
} from "../../../libs/postDesignService";
import { createImageElement } from "../sidebar/hooks/ImagesHooks";
import { getPlatformIdBySize, presetSizes } from "../sidebar/tabs/SizeTab";
import toast from "react-hot-toast";
import { useSaveOrUpdateTemplateDesign } from "../../../libs/templateDesignService";
import { v4 as uuidv4 } from "uuid";
import Dropdown from "./Dropdown";
import SaveDropdown from "./SaveDropdown";
import pica from "pica";
const TopHeaderBtns = ({
  setActiveElement,
  setSelectedElementId,
  setActiveTab,
  setSpecialActiveTab,
  canvasContainerRef,
  onClose,
  postId,
  postImage,
  type,
  defaultPlatform,
  postDetails,
}) => {
  console.log(defaultPlatform);
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

  // Helper: Converts image URL to a base64 data URL
  const convertImageToBase64 = (img) => {
    return new Promise((resolve, reject) => {
      const originalSrc = img.src;
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = originalSrc;

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        try {
          const dataURL = canvas.toDataURL();
          resolve({ img, dataURL });
        } catch (e) {
          reject(e);
        }
      };

      image.onerror = () => reject(`Failed to load image: ${originalSrc}`);
    });
  };

  const handleSavePostAndClose = async () => {
    setActiveElement("canvas");
    setSpecialActiveTab(null);
    setSelectedElementId(null);
    setIsSavePostLoading(true);

    try {
      const node = document.getElementById("#canvas");
      const scale = 5;
      const width = node.offsetWidth * scale;
      const height = node.offsetHeight * scale;
      if (!node) throw new Error("Canvas element not found");

      // Step 1: Convert all <img> in canvas to base64
      const imageTags = [...node.querySelectorAll("img")];
      const base64Conversions = await Promise.allSettled(
        imageTags.map(convertImageToBase64)
      );

      base64Conversions.forEach((res) => {
        if (res.status === "fulfilled") {
          const { img, dataURL } = res.value;
          img.setAttribute("data-original-src", img.src);
          img.src = dataURL;
        }
      });

      // Step 2: Convert canvas to PNG
      const dataUrl = await toPng(node, {
        cacheBust: true,
        skipFonts: true, // avoids trying to embed them
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
        pixelRatio: 2,
      });

      // Step 3: Restore original image srcs
      imageTags.forEach((img) => {
        const originalSrc = img.getAttribute("data-original-src");
        if (originalSrc) img.src = originalSrc;
      });

      // Step 4: Convert to Blob/File for backend upload
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      // Create image bitmap from the original blob
      const inputImage = await createImageBitmap(blob);

      // Create an offscreen canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      // Resize and apply unsharp mask using Pica
      await pica().resize(inputImage, canvas, {
        unsharpAmount: 100,
        unsharpRadius: 0.6,
        unsharpThreshold: 2,
      });

      // Convert sharpened canvas to blob
      const enhancedBlob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/webp");
      });

      // Create the final File object with enhanced sharpness
      const file = new File([enhancedBlob], `canvas_${Date.now()}.webp`, {
        type: "image/webp",
      });

      // Step 5: Send to API
      onSavePost.mutate(
        {
          postId,
          type,
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
            toast.error(
              error?.response?.data?.message || "Failed to save post"
            );
            setIsSavePostLoading(false);
            console.error("Error saving design:", error);
          },
        }
      );
      // console.log(URL.createObjectURL(file));
      // setIsSavePostLoading(false);
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

      // Create image bitmap from the original blob
      const inputImage = await createImageBitmap(blob);

      // Create an offscreen canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      // Resize and apply unsharp mask using Pica
      await pica().resize(inputImage, canvas, {
        unsharpAmount: 100,
        unsharpRadius: 0.6,
        unsharpThreshold: 2,
      });

      // Convert sharpened canvas to blob
      const enhancedBlob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/webp");
      });

      // Create the final File object with enhanced sharpness
      const file = new File([enhancedBlob], `canvas_${Date.now()}.webp`, {
        type: "image/webp",
      });
      const platform = getPlatformIdBySize(
        postDesignData.canvas.width,
        postDesignData.canvas.height
      );
      onSaveTemplate.mutate(
        {
          userId: user?._id,
          templateId: `${user?.username}-${uuidv4()}`,
          templateType,
          templatePlatform: platform,
          templateCategory,
          templateImage: file,
          templateDesignData: postDesignData,
          allFiles,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              setIsSaveTemplateLoading(false);
              // onClose();
              setActiveTab("templates");
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
      const newElement = createImageElement(objectUrl,"other",src); 
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
      const res = await getPostDesignById(postId, type);
      console.log(res);
      setCanvas(res?.canvas);
      setElements(res?.elements);
      setLayers(res?.layers);
      // Handle image elements
      const imageElements = (res?.elements || []).filter(
        (el) => el.type === "image"
      );

      for (const element of imageElements) {
        const src = element?.props?.src;
        if (!src) continue;

        try {
          const response = await fetch(src, {
            method: "GET",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          });

          const blob = await response.blob();
          const file = new File([blob], element.id, { type: blob.type });

          addFile(file);
        } catch (error) {
          console.error("Failed to fetch or process image:", element.id, error);
        }
      }

      setCanvasLoading(false);
    } catch (error) {
      setCanvasLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (postDetails) {
      setPostOtherValues({
        platforms: postDetails?.platforms,
        siteLogo: postDetails?.domainId?.siteLogo,
        siteColors: postDetails?.domainId?.colors,
        keywords:
          postDetails?.related_keywords?.length > 0
            ? [...postDetails?.related_keywords, postDetails?.domainId?.niche]
            : [postDetails?.domainId?.niche],
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
      const platform = presetSizes.find(
        (p) => p?.id?.toLowerCase() === defaultPlatform?.toLowerCase()
      );
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
            <span class="hidden sm:inline">Save and Close</span>
            <span class="inline sm:hidden">Save</span>
          </>
        )}
      </button>
    </div>
  );
};

export default TopHeaderBtns;
