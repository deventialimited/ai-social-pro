import cloudinary from "../config/cloudinary.js";

/**
 * Upload base64 encoded image to Cloudinary
 * @param {string} base64FileString - Base64 encoded image string
 * @param {string} folder - Cloudinary folder to store image
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadBase64Image = async (base64FileString, folder = "logos") => {
  try {
    console.log("Uploading base64 image to Cloudinary...");

    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64FileString}`,
      { folder, resource_type: "image" }
    );

    console.log("Upload successful:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};

/**
 * Upload image from URL to Cloudinary
 * @param {string} imageUrl - URL of the image to upload
 * @param {string} folder - Cloudinary folder to store image
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadImageFromUrl = async (imageUrl, folder = "logos") => {
  try {
    console.log("Uploading image from URL:", imageUrl);

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      resource_type: "image",
    });

    console.log("Upload successful:", result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image from URL");
  }
};
