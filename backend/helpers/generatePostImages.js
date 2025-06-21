const TemplateDesign = require("../models/TemplateDesign");
const Domain = require("../models/Domain");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fsp = require("fs").promises;
const mime = require("mime-types");
const fetch = require("node-fetch");

const { uploadToS3 } = require("../libs/s3Controllers");
const {
  downloadImageFromUrl,
  getValidImage,
  getTwoUnsplashImagesFromKeywords,
} = require("../utils/unsplashFetcher");
const {
  generateHTMLFromTemplateData,
} = require("./generateHTMLFromTemplateData");
const { renderImageFromHTML } = require("./renderImageFromHTML");
const PostDesign = require("../models/PostDesign");

const prepareFileObject = async (filePath) => {
  const buffer = await fsp.readFile(filePath); // <-- THIS will work only with fs.promises
  return {
    originalname: path.basename(filePath),
    mimetype: mime.lookup(filePath) || "application/octet-stream",
    buffer,
  };
};
const platformDimensions = {
  facebook: [1200, 630],
  x: [1200, 675],
  linkedin: [1200, 627],
  instagram: [1080, 1080], // default square post
};

const modifyTemplate = async (
  platform,
  template,
  { sloganText, brandName, primaryColor, brandLogoUrl, keywords }
) => {
  // Replace text and image elements by their category if present
  template.elements = await Promise.all(
    template.elements.map(async (el) => {
      const updated = { ...el, styles: { ...el.styles, position: "absolute" } };

      if (el.type === "text") {
        if (el.category === "slogan" && sloganText) {
          updated.props = { ...el.props, text: sloganText };
          return updated;
        }
        if (el.category === "brandName" && brandName) {
          updated.props = { ...el.props, text: brandName };
          return updated;
        }
      }

      if (el.type === "image") {
        if (el.category === "brandLogo" && brandLogoUrl) {
          const logoFile = await downloadImageFromUrl(brandLogoUrl);
          const logoUrl = await uploadToS3(logoFile);
          updated.props = {
            ...el.props,
            originalSrc: logoUrl,
            src: logoUrl,
            previewUrl: logoUrl,
          };
          return updated;
        }
        if (
          el.category === "other" &&
          Array.isArray(keywords) &&
          keywords.length > 0
        ) {
          const [canvasWidth, canvasHeight] = platformDimensions[
            (platform || "")?.toLowerCase()
          ] || [600, 600];
          const bgImageFile = await getValidImage(
            keywords,
            canvasWidth,
            canvasHeight
          );
          if (bgImageFile) {
            const imageUrl = await uploadToS3(bgImageFile);
            updated.props = {
              ...el.props,
              originalSrc: imageUrl,
              src: imageUrl,
              previewUrl: imageUrl,
            };
            return updated;
          }
        }
      }

      return el;
    })
  );

  // Clean and set background color
  if (template.canvas?.styles?.backgroundType === "brand-colors") {
    ["background", "backgroundImage", "backgroundGradient"].forEach((key) => {
      delete template.canvas.styles[key];
    });
    console.log(primaryColor);
    template.canvas.styles.backgroundColor = primaryColor || "#ffffff";
  }

  // Set canvas dimensions
  const [canvasWidth, canvasHeight] = platformDimensions[
    (platform || "")?.toLowerCase()
  ] || [600, 600];
  template.canvas.width = canvasWidth;
  template.canvas.height = canvasHeight;

  return template;
};

