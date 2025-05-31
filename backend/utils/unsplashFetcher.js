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

  // Step 1: get JSON response with image info
  const response = await axios.get(url);
  const photoData = response.data;

  // Step 2: extract the actual image URL (choose a suitable size)
  const imageUrl =
    photoData.urls?.regular || photoData.urls?.full || photoData.urls?.raw;
  if (!imageUrl) throw new Error("No image URL found in response");

  // Step 3: fetch the actual image bytes from imageUrl
  const imageResponse = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });
  const buffer = Buffer.from(imageResponse.data, "binary");

  // Extract content type from headers
  const contentType = imageResponse.headers["content-type"] || "image/jpeg";
  const extension = contentType.split("/")[1] || "jpg";

  return {
    originalname: `unsplash-${keyword}.${extension}`,
    mimetype: contentType,
    buffer,
  };
};
