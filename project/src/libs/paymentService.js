const baseURL = "http://localhost:5000/api/v1/payment";
import axios from "axios";
export const createCheckoutSession = async (planType, billingCycle, user) => {
  try {
    console.log("baseURL", baseURL);
    const response = await axios.post(`${baseURL}/createCheckoutSession`, {
      planType,
      billingCycle,
      user,
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
  console.log("Verifying payment for sessionId:", sessionId);
  const user = await JSON.parse(localStorage.getItem("user"));
  const response = await fetch(`${baseURL}/verify-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ sessionId, userId: user._id }),
  });

  if (!response.ok) {
    throw new Error("Verification failed");
  }
  return response.json();
};
