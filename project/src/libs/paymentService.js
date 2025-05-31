const baseURL = "http://localhost:5000/api/v1/payment";
import axios from "axios";
export const createCheckoutSession = async (planType, billingCycle, userId) => {
  try {
    console.log("baseURL", baseURL);
    const response = await axios.post(`${baseURL}/createCheckoutSession`, {
      planType,
      billingCycle,
      userId,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Error creating checkout session:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const verifyPayment = async (sessionId,userId) => {
  console.log("Verifying payment for sessionId:", sessionId);
  const user = await JSON.parse(localStorage.getItem("user"));
  const response = await fetch(`${baseURL}/verify-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ sessionId, userId: userId }),
  });

  if (!response.ok) {
    throw new Error("Verification failed");
  }
  return response.json();
};


export const cancelSubscription = async (userId) => {
  console.log("user id in cancel cance",userId)
  const response = await axios.post(
    `${baseURL}/cancel-subscription`,
    { userId:userId },
  );
  return response.data;
};

export const updateSubscription = async (userId, newPlanType, billingCycle) => {
  console.log('updateSubscription')
  const response = await axios.post(
    `${baseURL}/update-subscription`,
    { userId, newPlanType, billingCycle },
  );
  return response.data;
};

export const createCustomerPortalSession = async (userId) => {
  const response = await axios.post(
    `${baseURL}/create-portal-session`,
    { userId },
  );
  return response.data;
}




export const reactivateSubscription = async (userId, planType, billingCycle) => {
  const response = await axios.post(
    `${baseURL}/reactivate-subscription`,
    { userId, planType, billingCycle },
  );
  return response.data;
};

export const previewSubscriptionChange = async (userId, newPlanType, billingCycle) => {
  const response = await axios.post(
    `${baseURL}/preview-subscription-change`,
    { userId, newPlanType, billingCycle },
  );
  return response.data;
};

export const StartTrial=async(userId)=>{
  const response=await axios.post(`${baseURL}/startTrial`,{
    userId
  });
  return response.data
}