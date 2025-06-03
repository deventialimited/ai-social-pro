  // api/posts.js
  import axios from "axios";
  // Custom hook for fetching posts
  import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
  const baseURL = "https://api.oneyearsocial.com";
  // const baseURL = "http://localhost:5000";
  
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

  // Hook to update a post
  export const useUpdatePostById = () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: updatePost,
      onSuccess: (updatedPost) => {
        // Update the list of posts for the domain (if applicable)
        queryClient.setQueryData(["posts", updatedPost.domainId], (oldData) => {
          if (!oldData) return [];
          return oldData.map((post) =>
            post._id === updatedPost._id ? updatedPost : post
          );
        });
        // Invalidate queries to refetch the latest data
        queryClient.invalidateQueries(["posts", updatedPost.domainId]); // Invalidate posts for the domain
      },
      onError: (error) => {
        console.error("Failed to update post:", error);
      },
    });
  };
  // Update a post
  export const updatePost = async ({ id, postData }) => {
    try {
      const response = await axios.put(`${API_URL}/updatePost/${id}`, postData);

      return response.data?.post; // Return the updated post from the response
    } catch (error) {
      console.error(
        "Error updating post:",
        error.response?.data?.message || error.message
      );
      throw error.response?.data?.message || error.message;
    }
  };

  //fetching first post of the domain
  export const getFirstPost = async (id) => {
    try {
      console.log("getting first post of the domain", id);
      const response = await axios.get(`${API_URL}/getFirstPost/${id}`);
      return response.data;
    } catch (err) {
      console.error(
        "Error getting first post",
        err.response?.data?.message || err.message
      );
      throw err.response?.data?.message || err.message;
    }
  };

  export const DeletePostById = async (id) => {
    try {
      console.log("Deleting post with ID:", id);
      const response = await axios.delete(`${API_URL}/deletePost/${id}`);
      console.log("Post deleted successfully:", response);
      return response.data;
    } catch (err) {
      console.error(
        "Error deleting post",
        err.response?.data?.message || err.message
      );
      throw err.response?.data?.message || err.message;
    }
  };

  // Hook to delete a post by ID
export const useDeletePostById = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DeletePostById,
    onSuccess: (data, id) => {
      console.log("Successfully deleted post:", id);

      // Invalidate all posts queries to refetch the latest data
      queryClient.invalidateQueries(["posts"]);

      // Optional: remove the deleted post from the cache manually
      queryClient.setQueryData(["posts", data.domainId], (oldData) => {
        if (!oldData) return [];
        return oldData.filter((post) => post._id !== id);
      });
    },
    onError: (error) => {
      console.error("Failed to delete post:", error);
    },
  });
};
