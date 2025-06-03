import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || '';
const API_URL = "https://api.oneyearsocial.com";
// const API_URL = "http://localhost:5000";

// Get post design by ID
export const getPostDesignById = async (postId, type) => {
  try {
    // Ensure postId is a string
    const stringPostId = String(postId);
    const response = await axios.get(
      `${API_URL}/api/v1/postsDesign/${stringPostId}?type=${type}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting post design:", error);
    throw error;
  }
};

export const useSaveOrUpdatePostDesign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      type,
      postImage,
      postDesignData,
      allFiles,
    }) => {
      return await saveOrUpdatePostDesignFrontendController(
        postId,
        type,
        postImage,
        postDesignData,
        allFiles
      );
    },
    onSuccess: async ({ postDesign, latestPost }) => {
      const { domainId } = latestPost;
      if (domainId) {
        queryClient.invalidateQueries(["posts", domainId]);
      }
    },
    onError: (error) => {
      console.error("Failed to save/update post design:", error);
    },
  });
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
        `${API_URL}/api/v1/posts/updatePostImageFile/${postId}`,
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
    return response?.data;
  } catch (error) {
    console.error("Error saving post design:", error);
    throw error;
  }
};
