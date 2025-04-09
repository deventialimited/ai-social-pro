const baseURL = "https://api.oneyearsocial.com";
// const baseURL = "http://localhost:4000";
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
      // Optimistically update UI
      queryClient.setQueryData(
        ["domains", updatedDomain?.userId],
        (oldData) => {
          if (!oldData) return [];
          return oldData.map((domain) =>
            domain._id === updatedDomain._id ? updatedDomain : domain
          );
        }
      );

      // Alternatively, refetch all domains after update
      // queryClient.invalidateQueries(["domains"]);
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
    const response = await axios.post(`${API_URL}/addDomain`, domainData);

    return response.data?.data;
  } catch (error) {
    console.log(error.response.data.error);
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
    return response.data?.data;
  } catch (error) {
    console.log(error.response?.data?.error || "Error fetching domains");
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
