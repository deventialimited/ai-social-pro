const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/domains`;
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
// Add a new domain
export const addDomain = async (domainData) => {
  try {
    const response = await axios.post(`${API_URL}/addDomain`, {
      client_email: domainData.client_email,
      clientWebsite: domainData.clientWebsite,
      clientName: domainData.clientName,
      clientDescription: domainData.clientDescription,
      industry: domainData.industry,
      niche: domainData.niche,
      colors: domainData.colors,
      userId: domainData.userId,
    });

    return response.data;
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


//update domain business
export const updateDomainBusiness = async (domainId, businessData) => {
  try {
    const response = await axios.patch(`${API_URL}/business/${domainId}`, {
      client_email: businessData.client_email,
      clientWebsite: businessData.clientWebsite,
      clientName: businessData.clientName,
      clientDescription: businessData.clientDescription,
      industry: businessData.industry,
      niche: businessData.niche,
    });

    return response.data;
  } catch (error) {
    console.log(error.response?.data?.error || "An error occurred");
    throw error.response?.data?.error;
  }
};


//update domain marketing strategy
export const updateDomainMarketingStrategy = async (domainId, marketingStrategy) => {
  try {
    const response = await axios.patch(`${API_URL}/marketing-strategy/${domainId}`, {
      marketingStrategy: {
        targetAudience: marketingStrategy.targetAudience,
        audiencePains: marketingStrategy.audiencePains,
        coreValues: marketingStrategy.coreValues
      }
    });

    return response.data;
  } catch (error) {
    console.log(error.response?.data?.error || "An error occurred");
    throw error.response?.data?.error;
  }
};
