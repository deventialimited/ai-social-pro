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
const getImageFromUnsplash = async (keyword) => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
    keyword
  )}&orientation=landscape&content_filter=high&client_id=${accessKey}`;

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
exports.getTwoUnsplashImagesFromKeywords = async (keywords) => {
  const selected = keywords.sort(() => 0.5 - Math.random()).slice(0, 4); // 2 pairs
  const keyword1 = selected.slice(0, 2).join(" ");
  const keyword2 = selected.slice(2, 4).join(" ");
  const [img1, img2] = await Promise.all([
    getImageFromUnsplash(keyword1),
    getImageFromUnsplash(keyword2),
  ]);
  return [img1, img2];
};

exports.getValidImage = async (keywords, maxAttempts = 3) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const selectedKeywords = keywords
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    const keyword = selectedKeywords.join(" ");
    try {
      return await getImageFromUnsplash(keyword);
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed for keyword: ${keyword}`);
    }
  }
  throw new Error(
    "Failed to fetch a valid Unsplash image after multiple attempts."
  );
};
