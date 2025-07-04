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
import { blobToDataURL } from "../canvas/helpers/generateReplacedPostDesignValues";
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

  const handleSavePostAndClose = async () => {
    setActiveElement("canvas");
    setSpecialActiveTab(null);
    setSelectedElementId(null);
    setIsSavePostLoading(true);
    setCanvasLoading(true);
    try {
      // Step 1: Send to API
      onSavePost.mutate(
        {
          postId,
          type,
          postDesignData,
          allFiles,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              setIsSavePostLoading(false);
              setCanvasLoading(false);
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
            setCanvasLoading(false);
            console.error("Error saving design:", error);
          },
        }
      );
      // console.log(URL.createObjectURL(file));
      // setIsSavePostLoading(false);
    } catch (error) {
      setIsSavePostLoading(false);
      setCanvasLoading(false);
      toast.error("An error occurred while saving");
      console.error("Error saving design:", error);
    }
  };
  const handleSaveTemplateAndClose = async () => {
    setActiveElement("canvas");
    setSpecialActiveTab(null);
    setSelectedElementId(null);
    setIsSaveTemplateLoading(true);
    setCanvasLoading(true);
    try {
      const platform = getPlatformIdBySize(
        postDesignData.canvas.width,
        postDesignData.canvas.height
      );
      onSaveTemplate.mutate(
        {
          userId: user?._id,
          templateId: `${user?.username}-${uuidv4()}`,
          templateType,
          templatePlatform: platform?.toLowerCase(),
          templateCategory,
          templateDesignData: postDesignData,
          allFiles,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              setIsSaveTemplateLoading(false);
              setCanvasLoading(false);
              // onClose();
              setActiveTab("templates");
              // clearEditor();
              toast.success("Template saved successfully");
            }, 3000);
          },
          onError: (error) => {
            toast.error(
              error?.response?.data?.message || "Failed to save template"
            );
            setIsSaveTemplateLoading(false);
            setCanvasLoading(false);
            console.error("Error saving template design:", error);
          },
        }
      );
    } catch (error) {
      setIsSaveTemplateLoading(false);
      setCanvasLoading(false);
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
      // const objectUrl = URL.createObjectURL(blob);
      const objectUrl = await blobToDataURL(blob);
      const newElement = createImageElement(objectUrl, "other", src);
      addElement(newElement);

      const file = new File([blob], newElement.id, { type: blob.type });

      addFile(file);

      const canvasElement = document.getElementById("canvas");
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
  console.log(postDesignData, allFiles);
  useEffect(() => {
    if (postDetails) {
      setPostOtherValues({
        platform: postDetails?.platform,
        siteLogo: postDetails?.domainId?.siteLogo,
        siteColors: postDetails?.domainId?.colors,
        brandName: postDetails?.domainId?.clientName,
        slogan: postDetails?.slogan,
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
