const TemplateDesign = require("../models/TemplateDesign");
const Domain = require("../models/Domain");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fsp = require("fs").promises;
const mime = require("mime-types");
const fetch = require("node-fetch");

const { uploadToS3 } = require("../libs/s3Controllers");
const {
  getImageFromUnsplash,
  downloadImageFromUrl,
} = require("../utils/unsplashFetcher");
const {
  generateHTMLFromTemplateData,
} = require("./generateHTMLFromTemplateData");
const { renderImageFromHTML } = require("./renderImageFromHTML");

const prepareFileObject = async (filePath) => {
  const buffer = await fsp.readFile(filePath); // <-- THIS will work only with fs.promises
  return {
    originalname: path.basename(filePath),
    mimetype: mime.lookup(filePath) || "application/octet-stream",
    buffer,
  };
};
const modifySloganTemplate = (template, sloganText, primaryColor) => {
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
    template.canvas.width = `${Math.max(
      Math.min(template.canvas.width / 3, 600)
    )}px`;
    template.canvas.height = `${Math.max(
      Math.min(template.canvas.height / 3, 600)
    )}px`;
  }

  return template;
};

const modifyBrandingTemplate = async (
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
  if (template.canvas)
    template.canvas.styles.backgroundColor = primaryColor || "#ffffff";
  template.canvas.width = Math.max(Math.min(template.canvas.width / 3, 600));
  template.canvas.height = Math.max(Math.min(template.canvas.height / 3, 600));

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
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    const unsplashImageFile = await getImageFromUnsplash(keyword); // { originalname, mimetype, buffer }
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
  sloganText,
  brandName,
  primaryColor,
  brandLogoUrl,
  keywords,
}) => {
  // 1. Fetch random public templates
  const [sloganTemplate] = await TemplateDesign.aggregate([
    { $match: { templateType: "public", templateCategory: "slogan" } },
    { $sample: { size: 1 } },
  ]);

  const [brandingTemplate] = await TemplateDesign.aggregate([
    { $match: { templateType: "public", templateCategory: "branding" } },
    { $sample: { size: 1 } },
  ]);

  if (!sloganTemplate || !brandingTemplate) {
    throw new Error("Missing required templates");
  }

  // 2. Modify slogan template
  const modifiedSlogan = modifySloganTemplate(
    JSON.parse(JSON.stringify(sloganTemplate)),
    sloganText,
    primaryColor
  );

  // 3. Modify branding template
  const modifiedBranding = await modifyBrandingTemplate(
    JSON.parse(JSON.stringify(brandingTemplate)),
    brandName,
    primaryColor,
    brandLogoUrl,
    keywords
  );
  // 4. Generate HTML
  const sloganHTML = generateHTMLFromTemplateData(modifiedSlogan);
  const brandingHTML = generateHTMLFromTemplateData(modifiedBranding);
  // // === RENDER TO IMAGE ===
  const generatedDir = path.join(__dirname, "../public/generated");
  await fsp.mkdir(generatedDir, { recursive: true });

  const sloganImagePath = path.join(generatedDir, `slogan-${uuidv4()}.png`);
  const brandingImagePath = path.join(generatedDir, `branding-${uuidv4()}.png`);
  // 5. Render images
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

  // 6. Prepare files
  const sloganFile = await prepareFileObject(sloganImagePath);
  const brandingFile = await prepareFileObject(brandingImagePath);

  // 7. Upload to S3
  const sloganImage = await uploadToS3(sloganFile);
  const brandingImage = await uploadToS3(brandingFile);
  await Promise.all([
    fsp.unlink(sloganImagePath),
    fsp.unlink(brandingImagePath),
  ]);
  return {
    sloganImage,
    brandingImage,
  };
};

module.exports = generateDomainVisualAssets;
