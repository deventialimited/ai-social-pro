const baseURL = "http://localhost:5000/api/v1/payment";
import axios from "axios";
export const createCheckoutSession = async (planType, billingCycle) => {
  try {
    console.log("baseURL", baseURL);
    const response = await axios.post(`${baseURL}/createCheckoutSession`, {
      planType,
      billingCycle,
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

export const verifyPayment = async (sessionId) => {
  const response = await fetch(`${baseURL}/verify-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    throw new Error("Verification failed");
  }
  return response.json();
};
