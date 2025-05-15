const baseURL = "http://localhost:4000/api/v1/payment";
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
