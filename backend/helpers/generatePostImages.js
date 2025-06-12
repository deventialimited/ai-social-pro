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

const modifySloganTemplate = (platform, template, sloganText, primaryColor) => {
  // 1. Replace slogan text in elements
  template.elements = template.elements.map((el) => {
    if (el.type === "text" && el.category === "slogan") {
      return {
        ...el,
        styles: {
          ...el.styles,
          position: "absolute",
        },
        props: {
          ...el.props,
          text: sloganText,
        },
      };
    }
    return el;
  });

  // 2. Update canvas background color
  if (template.canvas) {
    template.canvas.styles.backgroundColor = primaryColor || "#ffffff";
    const [canvasWidth, canvasHeight] = platformDimensions[
      (platform || "")?.toLowerCase()
    ] || [600, 600];
    template.canvas.width = canvasWidth;
    template.canvas.height = canvasHeight;
  }

  return template;
};

const modifyBrandingTemplate = async (
  platform,
  template,
  brandName,
  primaryColor,
  brandLogoUrl,
  keywords
) => {
  // 1. Replace brand text elements
  template.elements = template.elements.map((el) => {
    if (el.type === "text" && el.category === "brandName") {
      return {
        ...el,
        styles: {
          ...el.styles,
          position: "absolute",
        },
        props: {
          ...el.props,
          text: brandName,
        },
      };
    }
    return el;
  });

  // 2. Set background color in canvas and styles
  if (template.canvas) {
    template.canvas.styles.backgroundColor = primaryColor || "#ffffff";
    const [canvasWidth, canvasHeight] = platformDimensions[
      (platform || "")?.toLowerCase()
    ] || [600, 600];
    template.canvas.width = canvasWidth;
    template.canvas.height = canvasHeight;
  }

  // 3. Upload and replace brand logo
  if (brandLogoUrl) {
    const logoFile = await downloadImageFromUrl(brandLogoUrl);
    const logoUrl = await uploadToS3(logoFile);
    template.elements = template.elements.map((el) => {
      if (el.type === "image" && el.category === "brandLogo") {
        return {
          ...el,
          styles: {
            ...el.styles,
            position: "absolute",
          },
          props: {
            ...el.props,
            src: logoUrl,
            previewUrl: logoUrl,
          },
        };
      }
      return el;
    });
  }

  // 4. Get Unsplash image by keyword and replace background image
  if (Array.isArray(keywords) && keywords.length > 0) {
    const unsplashImageFile = await getValidImage(keywords);
    console.log(unsplashImageFile);
    if (unsplashImageFile) {
      const unsplashUrl = await uploadToS3(unsplashImageFile);
      template.elements = template.elements.map((el) => {
        if (el.type === "image" && el.category === "other") {
          return {
            ...el,
            styles: {
              ...el.styles,
              position: "absolute",
            },
            props: {
              ...el.props,
              src: unsplashUrl,
              previewUrl: unsplashUrl,
            },
          };
        }
        return el;
      });
    }
  }

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
          templatePlatform: platform,
        },
      },
      { $sample: { size: 1 } },
    ]);

    const [brandingTemplate] = await TemplateDesign.aggregate([
      {
        $match: {
          templateType: "public",
          templateCategory: "branding",
          templatePlatform: platform,
        },
      },
      { $sample: { size: 1 } },
    ]);

    // === If any template is missing, fallback ===
    if (!sloganTemplate || !brandingTemplate) {
      console.warn("Templates missing, using fallback Unsplash images...");
      const [img1, img2] = await getTwoUnsplashImagesFromKeywords(keywords);
      return {
        sloganImage: img1,
        brandingImage: img2,
        fallbackCase: true,
      };
    }

    // 2. Modify templates
    const modifiedSlogan = modifySloganTemplate(
      platform,
      JSON.parse(JSON.stringify(sloganTemplate)),
      sloganText,
      primaryColor
    );

    const modifiedBranding = await modifyBrandingTemplate(
      platform,
      JSON.parse(JSON.stringify(brandingTemplate)),
      brandName,
      primaryColor,
      brandLogoUrl,
      keywords
    );

    // 3. Generate HTML
    const sloganHTML = generateHTMLFromTemplateData(modifiedSlogan);
    const brandingHTML = generateHTMLFromTemplateData(modifiedBranding);

    // 4. Generate images
    const generatedDir = path.join(__dirname, "../public/generated");
    await fsp.mkdir(generatedDir, { recursive: true });

    const sloganImagePath = path.join(generatedDir, `slogan-${uuidv4()}.png`);
    const brandingImagePath = path.join(
      generatedDir,
      `branding-${uuidv4()}.png`
    );

    await renderImageFromHTML(
      modifiedSlogan?.canvas,
      sloganHTML,
      sloganImagePath
    );
    await renderImageFromHTML(
      modifiedBranding?.canvas,
      brandingHTML,
      brandingImagePath
    );

    // 5. Prepare and upload to S3
    const sloganFile = await prepareFileObject(sloganImagePath);
    const brandingFile = await prepareFileObject(brandingImagePath);

    sloganImage = await uploadToS3(sloganFile);
    brandingImage = await uploadToS3(brandingFile);

    await Promise.all([
      fsp.unlink(sloganImagePath),
      fsp.unlink(brandingImagePath),
    ]);

    // 6. Save PostDesigns
    await PostDesign.create({
      postId,
      type: "slogan",
      canvas: modifiedSlogan.canvas,
      elements: modifiedSlogan.elements,
      layers: modifiedSlogan.layers || [],
      backgrounds: modifiedSlogan.backgrounds || {},
    });

    await PostDesign.create({
      postId,
      type: "branding",
      canvas: modifiedBranding.canvas,
      elements: modifiedBranding.elements,
      layers: modifiedBranding.layers || [],
      backgrounds: modifiedBranding.backgrounds || {},
    });
  } catch (error) {
    console.error(
      "Error in generation, using fallback Unsplash images...",
      error
    );
    const [img1, img2] = await getTwoUnsplashImagesFromKeywords(keywords);
    sloganImage = img1;
    brandingImage = img2;
    fallbackCase = true;
  }

  return {
    sloganImage,
    brandingImage,
    fallbackCase,
  };
};


module.exports = generateDomainVisualAssets;
