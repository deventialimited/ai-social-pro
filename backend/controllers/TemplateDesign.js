const {
  uploadToS3,
  uploadToS3ForPostDesign,
  deleteFromS3,
} = require("../libs/s3Controllers");
const TemplateDesign = require("../models/TemplateDesign");

exports.getTemplateDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const templateDesign = await TemplateDesign.findById(id);

    if (!templateDesign) {
      return res.status(404).json({ message: "TemplateDesign not found" });
    }

    return res.status(200).json(templateDesign);
  } catch (error) {
    console.error("Error in getTemplateDesignById:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.saveOrUpdateTemplateDesign = async (req, res) => {
  try {
    const { templateId } = req.params; // optional — use to detect update
    const { templateType } = req.body;
    const { canvas, elements, layers, backgrounds } = JSON.parse(req.body.data);
    let files = req.files?.files || [];

    let templateImage = null;
    let existingTemplate = null;
    let oldTemplateImageKey = null;

    // Check if we're updating an existing template
    if (templateId) {
      existingTemplate = await TemplateDesign.findById(templateId);
      if (!existingTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
    }

    // Step 1: Handle templateImage separately
    const templateImageFileIndex = files.findIndex(
      (file) => file.fieldname === "templateImage"
    );

    if (templateImageFileIndex !== -1) {
      const [templateImageFile] = files.splice(templateImageFileIndex, 1);

      // Delete old template image if exists
      if (existingTemplate?.templateImage) {
        oldTemplateImageKey = existingTemplate.templateImage.split("/").pop();
        await deleteFromS3([oldTemplateImageKey]);
      }

      // Upload new template image
      const templateImageUpload = await uploadToS3(templateImageFile);
      templateImage = templateImageUpload?.Location || null;
    } else {
      // Reuse old templateImage if not updated
      templateImage = existingTemplate?.templateImage || null;
    }

    // Step 2: Upload remaining files (elements/background assets)
    let newFileUrls;
    if (files?.length > 0) {
      newFileUrls = await uploadToS3ForPostDesign({
        postId: templateId,
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
            el.props.previewUrl = url;
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
      existingTemplate.templateImage = templateImage;
      existingTemplate.canvas = canvas;
      existingTemplate.elements = elements;
      existingTemplate.layers = layers;
      existingTemplate.backgrounds = backgrounds;
      existingTemplate.updatedAt = new Date();
      await existingTemplate.save();
      templateDesign = existingTemplate;
    } else {
      const newTemplate = new TemplateDesign({
        templateType,
        templateImage,
        canvas,
        elements,
        layers,
        backgrounds,
      });
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
