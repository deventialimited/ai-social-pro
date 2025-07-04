const { processImage } = require("../helpers/generatePostImages");
const {
  uploadToS3,
  uploadToS3ForPostDesign,
  deleteFromS3,
} = require("../libs/s3Controllers");
const TemplateDesign = require("../models/TemplateDesign");

exports.getTemplateDesignsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const [publicTemplates, userTemplates] = await Promise.all([
      TemplateDesign.find({ templateType: "public" }),
      TemplateDesign.find({ userId }),
    ]);

    // Combine and ensure no duplicates if any template is both public and user's (optional)
    const templatesMap = new Map();

    [...publicTemplates, ...userTemplates].forEach((template) => {
      templatesMap.set(template._id.toString(), template);
    });

    const combinedTemplates = Array.from(templatesMap.values());

    return res.status(200).json(combinedTemplates);
  } catch (error) {
    console.error("Error in getTemplateDesignsByUserId:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
function hasUniqueElementIds(elements) {
  const ids = elements.map((el) => el.id);
  return ids.length === new Set(ids).size;
}

exports.saveOrUpdateTemplateDesign = async (req, res) => {
  try {
    const {
      id,
      templateType,
      templatePlatform,
      templateCategory,
      templateId,
      userId,
      canvas,
      elements,
      layers,
      backgrounds,
    } = JSON.parse(req.body.data);
    let files = req.files?.files || [];
    let existingTemplate = null;
    // Usage before saving
    if (!hasUniqueElementIds(elements)) {
      throw new Error("Duplicate element IDs found in this template.");
    }
    // Check if we're updating an existing template
    if (id) {
      existingTemplate = await TemplateDesign.findById(id);
      if (!existingTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
    }
    // Step 2: Upload remaining files (elements/background assets)
    let newFileUrls;
    if (files?.length > 0) {
      newFileUrls = await uploadToS3ForPostDesign({
        postId: existingTemplate?.templateId || templateId,
        files,
        elements,
        backgrounds,
      });

      // Update src in elements/backgrounds
      newFileUrls?.forEach(({ type, id, url }) => {
        if (type === "element") {
          const el = elements.find((el) => el.id === id);
          if (el) {
            el.props.src = url;
            // el.props.previewUrl = url;
          }
        } else if (type === "background") {
          backgrounds.src = url;
        }
      });
    }

    // Step 3: Clean up old unused element/background files if updating
    if (existingTemplate) {
      const filesToDelete = [];

      // Compare elements
      const oldElements = existingTemplate.elements || [];
      oldElements.forEach((oldEl) => {
        const match = elements.find((el) => el.id === oldEl.id);
        if (!match && oldEl.props?.src) {
          const key = oldEl.props.src.split("/").pop();
          filesToDelete.push(key);
        }
      });

      // Compare background
      if (
        JSON.stringify(existingTemplate.backgrounds) !==
        JSON.stringify(backgrounds)
      ) {
        if (existingTemplate.backgrounds?.src) {
          const key = existingTemplate.backgrounds.src.split("/").pop();
          filesToDelete.push(key);
        }
      }

      if (filesToDelete.length > 0) {
        await deleteFromS3(filesToDelete);
      }
    }

    // Step 4: Sync background styles to canvas
    if (!canvas.styles) canvas.styles = {};
    if (backgrounds?.type === "color") {
      canvas.styles.backgroundColor = backgrounds?.color;
    } else if (backgrounds?.type === "image") {
      canvas.styles.backgroundImage = `url(${backgrounds?.src})`;
    } else if (backgrounds?.type === "video") {
      canvas.styles.backgroundVideo = backgrounds?.src;
    }

    // Step 5: Save (update or create)
    let templateDesign;
    if (existingTemplate) {
      existingTemplate.templateType = templateType;
      existingTemplate.templatePlatform = templatePlatform;
      existingTemplate.templateCategory = templateCategory;
      existingTemplate.canvas = canvas;
      existingTemplate.elements = elements;
      existingTemplate.layers = layers;
      existingTemplate.backgrounds = backgrounds;
      existingTemplate.updatedAt = new Date();
      await existingTemplate.save();
      const generatedImageUrl = await processImage({
        type: templateCategory, // e.g., "image", "brandingImage", "sloganImage"
        modifiedData: existingTemplate, // Pass saved design as modifiedData
      });
      existingTemplate.templateImage = generatedImageUrl;
      await existingTemplate.save();
      templateDesign = existingTemplate;
    } else {
      const newTemplate = new TemplateDesign({
        userId,
        templateId,
        templateType,
        templatePlatform,
        templateCategory,
        canvas,
        elements,
        layers,
        backgrounds,
      });
      await newTemplate.save();
      const generatedImageUrl = await processImage({
        type: templateCategory, // e.g., "image", "branding", "slogan"
        modifiedData: newTemplate, // Pass saved design as modifiedData
      });
      newTemplate.templateImage = generatedImageUrl;
      await newTemplate.save();
      templateDesign = newTemplate;
    }

    return res.status(200).json({
      message: existingTemplate ? "Template updated" : "Template created",
      templateDesign,
    });
  } catch (error) {
    console.error("Error in saveOrUpdateTemplateDesign:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteTemplateDesign = async (req, res) => {
  const id = req.params.id;
  console.log("Deleting template ID:", id);

  if (!id) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const templateDesign = await TemplateDesign.findById(id);
    if (!templateDesign) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (templateDesign) {
      const filesToDelete = [];

      const designElements = templateDesign?.elements || [];

      designElements.forEach((el) => {
        if (el.props?.src) {
          const key = el.props.src.split("/").pop();
          filesToDelete.push(key);
        }
      });

      if (templateDesign.backgrounds?.src) {
        const key = templateDesign.backgrounds.src.split("/").pop();
        filesToDelete.push(key);
      }

      if (filesToDelete.length > 0) {
        await deleteFromS3(filesToDelete);
      }
    }
    await TemplateDesign.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Template and related assets deleted successfully" });
  } catch (error) {
    console.error("Error deleting templateDesign:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
