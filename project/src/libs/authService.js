import axios from "axios";
const baseURL = "https://api.oneyearsocial.com";
// const baseURL = "http://localhost:5000";
// Base URL of your API
const API_URL = `${baseURL}/api/v1/users`;
export const updateSelectedDomain = async (userId, selectedWebsiteId) => {
  try {
    const response = await axios.post(`${API_URL}/updateSelectedDomain`, {
      userId,
      selectedWebsiteId,
    });
    console.log(
      `[updateSelectedDomain] Domain updated successfully for user ${userId}:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `[updateSelectedDomain] Error updating domain for user ${userId}:`,
      error.message
    );
    throw error;
  }
};
//edit-profile
export const updateProfile = async (userId, formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/edit-profile/${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error.response?.data?.message || "Failed to update profile");
  }
};
// Register user manually
export const registerUser = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    console.log(error.response.data.error);
    throw error.response?.data.error;
  }
};
// Google Auth

export const googleAuth = async (googleId, name, email, picture) => {
  try {
    const response = await axios.post(`${API_URL}/google-auth`, {
      googleId,
      name,
      email,
      picture,
    });
    return response.data;
  } catch (error) {
    console.log(error.response.data.error);
    throw error.response?.data || { error: "An error occurred during login." };
  }
};

// Login user manually
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/login`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; // Returns the response from the backend
  } catch (error) {
    console.error(error.response?.data?.error || "Login failed.");
    throw (
      error.response?.data?.error || {
        error: "An error occurred during login.",
      }
    );
  }
};
export const sendEmailVerificationOtp = async (email) => {
  try {
    const response = await axios.post(
      `${API_URL}/send-email-verification-otp`,
      { email }
    );
    return response.data;
  } catch (error) {
    console.log(error.response.data.error);
    throw error.response?.data.error;
  }
};

export const sendPhoneVerificationOtp = async (phone, userId) => {
  try {
    const response = await axios.post(
      `${API_URL}/send-phone-verification-otp`,
      { phone, userId }
    );
    return response.data;
  } catch (error) {
    console.log(error.response.data.error);
    throw error.response?.data.error;
  }
};

export const verifyOtp = async (token, otp, method) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, {
      token,
      otp,
      method,
    });
    return response.data;
  } catch (error) {
    console.log(error.response.data.error);
    throw error.response?.data.error;
  }
};

// Forgot password request
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data;
  } catch (error) {
    // Handle error and console.log(a meaningful message
    console.log(
      error.response?.data?.message ||
        "An error occurred during the forgot password process."
    );
    throw (
      error.response?.data || {
        error: "An error occurred during forgot password.",
      }
    );
  }
};

// Reset Password request
export const resetPassword = async (id, token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password/${id}`, {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.log(
      error.response?.data?.message ||
        "An error occurred while resetting the password."
    );
    throw (
      error.response?.data || {
        error: "An error occurred during resetting the password.",
      }
    );
  }
};

// Set Password request
export const setPassword = async (id, token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/set-password/${id}`, {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.log(
      error.response?.data?.message ||
        "An error occurred while setting the password."
    );
    throw (
      error.response?.data?.error || {
        error: "An error occurred during setting the password.",
      }
    );
  }
};
export const setupTwoFactorAuth = async (data, id) => {
  try {
    const response = await axios.post(`${API_URL}/setup-2fa/${id}`, data);
    return response.data;
  } catch (error) {
    console.log(error.response.data.error);
    throw error.response?.data.error;
  }
};

export const verifyTwoFactorAuth = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/verify-2fa`, data);
    return response.data;
  } catch (error) {
    console.log(error.response?.data?.error || "Failed to verify 2FA");
  }
};

export const getUserAccountStatus = async (userId) => {
  try {
    const response = await axios.get(
      `${API_URL}/getUserAccountStatus/${userId}`
    );
    return response.data.status; // Return the status from the response
  } catch (error) {
    console.error(
      error.response?.data?.error || "Error fetching account status"
    );
    throw error.response?.data?.error || "Failed to fetch account status.";
  }
};

export const updatePlatformConnection = async ({
  userId,
  platformName,
  status,
  username
}) => {
  console.log(userId, "this is id in the update Platform");
  console.log(platformName, "this is platformname in the update Platform");
  console.log(status, "this is status in the update Platform");

  try {
    const response = await axios.post(`${API_URL}/updatePlatformConnection`, {
      userId,
      platformName,
      status,
      username
    });

    console.log("updatePlatform COnnection Log", response);
    console.log("updatePlatform data", response.data);

    return response.data;
  } catch (error) {
    console.error(`[updatePlatformConnection] Error:`, error.message);
    throw error;
  }
};
export const getSocialAccountData = async (userId) => {
  console.log("into the getSocialAccount");
  try {
    const response = await axios.get(`${API_URL}/getSocialAccountData`, {
      params: { userId }, // This will become ?userId=xxx in the URL
    });
    return response.data;
  } catch (error) {
    console.error(`[updatePlatformConnection] Error:`, error.message);
    throw error;
  }
};

export const disconnectPlatform = async (userId, platformName) => {
  try {
    const response = await axios.post(`${API_URL}/disconnectPlatform`, {
      userId,
      platformName,
    });
    console.log("disconnected Platform response", response.data.user);

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const updatePostSchedule = async (userId, postScheduleData) => {
  try {
    console.log("Into the updatePostSchedule", userId, postScheduleData);
    console.log("data coming", userId, postScheduleData.days);
    const response = await axios.post(`${API_URL}/post-schedule`, {
      userId,
      postScheduleData,
    });

    console.log("Post schedule updated:", response.data.postSchedule);
    return response.data;
  } catch (error) {
    console.error("Error updating post schedule:", error);
    throw error;
  }
};


export const getUserInformation=async(userId)=>{
  try{
    console.log(userId,"in the getUSerInformation lib");
    const response=await axios.get(`${API_URL}/getUserInformation`,{
      params:{userId}
    })
    console.log(response.data)
        console.log(response.data.user)

return res.data.user
  }
  catch(err){
     console.error("Error updating post schedule:", error);
    throw err;
  }
}