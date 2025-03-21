/**
 * User Controller
 * Handles user profile and data operations
 */
import User from "../models/User.model.js";
import fetch from "node-fetch";
import { uploadImageFromUrl } from "../utils/imageUpload.js";
/**
 * Get user data
 * @route GET /api/users/me
 */

export const getUserData = async (req, res) => {
  try {
    const user = req.user; // From auth middleware

    // Return user data
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserData:", error);
    res.status(500).json({ error: `Error: ${error.message}` });
  }
};

/**
 * Update user data
 * @route POST /api/users/update
 */
export const updateUserData = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const user = req.user; // From auth middleware

    // Find and update user
    await User.findByIdAndUpdate(user._id, data, { new: true });

    res.status(200).json({ success: "Data updated successfully" });
  } catch (error) {
    console.error("Error in updateUserData:", error);
    res.status(500).json({ error: `Error: ${error.message}` });
  }
};

/**
 * Generate company data based on domain
 * @param {string} domain - Website domain
 * @param {string} email - User email
 * @returns {Promise<Object>} - Company data
 */
const generateCompanyData = async (domain, email) => {
  try {
    // First API call
    const firstResponse = await fetch(
      `https://hook.us2.make.com/hq4rboy9yg0pxnsh7mb2ri9vj4orsj0m?clientWebsite=${domain}&username=${email}`
    );

    // Parse first response
    const firstData = await firstResponse.json();

    // Wait 3 seconds between API calls
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Second API call
    const secondResponse = await fetch(
      `https://hook.us2.make.com/yljp8ebfpmyb7qxusmkxmh89cx3dt5zo?clientWebsite=${domain}`
    );

    if (!secondResponse.ok) {
      throw new Error(
        `Second API call failed with status: ${secondResponse.status}`
      );
    }

    // Parse second response and return
    const secondData = await secondResponse.json();
    return secondData;
  } catch (error) {
    console.log("Error in AI App data:", error);
    return null;
  }
};

/**
 * Get site data for a domain
 * @route POST /api/users/site-data
 */

export const getUserDomains = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userData = await User.findById(user._id).select("domains");

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // console.log(" user data of the domain", userData);

    // Convert stored domain keys back to the original format
    const decodedDomains = {};
    if (userData.domains) {
      Object.keys(userData.domains).forEach((encodedKey) => {
        const originalKey = encodedKey.replace(/___DOT___/g, "."); // Convert back to dots
        decodedDomains[originalKey] = userData.domains[encodedKey];
      });
    }

    return res.status(200).json({ domains: decodedDomains || {} });
  } catch (error) {
    console.error("Error fetching user domains:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getSiteData = async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ error: "Missing domain in request body" });
    }

    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

   
    const logoUrl = `https://logo.clearbit.com/${domain}`;
    const logoResponse = await fetch(logoUrl);

    let logoCloudinaryUrl = null;
    if (logoResponse.ok) {
      logoCloudinaryUrl = await uploadImageFromUrl(logoUrl);
    }

    let enrichedData = await generateCompanyData(domain, user.email);
    if (!enrichedData) {
      enrichedData = {};
    }
    enrichedData.logoUrl = logoCloudinaryUrl;

    const userDoc = await User.findById(user._id).lean();
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingDomains = userDoc.domains || {};
    const decodedDomains = {};
    for (const safeKey of Object.keys(existingDomains)) {
      const originalDomain = safeKey.replace(/_dot_/g, ".");
      decodedDomains[originalDomain] = existingDomains[safeKey];
    }

    decodedDomains[domain] = enrichedData;

    const updatedDomains = {};
    for (const originalDomain of Object.keys(decodedDomains)) {
      const safeKey = originalDomain.replace(/\./g, "_dot_");
      updatedDomains[safeKey] = decodedDomains[originalDomain];
    }

    const updatedUserDoc = await User.findByIdAndUpdate(
      user._id,
      { $set: { domains: updatedDomains } },
      { new: true, upsert: true }
    ).lean();

    const finalDomains = {};
    for (const safeKey of Object.keys(updatedUserDoc.domains || {})) {
      const originalDomain = safeKey.replace(/_dot_/g, ".");
      finalDomains[originalDomain] = updatedUserDoc.domains[safeKey];
    }

    return res.status(200).json({
      message: "Data saved successfully",
      domains: finalDomains,
    });
  } catch (error) {
    console.error("Error in getSiteData:", error);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
};

// get last user domain
export const getLastAddedDomains = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userData = await User.findById(user._id).select("domains").lean();

    let domainKeys = [];

    if (userData && userData.domains) {
      domainKeys = Object.keys(userData.domains);
      if (domainKeys.length > 0) {
        const lastKey = domainKeys[domainKeys.length - 1];
        const lastDomainData = userData.domains[lastKey];
        console.log("Last Domain Key:", lastKey);
        console.log("Last Domain Data:", lastDomainData);
      } else {
        console.log("No domains found.");
      }
    } else {
      console.log("User or domains not found.");
    }

    if (domainKeys.length === 0) {
      return res.status(200).json({ domain: {} });
    }

    // Get the last key
    const lastKey = domainKeys[domainKeys.length - 1];

    // Decode the key back to its original format
    const originalKey = lastKey.replace(/_dot_/g, ".");

    const lastDomainData = {
      [originalKey]: userData.domains[lastKey],
    };

    return res.status(200).json({ domain: lastDomainData });
  } catch (error) {
    console.error("Error fetching user domains:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
