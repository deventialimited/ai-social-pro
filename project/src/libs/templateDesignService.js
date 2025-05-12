import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || '';
const API_URL = "https://api.oneyearsocial.com";
// const API_URL = "http://localhost:4000";

// Get post design by ID
export const getTemplateDesignById = async (templateId) => {
  try {
    const stringTemplateId = String(templateId);
    const response = await axios.get(
      `${API_URL}/api/v1/templateDesign/${stringTemplateId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting template design:", error);
    throw error;
  }
};

export const useSaveOrUpdateTemplateDesign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      templateId,
      templateType,
      templateImage,
      templateDesignData,
      allFiles,
    }) => {
      return await saveOrUpdateTemplateDesignFrontendController(
        id,
        templateId,
        templateType,
        templateImage,
        templateDesignData,
        allFiles
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["templateDesigns"]);
    },
    onError: (error) => {
      console.error("Failed to save/update template design:", error);
    },
  });
};

export const saveOrUpdateTemplateDesignFrontendController = async (
  id,
  templateId,
  templateType,
  templateImage,
  templateDesignData,
  allFiles
) => {
  try {
    const formData = new FormData();
    const { elements, backgrounds } = templateDesignData;

    formData.append("data", JSON.stringify(templateDesignData));

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
    formData.append("templateType", templateType);
    formData.append("templateId", templateId);
    formData.append("templateImage", templateImage, templateImage.name);
    console.log(formData);
    const response = await axios.post(
      `${API_URL}/api/v1/templateDesign/saveOrUpdateTemplateDesign/${id || ""}`,
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
