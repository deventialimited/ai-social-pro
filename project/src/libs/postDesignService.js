import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || '';
const API_URL = "https://api.oneyearsocial.com";
// const API_URL = "http://localhost:4000";

// Save or update post design
export const saveOrUpdatePostDesign = async (postDesignData) => {
  try {
    // Ensure postId is a string
    const dataToSend = {
      ...postDesignData,
      postId: String(postDesignData.postId),
    };

    const response = await axios.post(
      `${API_URL}/api/v1/postsDesign/saveOrUpdatePostDesign`,
      dataToSend
    );
    return response.data;
  } catch (error) {
    console.error("Error saving post design:", error);
    throw error;
  }
};

// Get post design by ID
export const getPostDesignById = async (postId) => {
  try {
    // Ensure postId is a string
    const stringPostId = String(postId);
    const response = await axios.get(
      `${API_URL}/api/v1/postsDesign/${stringPostId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting post design:", error);
    throw error;
  }
};

// Transform editor data to post design schema
export const transformToPostDesignSchema = (editorData) => {
  const {
    shapes,
    backgroundColor,
    backgroundImage,
    postBody,
    history,
    historyIndex,
    imageScale,
    imagePosition,
    imageFilters,
    scaleX,
    scaleY,
    imageEffects,
    images,
  } = editorData;

  return {
    postId: String(editorData.post_id || "1"), // Ensure postId is a string
    canvas: {
      width: 800, // Default canvas width
      height: 600, // Default canvas height
      ratio: "4:3", // Default aspect ratio
      styles: {
        backgroundColor: backgroundColor || "#ffffff",
        backgroundImage: backgroundImage || null,
      },
    },
    elements: shapes.map((shape) => ({
      id: shape.id,
      type: shape.type,
      category: shape.category || "shape",
      position: {
        x: shape.x,
        y: shape.y,
      },
      size: {
        width: shape.width,
        height: shape.height,
      },
      rotation: shape.rotation || 0,
      opacity: shape.opacity || 1,
      zIndex: shape.zIndex || 1,
      styles: shape.styles || {},
      props: shape.props || {},
    })),
    layers: shapes.map((shape) => ({
      id: shape.id,
      name: shape.type,
      elementId: shape.id,
      visible: true,
      locked: false,
    })),
    backgrounds: {
      color: backgroundColor || "#ffffff",
      image: backgroundImage || null,
    },
    postBody,
    history,
    historyIndex,
    imageScale,
    imagePosition,
    imageFilters,
    scaleX,
    scaleY,
    imageEffects,
    images,
  };
};

// Transform post design schema to editor data
export const transformToEditorData = (postDesign) => {
  if (!postDesign) return null;

  return {
    shapes: postDesign.elements || [],
    backgroundColor: postDesign.backgrounds?.color || "#ffffff",
    backgroundImage: postDesign.backgrounds?.image || null,
    postBody: postDesign.postBody || "",
    history: postDesign.history || [],
    historyIndex: postDesign.historyIndex || -1,
    imageScale: postDesign.imageScale || 1,
    imagePosition: postDesign.imagePosition || { x: 0, y: 0 },
    imageFilters: postDesign.imageFilters || {
      brightness: 100,
      contrast: 100,
      saturation: 100,
    },
    scaleX: postDesign.scaleX || 1,
    scaleY: postDesign.scaleY || 1,
    imageEffects: postDesign.imageEffects || {
      blur: 0,
      brightness: 100,
      sepia: 0,
      grayscale: 0,
      border: 0,
      cornerRadius: 0,
      shadow: {
        blur: 0,
        offsetX: 0,
        offsetY: 0,
      },
    },
    images: postDesign.images || [],
  };
};

export const saveOrUpdatePostDesignFrontendController = async (
  postId,
  postImage,
  postDesignData,
  allFiles
) => {
  try {
    const formData = new FormData();
    const { elements, backgrounds } = postDesignData;

    formData.append("data", JSON.stringify(postDesignData));

    // Only include files for element types that require them
    const validElementIds = elements
      .filter((el) => ["image"].includes(el.type))
      .map((el) => el.id);

    // Only include background if type is "image" or "video"
    const includeBackgroundFile = ["image", "video"].includes(
      backgrounds?.type
    );

    allFiles.forEach((file) => {
      const isElementFile = validElementIds.includes(file.name);
      const isBackgroundFile =
        file.name === "background" && includeBackgroundFile;

      if (isElementFile || isBackgroundFile) {
        formData.append("files", file, file.name);
      }
    });
    // If postImage is provided, update the post image separately
    if (postImage) {
      const imageFormData = new FormData();
      imageFormData.append("image", postImage);

      await axios.patch(
        `${API_URL}/api/v1/posts/updatePostImage/${postId}`,
        imageFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    }
    const response = await axios.post(
      `${API_URL}/api/v1/postsDesign/saveOrUpdatePostDesign/${postId}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response?.data?.postDesign;
  } catch (error) {
    console.error("Error saving post design:", error);
    throw error;
  }
};
