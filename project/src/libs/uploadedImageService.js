const baseURL = "https://api.oneyearsocial.com";
// const baseURL = "http://localhost:4000";
const API_URL = `${baseURL}/api/v1/uploadedImage`;
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useUploadUserImageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadUserImage,
    onSuccess: (newImage) => {
      queryClient.setQueryData(
        ["uploadedImages", newImage.userId],
        (oldImages) => {
          if (!oldImages) return [newImage];
          return [newImage, ...oldImages];
        }
      );
    },
  });
};
// Upload a new image
export const uploadUserImage = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}/uploadUserImage`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data?.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data?.message || "Upload failed";
  }
};

// Updated `getUploadedImagesByUserId` function call wrapped in `useQuery`
export const useUploadedImagesQuery = (userId) => {
  return useQuery({
    queryKey: ["uploadedImages", userId], // Key for the query
    queryFn: () => getUploadedImagesByUserId(userId), // Function to fetch the data
    enabled: !!userId, // Only run the query if userId is available
    onSuccess: (data) => {
      console.log("Fetched uploaded images:", data);
    },
    onError: (error) => {
      console.error("Error fetching uploaded images:", error);
    },
  });
};
// Get all uploaded images for a user
export const getUploadedImagesByUserId = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/getUploadedImagesByUserId/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data?.message || "Fetching uploaded images failed";
  }
};
