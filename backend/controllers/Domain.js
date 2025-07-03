const Domain = require("../models/Domain");
const User = require("../models/User");
const axios = require("axios");

const { uploadToS3, deleteFromS3 } = require("../libs/s3Controllers"); // or wherever your S3 logic lives
const { Token } = require("aws-sdk");

function normalizeDomain(url) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

exports.addDomain = async (req, res) => {
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
    client_id,
  } = req.body;

  try {
    // Helper to split numbered lists if needed
    const splitNumberedList = (value) => {
      if (typeof value !== "string") return value;
      return value.split(/(?=\d+\.\s)/).map((v) => v.trim());
    };

    const marketingStrategy = {
      core_values: splitNumberedList(core_values),
      audiencePains: splitNumberedList(audiencePains),
      audience: splitNumberedList(audience),
    };

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
      client_id,
    };

    // Logo processing logic
    let uploadedImageUrl = "";
    const clientWebsiteForLogo = normalizeDomain(clientWebsite);
    console.log("Normalized client website for logo:", clientWebsiteForLogo);

    try {
      // Option 1: Using token in URL (if API requires it)
      const logoUrl = `https://img.logo.dev/${clientWebsiteForLogo}?token=${process.env.LOGO_SECRET_KEY}`;

      // Option 2: Using Authorization header (recommended if API supports it)
      // const logoUrl = `https://img.logo.dev/${clientWebsiteForLogo}`;

      console.log("Fetching logo from:", logoUrl);

      // Fetch the logo
      const logoResponse = await fetch(logoUrl, {
        // Uncomment if using Authorization header
        // headers: {
        //   Authorization: `Bearer ${process.env.LOGO_SECRET_KEY}`
        // }
      });

      if (!logoResponse.ok) {
        const errorBody = await logoResponse.text();
        console.warn("Logo.dev API error:", errorBody);
        throw new Error(`Logo fetch failed with status ${logoResponse.status}`);
      }

      const contentType = logoResponse.headers.get("content-type");
      const isImage = contentType?.includes("image");

      if (isImage) {
        // Get the image buffer directly from the response
        const imageBuffer = await logoResponse.arrayBuffer();
        const buffer = Buffer.from(imageBuffer);

        // Prepare file for S3 upload
        const file = {
          originalname: `logo_${Date.now()}.${
            contentType.split("/")[1] || "png"
          }`,
          mimetype: contentType,
          buffer: buffer,
        };

        // Upload to S3
        uploadedImageUrl = await uploadToS3(file);
        console.log("Logo uploaded to S3:", uploadedImageUrl);
      } else {
        console.warn("No valid image found at Logo.dev for:", clientWebsite);
      }
    } catch (err) {
      console.error("Logo processing error:", err);
      // Continue without failing the entire request if logo is optional
    }

    // Save domain with or without logo
    const newDomain = new Domain({
      ...domainData,
      siteLogo: uploadedImageUrl || "", // Empty string if upload failed
    });

    const savedDomain = await newDomain.save();
    console.log("Domain saved successfully:", savedDomain);

    res.status(201).json({
      success: true,
      message: "Domain created successfully",
      data: savedDomain,
    });
  } catch (error) {
    console.error("addDomain error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
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
    console.log('into the update Domain Controller')
    try {
      const { id } = req.params;
      const updates = req.body; // Fields sent in the request
console.log("updates",updates)
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
      return res
        .status(404)
        .json({ success: false, message: "Domain not found" });
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

    res
      .status(200)
      .json({ message: "Update successful", domain: updatedDomain });
  } catch (error) {
    console.error("Error uploading logo and updating brand:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateDomainDetails = async (req, res) => {
  const domainId = req.params.id;
  const file = req.file;
  const updates = req.body;

  try {
    // 1. Validate domain exists
    const existingDomain = await Domain.findById(domainId);
    if (!existingDomain) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    let updateFields = {};
    let oldLogoKey = null;

    // 2. Handle logo upload if file exists
    if (file) {
      // Capture old logo key before updating
      if (existingDomain.siteLogo) {
        const existingUrl = existingDomain.siteLogo;
        const splitUrl = existingUrl.split(".amazonaws.com/");
        oldLogoKey = splitUrl.length === 2 ? splitUrl[1] : null;
      }

      // Upload new logo
      const newLogoUrl = await uploadToS3(file);
      updateFields.siteLogo = newLogoUrl;
    }
console.log("COLORS",updates.colors)
    // 3. Handle color updates
    if (updates.colors) {
      updateFields.colors = Array.isArray(JSON.parse(updates.colors))
        ? JSON.parse(updates.colors)
        :  updates.colors.join(", ");
    }

    // 4. Handle regular field updates
    const checkAndUpdate = (field, newValue) => {
      if (newValue !== undefined && newValue !== existingDomain[field]) {
        updateFields[field] = newValue;
      }
    };

    // Basic fields
    checkAndUpdate("clientName", updates.clientName);
    checkAndUpdate("clientDescription", updates.clientDescription);
    checkAndUpdate("industry", updates.industry);
    checkAndUpdate("niche", updates.niche);
    checkAndUpdate("clientWebsite", updates.clientWebsite);
    checkAndUpdate("language", updates.language);
    checkAndUpdate("country", updates.country);
    checkAndUpdate("state", updates.state);

    // 5. Handle marketing strategy updates
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

    // 6. Check if any updates exist
    if (Object.keys(updateFields).length === 0) {
      return res.status(200).json({
        success: true,
        message: "No changes detected",
        data: existingDomain,
      });
    }

    // 7. Perform the update
    const updatedDomain = await Domain.findByIdAndUpdate(
      domainId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // 8. Clean up old logo if new one was uploaded
    if (file && oldLogoKey) {
      try {
        await deleteFromS3([oldLogoKey]);
      } catch (err) {
        console.error("Error deleting old logo from S3:", err);
        // Continue with response even if deletion fails
      }
    }

    // 9. Return successful response
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

exports.addCharacterWithUpload = async (req, res) => {
  const { domainId } = req.params;
  const { characterName, bio } = req.body;
  const files = req.files;

  if (!characterName) {
    return res
      .status(400)
      .json({ success: false, error: "Character name is required" });
  }

  try {
    const domain = await Domain.findById(domainId);
    if (!domain) {
      return res
        .status(404)
        .json({ success: false, error: "Domain not found" });
    }

    // Upload profile picture
    let profilePictureUrl = "";
    if (files.profilePicture && files.profilePicture.length > 0) {
      profilePictureUrl = await uploadToS3({
        originalname: files.profilePicture[0].originalname,
        mimetype: files.profilePicture[0].mimetype,
        buffer: files.profilePicture[0].buffer,
      });
    }

    // Upload images
    const uploadedImages = [];
    if (files.images) {
      for (const file of files.images) {
        const imageUrl = await uploadToS3({
          originalname: file.originalname,
          mimetype: file.mimetype,
          buffer: file.buffer,
        });
        uploadedImages.push(imageUrl);
      }
    }

    // Add character
    domain.characters.push({
      profilePicture: profilePictureUrl,
      characterName,
      bio,
      images: uploadedImages,
    });

    await domain.save();

    res.status(200).json({
      success: true,
      message: "Character added with images",
      data: domain,
    });
  } catch (err) {
    console.error("Add character error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
};


exports.getDomainCharacters = async (req, res) => {
  try {
    const { domainId } = req.params;

    const domain = await Domain.findById(domainId);

    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }

    res.status(200).json({
      success: true,
      characters: domain.characters || [],
    });
  } catch (error) {
    console.error("getDomainCharacters error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};