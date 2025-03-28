const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/v1/domains`;
import axios from 'axios';

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
      user: domainData.user
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