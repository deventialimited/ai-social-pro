// api/posts.js
import axios from "axios";
// Custom hook for fetching posts
import { useQuery } from "@tanstack/react-query";
const baseURL = "https://api.oneyearsocial.com";
// const baseURL = "http://localhost:4000";
const API_URL = `${baseURL}/api/v1/posts`;

// Fetch all posts for a domain
export const getAllPostsBydomainId = async (domainId) => {
  try {
    const response = await axios.get(
      `${API_URL}/getAllPostsBydomainId/${domainId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error; // Rethrow the error to be handled by the query
  }
};

// Hook to fetch all posts for a domain
export const useGetAllPostsByDomainId = (domainId) => {
  return useQuery({
    queryKey: ["posts", domainId], // Unique key for caching
    queryFn: () => getAllPostsBydomainId(domainId),
    enabled: !!domainId, // Only run if domainId exists
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes (300,000 ms)
    refetchIntervalInBackground: true,
    onError: (error) => {
      console.error("Error fetching posts:", error);
    },
  });
};
