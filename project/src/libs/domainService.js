const baseURL = "https://api.oneyearsocial.com";
// const baseURL = "http://localhost:5000";
const API_URL = `${baseURL}/api/v1/domains`;
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateDomainBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDomain,
    onSuccess: (updatedDomain) => {
      // Optimistically update domains
      queryClient.setQueryData(
        ["domains", updatedDomain?.userId],
        (oldData) => {
          if (!oldData) return [];
          return oldData.map((domain) =>
            domain._id === updatedDomain._id ? updatedDomain : domain
          );
        }
      );

      // ✅ Invalidate posts related to this domain
      queryClient.invalidateQueries(["posts", updatedDomain._id]);
    },
  });
};

export const useUpdateDomainBrandInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBrandInfo,
    onSuccess: (updatedDomain) => {
      // Update domain cache
      queryClient.setQueryData(
        ["domains", updatedDomain?.userId],
        (oldData) => {
          if (!oldData) return [];
          return oldData.map((domain) =>
            domain._id === updatedDomain._id ? updatedDomain : domain
          );
        }
      );

      // ✅ Refetch posts to reflect new logo
      queryClient.invalidateQueries(["posts", updatedDomain._id]);
    },
  });
};

export const useAddDomainMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addDomain, // your API call
    onSuccess: (newDomain) => {
      queryClient.setQueryData(["domains", newDomain.userId], (oldDomains) => {
        if (!oldDomains) return [newDomain];
        return [...oldDomains, newDomain];
      });
    },
  });
};
// Add a new domain
export const addDomain = async (domainData) => {
  try {
    console.log("Adding domain:", domainData);
    const response = await axios.post(`${API_URL}/addDomain`, domainData);
    console.log("Domain added successfully:", response.data);
    return response.data?.data;
  } catch (error) {
    console.log(error);
    throw error.response?.data.error;
  }
};

// Get all domains
export const getAllDomains = async () => {
  try {
    const response = await axios.get(`${API_URL}/getAllDomains`);
    return response.data;
  } catch (error) {
    console.log(error.response.data.error);
    throw error.response?.data.error;
  }
};

// Get domain by ID
export const getDomainById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/getDomainById/${id}`);
    return response.data;
  } catch (error) {
    console.log(error.response.data.error);
    throw error.response?.data.error;
  }
};

// Get all domains by userId
export const getDomainsByUserId = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/getDomainsByUserId/${userId}`);
    console.log("Domains fetched successfully:", response.data);
    return response.data?.data;
  } catch (error) {
    console.log(error);
    throw error.response?.data?.error;
  }
};

export const useDomains = (userId) => {
  return useQuery({
    queryKey: ["domains", userId],
    queryFn: () => getDomainsByUserId(userId),
    enabled: !!userId, // Only run if userId exists
  });
};

// Delete domain
export const deleteDomain = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/deleteDomain/${id}`);
    return response.data;
  } catch (error) {
    console.log(error.response.data.error);
    throw error.response?.data.error;
  }
};

// update businessDomain
export const updateDomain = async (data) => {
  try {
    const response = await axios.patch(
      `${API_URL}/UpdateDomain/${data?.domainId}`,
      data?.domainData
    );

    return response.data?.data;
  } catch (error) {
    console.error(
      "Error updating domain data:",
      error.response?.data?.error || error.message
    );
    throw error.response?.data?.error || error.message;
  }
};

export const updateBrandInfo = async ({ domainId, logoFile, colors }) => {
  const formData = new FormData();
  if (logoFile) {
    formData.append("logo", logoFile);
  }
  if (colors) {
    formData.append("colors", colors.join(", "));
  }

  const response = await axios.patch(
    `${API_URL}/updateBrand/${domainId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
};

export const useUpdateDomainDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDomainDetails,
    onSuccess: (updatedDomain) => {
      // Optimistically update the domains cache
      queryClient.setQueryData(
        ["domains", updatedDomain?.userId],
        (oldData) => {
          if (!oldData) return [];
          return oldData.map((domain) =>
            domain._id === updatedDomain._id ? updatedDomain : domain
          );
        }
      );

      // Invalidate any posts related to this domain
      queryClient.invalidateQueries(["posts", updatedDomain._id]);
    },
    onError: (error) => {
      console.error("Domain update error:", error);
    },
  });
};

export const updateDomainDetails = async ({ domainId, formData, logoFile }) => {
  const formDataToSend = new FormData();
console.log('FORM DATA',formData)
  // Append all regular fields
  Object.entries(formData).forEach(([key, value]) => {
    // Skip marketingStrategy and siteLogo (handled separately)
    if (key !== "marketingStrategy" && key !== "siteLogo") {
      if (Array.isArray(value)) {
        // Handle color arrays and other arrays
        formDataToSend.append(key, JSON.stringify(value));
      } else if (typeof value === "object") {
        // Stringify any objects
        formDataToSend.append(key, JSON.stringify(value));
      } else {
        // Regular string/number values
        formDataToSend.append(key, value);
      }
    }
  });

  // Append marketing strategy fields individually
  if (formData.marketingStrategy) {
    Object.entries(formData.marketingStrategy).forEach(([key, value]) => {
      formDataToSend.append(`marketingStrategy[${key}]`, JSON.stringify(value));
    });
  }

  // Append logo file if exists
  if (logoFile) {
    formDataToSend.append("logo", logoFile);
  }

  const response = await axios.patch(
    `${API_URL}/UpdateDomainsDeatils/${domainId}`,
    formDataToSend,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
