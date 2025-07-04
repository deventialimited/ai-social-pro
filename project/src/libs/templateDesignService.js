import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || '';
const API_URL = "https://api.oneyearsocial.com";
// const API_URL = "http://localhost:5000";
export const useDeleteTemplateDesignById = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTemplateDesignById,
    onSuccess: (data, id) => {
      console.log("Successfully deleted template design:", id);

      // Invalidate queries for updated refetch
      queryClient.invalidateQueries(["templates", data.userId]);

      // Optional: Manually remove deleted design from the cache if needed
      queryClient.setQueryData(["templates", data.userId], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((design) => design._id !== id);
      });
    },
    onError: (error) => {
      console.error("Failed to delete template design:", error);
    },
  });
};

export const deleteTemplateDesignById = async (id) => {
  try {
    console.log("Deleting template design with ID:", id);
    const response = await axios.delete(
      `${API_URL}/api/v1/templateDesign/deleteTemplateDesign/${id}`
    );
    console.log("Template design deleted successfully:", response);
    return response.data;
  } catch (err) {
    console.error(
      "Error deleting template design",
      err.response?.data?.message || err.message
    );
    throw err.response?.data?.message || err.message;
  }
};

// Get post design by ID
export const getTemplateDesignById = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/v1/templateDesign/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting template design:", error);
    throw error;
  }
};

// Hook to fetch all posts for a domain
export const useGetAllTemplatesByUserId = (userId) => {
  return useQuery({
    queryKey: ["templates", userId], // Unique key for caching
    queryFn: () => getTemplateDesignById(userId),
    enabled: !!userId, // Only run if domainId exists
    onError: (error) => {
      console.error("Error fetching posts:", error);
    },
  });
};

export const useSaveOrUpdateTemplateDesign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      templateId,
      templateType,
      templatePlatform,
      templateCategory,

      templateDesignData,
      allFiles,
    }) => {
      return await saveOrUpdateTemplateDesignFrontendController(
        userId,
        templateId,
        templateType,
        templatePlatform,
        templateCategory,

        templateDesignData,
        allFiles
      );
    },
    onSuccess: async (data) => {
      // Invalidate the templates query for this user
      await queryClient.invalidateQueries(["templates", data?.userId]);

      // Immediately refetch the templates
      await queryClient.refetchQueries(["templates", data?.userId]);
    },
    onError: (error) => {
      console.error("Failed to save/update template design:", error);
    },
  });
};

export const saveOrUpdateTemplateDesignFrontendController = async (
  userId,
  templateId,
  templateType,
  templatePlatform,
  templateCategory,
  templateDesignData,
  allFiles
) => {
  try {
    console.log(
      userId,
      templateId,
      templateType,
      templatePlatform,
      templateCategory,
      templateDesignData,
      allFiles
    );
    const formData = new FormData();
    const { elements, backgrounds } = templateDesignData;
    const cleanedElements = elements.map((el) =>
      el.type === "image" ? { ...el, props: { ...el.props, src: null } } : el
    );
    formData.append(
      "data",
      JSON.stringify({
        ...templateDesignData,
        elements: cleanedElements,
        templateId,
        templateType,
        templatePlatform,
        templateCategory,
        userId,
      })
    );

    // Extract element IDs that need file uploads
    const validElementIds = elements
      .filter((el) => ["image"].includes(el.type))
      .map((el) => el.id);

    const includeBackgroundFile = ["image", "video"].includes(
      backgrounds?.type
    );

    // Attach only necessary files (elements or backgrounds)
    allFiles.forEach((file) => {
      const isElementFile = validElementIds.includes(file.name);
      const isBackgroundFile =
        file.name === "background" && includeBackgroundFile;

      if (isElementFile || isBackgroundFile) {
        formData.append("files", file, file.name);
      }
    });
    console.log(formData);

    const response = await axios.post(
      `${API_URL}/api/v1/templateDesign/saveOrUpdateTemplateDesign`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return response?.data;
  } catch (error) {
    console.error("Error saving template design:", error);
    throw error;
  }
};