const generateDomainVisualAssets = async ({
  postId,
  platform,
  sloganText,
  brandName,
  primaryColor,
  brandLogoUrl,
  keywords,
}) => {
  let sloganImage = null;
  let brandingImage = null;
  let fallbackCase = false;

  try {
    // 1. Fetch random public templates
    const [sloganTemplate] = await TemplateDesign.aggregate([
      {
        $match: {
          templateType: "public",
          templateCategory: "slogan",
          templatePlatform: platform?.toLowerCase(),
        },
      },
      { $sample: { size: 1 } },
    ]);

    const [brandingTemplate] = await TemplateDesign.aggregate([
      {
        $match: {
          templateType: "public",
          templateCategory: "branding",
          templatePlatform: platform?.toLowerCase(),
        },
      },
      { $sample: { size: 1 } },
    ]);

    const generatedDir = path.join(__dirname, "../public/generated");
    await fsp.mkdir(generatedDir, { recursive: true });

    const [imageWidth, imageHeight] = platformDimensions[
      (platform || "")?.toLowerCase()
    ] || [600, 600];

    if (!sloganTemplate && sloganText?.trim()) {
      console.warn("Slogan template missing, using fallback Unsplash image...");
      const [img] = await getTwoUnsplashImagesFromKeywords(
        keywords,
        imageWidth,
        imageHeight
      );
      sloganImage = await uploadToS3(img);
      fallbackCase = true;
    } else {
      const modifiedSlogan = await modifyTemplate(
        platform,
        JSON.parse(JSON.stringify(sloganTemplate)),
        {
          sloganText,
          brandName,
          primaryColor,
          brandLogoUrl,
          keywords,
        }
      );

      const sloganHTML = generateHTMLFromTemplateData(modifiedSlogan);
      const sloganImagePath = path.join(generatedDir, `slogan-${uuidv4()}.png`);

      await renderImageFromHTML(
        modifiedSlogan?.canvas,
        sloganHTML,
        sloganImagePath
      );

      const sloganFile = await prepareFileObject(sloganImagePath);
      sloganImage = await uploadToS3(sloganFile);
      await fsp.unlink(sloganImagePath);

      await PostDesign.create({
        postId,
        type: "slogan",
        canvas: modifiedSlogan.canvas,
        elements: modifiedSlogan.elements,
        layers: modifiedSlogan.layers || [],
        backgrounds: modifiedSlogan.backgrounds || {},
      });
    }

    if (!brandingTemplate) {
      console.warn(
        "Branding template missing, using fallback Unsplash image..."
      );
      const [, img] = await getTwoUnsplashImagesFromKeywords(
        keywords,
        imageWidth,
        imageHeight
      );
      brandingImage = await uploadToS3(img);
      fallbackCase = true;
    } else {
      const modifiedBranding = await modifyTemplate(
        platform,
        JSON.parse(JSON.stringify(brandingTemplate)),
        {
          sloganText,
          brandName,
          primaryColor,
          brandLogoUrl,
          keywords,
        }
      );

      const brandingHTML = generateHTMLFromTemplateData(modifiedBranding);
      const brandingImagePath = path.join(
        generatedDir,
        `branding-${uuidv4()}.png`
      );

      await renderImageFromHTML(
        modifiedBranding?.canvas,
        brandingHTML,
        brandingImagePath
      );

      const brandingFile = await prepareFileObject(brandingImagePath);
      brandingImage = await uploadToS3(brandingFile);
      await fsp.unlink(brandingImagePath);

      await PostDesign.create({
        postId,
        type: "branding",
        canvas: modifiedBranding.canvas,
        elements: modifiedBranding.elements,
        layers: modifiedBranding.layers || [],
        backgrounds: modifiedBranding.backgrounds || {},
      });
    }
  } catch (error) {
    console.error(
      "Error in generation, using fallback Unsplash images...",
      error
    );
    const [imageWidth, imageHeight] = platformDimensions[
      (platform || "")?.toLowerCase()
    ] || [600, 600];
    const [img1, img2] = await getTwoUnsplashImagesFromKeywords(
      keywords,
      imageWidth,
      imageHeight
    );
    sloganImage = await uploadToS3(img1);
    brandingImage = await uploadToS3(img2);
    fallbackCase = true;
  }

  return {
    sloganImage,
    brandingImage,
    fallbackCase,
  };
};

module.exports = generateDomainVisualAssets;
