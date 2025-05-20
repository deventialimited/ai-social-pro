import { Save, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useEditor } from "../EditorStoreHooks/FullEditorHooks";
import * as htmlToImage from "html-to-image";
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
  isEditingTemplate = false,
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
      if (!node) {
        throw new Error("Canvas container not found");
      }

      // Wait for all images to load
      const images = node.getElementsByTagName('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve, reject) => {
              if (img.complete) {
                resolve();
              } else {
                img.onload = resolve;
                img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
              }
            })
        )
      );

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
        imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      });

      if (!blob) {
        throw new Error("Failed to convert canvas to image.");
      }

      const file = new File([blob], `canvas_${Date.now()}.webp`, {
        type: "image/webp",
      });

      // Preserve existing image IDs in postDesignData
      const updatedPostDesignData = {
        ...postDesignData,
        elements: postDesignData.elements.map(element => {
          if (element.type === 'image') {
            // Keep the existing ID for images
            return {
              ...element,
              id: element.id // Preserve the original ID
            };
          }
          return element;
        })
      };

      onSavePost.mutate(
        {
          postId,
          postImage: file,
          postDesignData: updatedPostDesignData,
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
    } catch (error) {
      setIsSavePostLoading(false);
      toast.error(error.message || "An error occurred while saving");
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
      if (!node) {
        throw new Error("Canvas container not found");
      }

      // Wait for all images to load
      const images = node.getElementsByTagName('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve, reject) => {
              if (img.complete) {
                resolve();
              } else {
                img.onload = resolve;
                img.onerror = () => reject(new Error(`Failed to load image: ${img.src}`));
              }
            })
        )
      );

      const scale = 5;
      const width = node.offsetWidth * scale;
      const height = node.offsetHeight * scale;

      // Configure htmlToImage with CORS settings
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
        imagePlaceholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        // Add CORS configuration
        cacheBust: true,
        filter: (node) => {
          // Skip problematic nodes if needed
          return true;
        },
        // Add fetch options for CORS
        fetchOptions: {
          mode: 'cors',
          credentials: 'include',
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        },
        // Add proxy configuration if needed
        proxy: null,
        // Add image loading options
        imageTimeout: 15000,
        // Add quality settings
        quality: 1,
        // Add pixel ratio
        pixelRatio: 2,
      });

      if (!blob) {
        throw new Error("Failed to convert canvas to image.");
      }

      const file = new File([blob], `canvas_${Date.now()}.webp`, {
        type: "image/webp",
      });

      // Preserve existing image IDs in templateDesignData
      const updatedTemplateDesignData = {
        ...postDesignData,
        elements: postDesignData.elements.map(element => {
          if (element.type === 'image') {
            return {
              ...element,
              id: element.id
            };
          }
          return element;
        })
      };

      onSaveTemplate.mutate(
        {
          id: isEditingTemplate ? postDesignData?._id : null,
          userId: user?._id,
          templateId: isEditingTemplate ? postDesignData?.templateId : `${user?.username}-${uuidv4()}`,
          templateType,
          templateImage: file,
          templateDesignData: updatedTemplateDesignData,
          allFiles,
        },
        {
          onSuccess: () => {
            setTimeout(() => {
              setIsSaveTemplateLoading(false);
              onClose();
              clearEditor();
              toast.success(isEditingTemplate ? "Template updated successfully" : `Template saved successfully as ${templateType}`);
            }, 3000);
          },
          onError: (error) => {
            toast.error(
              error?.response?.data?.message || (isEditingTemplate ? "Failed to update template" : "Failed to save template")
            );
            setIsSaveTemplateLoading(false);
            console.error("Error saving template design:", error);
          },
        }
      );
    } catch (error) {
      setIsSaveTemplateLoading(false);
      toast.error(error.message || "An error occurred while saving");
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

      <Dropdown
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
            <span>{isEditingTemplate ? "Updating template..." : "Saving as template..."}</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>{isEditingTemplate ? "Update Template" : "Save As Template"}</span>
          </>
        )}
      </button>
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
