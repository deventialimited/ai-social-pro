const axios = require("axios");

exports.downloadImageFromUrl = async (imageUrl) => {
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

  const buffer = Buffer.from(response.data, "binary");
  const contentType = response.headers["content-type"] || "image/jpeg";
  const extension = contentType.split("/")[1] || "jpg";
  const originalname = `downloaded-brand-logo.${extension}`;

  return {
    originalname,
    mimetype: contentType,
    buffer,
  };
};
exports.getImageFromUnsplash = async (keyword) => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
    keyword
  )}&client_id=${accessKey}`;

  // Step 1: get image metadata
  const response = await axios.get(url);
  const photoData = response.data;

  // Step 2: build high-res image URL
  const rawUrl = photoData.urls?.raw;
  if (!rawUrl) throw new Error("No raw image URL found in Unsplash response");

  // Add quality, format, and width parameters
  const imageUrl = `${rawUrl}&q=100&fm=jpg&w=1920&fit=max`;

  // Step 3: download the actual image
  const imageResponse = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });
  const buffer = Buffer.from(imageResponse.data, "binary");

  // Step 4: extract content type
  const contentType = imageResponse.headers["content-type"] || "image/jpeg";
  const extension = contentType.split("/")[1] || "jpg";

  return {
    originalname: `unsplash-${keyword}.${extension}`,
    mimetype: contentType,
    buffer,
  };
};
