const Domain = require("../models/Domain");

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
    // Convert comma-separated values into arrays
    const marketingStrategy = {
      coreValues: core_values.split(",").map((value) => value.trim()),
      targetAudience: audience.split(",").map((value) => value.trim()),
      audiencePains: audiencePains.split(",").map((value) => value.trim()),
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

    const siteLogo = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
      clientWebsite
    )}`;

    const newDomain = new Domain({ ...domainData, siteLogo });

    const savedDomain = await newDomain.save();

    res.status(201).json({
      success: true,
      message: "Domain created successfully",
      data: savedDomain,
    });
  } catch (error) {
    console.log(error);
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
    const domains = await Domain.find({ userId })
      .populate("userId", "username email")
      .lean()
      .hint({ userId: 1 });

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
    const { domainId } = req.params;
    const updates = req.body; // Fields sent in the request

    console.log("Updating domain:", domainId);
    console.log("Data received for update:", updates);

    if (!domainId) {
      return res
        .status(400)
        .json({ success: false, message: "Domain ID is required" });
    }

    // Find the existing domain
    const existingDomain = await Domain.findById(domainId);
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
        coreValues:
          JSON.stringify(updates.marketingStrategy.core_values) !==
          JSON.stringify(existingDomain.marketingStrategy?.coreValues)
            ? updates.marketingStrategy.core_values
            : existingDomain.marketingStrategy?.coreValues,

        audiencePains:
          JSON.stringify(updates.marketingStrategy.audiencePains) !==
          JSON.stringify(existingDomain.marketingStrategy?.audiencePains)
            ? updates.marketingStrategy.audiencePains
            : existingDomain.marketingStrategy?.audiencePains,

        targetAudience:
          JSON.stringify(updates.marketingStrategy.audience) !==
          JSON.stringify(existingDomain.marketingStrategy?.targetAudience)
            ? updates.marketingStrategy.audience
            : existingDomain.marketingStrategy?.targetAudience,
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
      domainId,
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
