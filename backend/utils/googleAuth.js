/**
 * Google Auth Helper
 * Functions for verifying Google tokens and user information
 */
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token
 * @param {string} token - Google ID token
 * @returns {Promise<Object>} - User information from Google
 */
export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return {
      googleId: payload.sub,
      email: payload.email,
      displayName: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    console.error("Error verifying Google token:", error);
    throw new Error("Failed to verify Google token");
  }
};
