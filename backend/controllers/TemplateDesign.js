const {
  uploadToS3,
  uploadToS3ForPostDesign,
  deleteFromS3,
} = require("../libs/s3Controllers");
const TemplateDesign = require("../models/TemplateDesign");

exports.saveOrUpdateTemplateDesign = async (req, res) => {
  try {
    const { id } = req.params; // optional — use to detect update
    // Parse the JSON string from form data
    let parsedData = req.body.data ? JSON.parse(req.body.data) : {};
    const { templateType = "public", templateId, userId, canvas, elements, layers, backgrounds } = parsedData;

    // Validate required fields
    if (!templateId || !userId) {
      return res.status(400).json({ message: "Missing required fields: templateId, userId" });
    }

    let files = req.files?.files || [];
    let templateImage = null;
    let existingTemplate = null;
    let oldTemplateImageKey = null;

    // Check if we're updating an existing template
    if (id) {
      existingTemplate = await TemplateDesign.findById(id);
      if (!existingTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }
    }

    // Step 1: Handle templateImage separately
    const templateImageFileIndex = files.findIndex(
      (file) => file.originalname === "templateImage"
    );

    if (templateImageFileIndex !== -1) {
      const [templateImageFile] = files.splice(templateImageFileIndex, 1);
      console.log(templateImageFile);

      // Delete old template image if exists
      if (existingTemplate?.templateImage) {
        oldTemplateImageKey = existingTemplate.templateImage.split("/").pop();
        await deleteFromS3([oldTemplateImageKey]);
      }

      // Upload new template image
      templateImage = await uploadToS3(templateImageFile);
    } else {
      // Reuse old templateImage if not updated
      templateImage = existingTemplate?.templateImage || null;
    }

    // Validate templateImage is present
    if (!templateImage) {
      return res.status(400).json({ message: "Template image is required" });
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
            el.props.previewUrl = url;
          }
        } else if (type === "background") {
          backgrounds.src = url;
        }
      });
    }

    // Step 3: Ensure template data is correct and save
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
        userId,
        templateId,
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

exports.getTemplateDesignsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const templates = await TemplateDesign.find({ userId })
      .sort({ updatedAt: -1 }); // Sort by most recently updated

    return res.status(200).json({
      message: "Templates retrieved successfully",
      templates
    });
  } catch (error) {
    console.error("Error in getTemplateDesignsByUserId:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};
