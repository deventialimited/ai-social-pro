const Domain = require("../models/Domain");
const User = require("../models/User");
const axios = require("axios");

const { uploadToS3,deleteFromS3 } = require("../libs/s3Controllers"); // or wherever your S3 logic lives
// Add a new domain
exports.addDomain = async (req, res) => {
  // Create new domain object
  const {
    client_email,
    clientWebsite,
    clientName,
    clientDescription,
    industry,
    niche,
    colors,
    userId,
    core_values,
    audience,
    audiencePains,
    language,
    country,
    state,
  } = req.body;

  try {
    // Helper function to split numbered lists correctly
    const splitNumberedList = (value) => {
      if (typeof value !== "string") return value; // Return original if not a string
      return value
        .split(/(?=\d+\.\s)/) // Split before numbers like "1. ", "2. "
        .map((v) => v.trim()); // Trim spaces
    };
    const marketingStrategy = {
      core_values: splitNumberedList(core_values),
      audiencePains: splitNumberedList(audiencePains),
      audience: splitNumberedList(audience),
    };

    // Create new domain object
    const domainData = {
      client_email,
      clientWebsite,
      clientName,
      clientDescription,
      industry,
      niche,
      colors,
      userId,
      language,
      country,
      state,
      marketingStrategy,
    };

    const logoUrl = `https://img.logo.dev/${clientWebsite}`;
    // Check if Logo.dev returned a valid image
    const logoResponse = await fetch(logoUrl, {
       headers: {
    Authorization: `Bearer ${process.env.LOGO_SECRET_KEY}`,
  },
    });
    let siteLogo;
    let uploadedImageUrl = "";

    if (logoResponse.ok && logoResponse.headers.get('content-type')?.includes('image')) {
      siteLogo = logoUrl;
    } 

 try {
        const response = await axios.get(siteLogo, {
          responseType: "arraybuffer",
        });

        const buffer = Buffer.from(response.data, "binary");
        const file = {
          originalname: `downloaded_${Date.now()}.jpg`, // you can extract real extension if needed
          mimetype: response.headers["content-type"],
          buffer: buffer,
        };

   uploadedImageUrl = await uploadToS3(file);

      } catch (err) {
        console.error("Failed to fetch or upload image:", err);
    }
    
    const newDomain = new Domain({ ...domainData, siteLogo:uploadedImageUrl });

    const savedDomain = await newDomain.save();
    res.status(201).json({
      success: true,
      message: "Domain created successfully",
      data: savedDomain,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
// Get all domains
exports.getAllDomains = async (req, res) => {
  try {
    const domains = await Domain.find().populate("userId", "username email");
    res.status(200).json({
      success: true,
      count: domains.length,
      data: domains,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get domain by ID
exports.getDomainById = async (req, res) => {
  const domainId = req.params.id;

  try {
    const domain = await Domain.findById(domainId).populate(
      "userId",
      "username email"
    );

    if (!domain) {
      return res.status(404).json({
        success: false,
        error: "Domain not found",
      });
    }

    res.status(200).json({
      success: true,
      data: domain,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all domains by userId
exports.getDomainsByUserId = async (req, res) => {
  const userId = req.params.userId; // Get userId from request params
  try {
    const domains = await Domain.find({ userId });
    if (!domains.length) {
      return res.status(404).json({
        success: false,
        error: "No domains found for this user",
      });
    }

    res.status(200).json({
      success: true,
      data: domains,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete domain
exports.deleteDomain = async (req, res) => {
  const domainId = req.params.id;

  try {
    const domain = await Domain.findById(domainId);

    if (!domain) {
      return res.status(404).json({
        success: false,
        error: "Domain not found",
      });
    }

    await Domain.findByIdAndDelete(domainId);

    res.status(200).json({
      success: true,
      message: "Domain deleted successfully",
      data: domain,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update domain business data only if values are changed
exports.updateDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // Fields sent in the request

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Domain ID is required" });
    }

    // Find the existing domain
    const existingDomain = await Domain.findById(id);
    if (!existingDomain) {
      return res
        .status(404)
        .json({ success: false, message: "Domain not found" });
    }

    let updateFields = {};

    // Helper function to check and update fields only if they changed
    const checkAndUpdate = (field, newValue) => {
      if (newValue !== undefined && newValue !== existingDomain[field]) {
        updateFields[field] = newValue;
      }
    };

    // Check and update basic fields
    checkAndUpdate("clientName", updates.clientName);
    checkAndUpdate("clientDescription", updates.clientDescription);
    checkAndUpdate("industry", updates.industry);
    checkAndUpdate("niche", updates.niche);
    checkAndUpdate("clientWebsite", updates.clientWebsite);
    checkAndUpdate("language", updates.language);
    checkAndUpdate("country", updates.country);
    checkAndUpdate("state", updates.state);

    // Handle colors update (convert array to string if provided)
    if (Array.isArray(updates.colors)) {
      const newColors = updates.colors.join(", ");
      checkAndUpdate("colors", newColors);
    }
    // Handle marketing strategy updates
    if (updates.marketingStrategy) {
      updateFields.marketingStrategy = {
        core_values:
          JSON.stringify(updates.marketingStrategy.core_values) !==
          JSON.stringify(existingDomain.marketingStrategy?.core_values)
            ? updates.marketingStrategy.core_values
            : existingDomain.marketingStrategy?.core_values,

        audiencePains:
          JSON.stringify(updates.marketingStrategy.audiencePains) !==
          JSON.stringify(existingDomain.marketingStrategy?.audiencePains)
            ? updates.marketingStrategy.audiencePains
            : existingDomain.marketingStrategy?.audiencePains,

        audience:
          JSON.stringify(updates.marketingStrategy.audience) !==
          JSON.stringify(existingDomain.marketingStrategy?.audience)
            ? updates.marketingStrategy.audience
            : existingDomain.marketingStrategy?.audience,
      };
    }

    // If no changes, return without updating
    if (Object.keys(updateFields).length === 0) {
      return res.status(200).json({
        success: true,
        message: "No changes detected",
        data: existingDomain,
      });
    }

    // Update the document only with changed fields
    const updatedDomain = await Domain.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Domain updated successfully",
      data: updatedDomain,
    });
  } catch (error) {
    console.error("Error updating domain:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// exports.uploadBrand = async (req, res) => {
//   const domainId = req.params.id;
//   const file = req.file;
//   const { colors } = req.body;

//   try {
//     // Find the existing domain
//     const existingDomain = await Domain.findById(domainId);
//     if (!existingDomain) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Domain not found" });
//     }
//     const updateData = {};

//     if (file) {
//       const logoUrl = await uploadToS3(file);
//       updateData.siteLogo = logoUrl;
//     }
//     if (colors) {
//       updateData.colors = colors;
//     }

//     const updatedDomain = await Domain.findByIdAndUpdate(domainId, updateData, {
//       new: true,
//     });

//     if (!updatedDomain) {
//       return res.status(404).json({ error: "Domain not found" });
//     }

//     res
//       .status(200)
//       .json({ message: "Update successful", domain: updatedDomain });
//   } catch (error) {
//     console.error("Error uploading logo and updating brand:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };


exports.uploadBrand = async (req, res) => {
  const domainId = req.params.id;
  const file = req.file;
  const { colors } = req.body;

  try {
    const existingDomain = await Domain.findById(domainId);
    if (!existingDomain) {
      return res.status(404).json({ success: false, message: "Domain not found" });
    }

    const updateData = {};
    let oldLogoKey = null;

    // Step 1: Capture the old logo key before updating
    if (file && existingDomain.siteLogo) {
      const existingUrl = existingDomain.siteLogo;
      const splitUrl = existingUrl.split(".amazonaws.com/");
      if (splitUrl.length === 2) {
        oldLogoKey = splitUrl[1];
      } else {
        console.warn("Could not extract S3 key from existing logo URL.");
      }
    }

    // Step 2: Upload new logo
    if (file) {
      const newLogoUrl = await uploadToS3(file);
      updateData.siteLogo = newLogoUrl;
    }

    // Step 3: Update colors if provided
    if (colors) {
      updateData.colors = colors;
    }

    // Step 4: Update the domain
    const updatedDomain = await Domain.findByIdAndUpdate(domainId, updateData, {
      new: true,
    });

    if (!updatedDomain) {
      return res.status(404).json({ error: "Domain not found after update" });
    }

    // Step 5: Delete the old logo after successful update
    if (oldLogoKey) {
      try {
        const deleteResult = await deleteFromS3([oldLogoKey]);
      } catch (err) {
        console.error("Error deleting old logo from S3:", err);
        // Optionally send this to logs or monitoring
      }
    } else {
      console.log("No old logo to delete.");
    }
  
    res.status(200).json({ message: "Update successful", domain: updatedDomain });
  } catch (error) {
    console.error("Error uploading logo and updating brand:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};