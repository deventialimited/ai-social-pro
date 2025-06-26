import axios from "axios";

export const blobToDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
export const getSafeUnsplashImageBlob = async (
  keywords = [],
  width = 600,
  height = 600
) => {
  const accessKey = "FVuPZz9YhT7O4DdL8zWtjSQTCFMj9ubMCF06bDR52lk";

  const query = keywords
    .sort(() => 0.5 - Math.random())
    .slice(0, 2)
    .join(" ");

  try {
    const { data } = await axios.get("https://api.unsplash.com/photos/random", {
      params: {
        query,
        orientation: "landscape",
        content_filter: "high", // optional, but good quality
        client_id: accessKey,
      },
    });

    if (!data?.urls?.raw) throw new Error("No image found from Unsplash");

    const imageUrl = `${data.urls.raw}&w=${width}&h=${height}&fit=crop&q=80&fm=jpg`;

    const imageResponse = await axios.get(imageUrl, { responseType: "blob" });
    const blob = imageResponse.data;
    const objectUrl = await blobToDataURL(blob);

    return { blob, objectUrl, imageUrl };
  } catch (error) {
    console.error("Failed to fetch Unsplash image:", error);
    return null;
  }
};


export async function generateReplacedPostDesignValues(
  postOtherValues,
  { canvas, elements, layers, backgrounds }
) {
  const { platform, siteLogo, siteColors, brandName, slogan, keywords } =
    postOtherValues;

  const updatedAllFiles = [];
  const updatedElements = await Promise.all(
    elements.map(async (el) => {
      const updated = { ...el, styles: { ...el.styles, position: "absolute" } };

      // 1️⃣ Replace brand name and slogan
      if (el.type === "text") {
        if (el.category === "slogan" && slogan) {
          updated.props = { ...el.props, text: slogan };
        }
        if (el.category === "brandName" && brandName) {
          updated.props = { ...el.props, text: brandName };
        }
      }

      // 2️⃣ Replace brand logo
      if (el.type === "image" && el.category === "brandLogo" && siteLogo) {
        try {
          const response = await axios.get(siteLogo, { responseType: "blob" });
          const blob = response.data;

          // const objectUrl = URL.createObjectURL(blob);
          const objectUrl = await blobToDataURL(blob);
          updated.props = {
            ...el.props,
            src: objectUrl,
            originalSrc: siteLogo,
            previewUrl: siteLogo,
          };

          const file = new File([blob], updated.id || el.id, {
            type: blob.type,
          });
          updatedAllFiles.push(file);
        } catch (err) {
          console.warn("Failed to fetch brand logo:", err);
        }
      }

      // 3️⃣ Replace background/brand image
      if (
        el.type === "image" &&
        el.category === "other" &&
        Array.isArray(keywords) &&
        keywords.length > 0
      ) {
        try {
          const image = await getSafeUnsplashImageBlob(keywords);
          if (image) {
            const { blob, objectUrl, imageUrl } = image;
            console.log(imageUrl);
            updated.props = {
              ...el.props,
              originalSrc: imageUrl,
              src: objectUrl,
              previewUrl: imageUrl,
            };

            const file = new File([blob], updated.id || el.id, {
              type: blob.type,
            });
            updatedAllFiles.push(file);
          }
        } catch (err) {
          console.warn("Failed to fetch Unsplash image:", err);
        }
      }

      return updated;
    })
  );

  // 4️⃣ Update canvas background
  let updatedCanvas = { ...canvas, styles: { ...canvas.styles } };

  if (canvas.styles?.backgroundType === "brand-colors") {
    // Clean background styles
    ["background", "backgroundImage", "backgroundGradient"].forEach((key) => {
      delete updatedCanvas.styles[key];
    });

    // Set brand color
    updatedCanvas.styles.backgroundColor = siteColors?.[0] || "#ffffff";
  }

  // 5️⃣ Return everything in final state
  const replacedPostDesignValues = {
    canvas: updatedCanvas,
    elements: updatedElements,
    layers: [...layers],
    backgrounds: { ...backgrounds },
    allFiles: updatedAllFiles,
  };

  return replacedPostDesignValues;
}
