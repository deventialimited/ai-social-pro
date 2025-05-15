const baseURL = "https://api.oneyearsocial.com";
// const baseURL = "http://localhost:4000";
const API_URL = `${baseURL}/api/v1/payment`;
import axios from "axios";
export const createCheckoutSession = async (priceId) => { 
    try {
        const response = await axios.post(`${API_URL}/createCheckoutSession`, {
        priceId,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating checkout session:", error);
        throw error;
    }
}