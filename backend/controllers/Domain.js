const Domain = require("../models/Domain");

// Add a new domain
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
  } = req.body;

  try {
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

// Update domain business data
exports.updateDomain = async (req, res) => {
  try {
    const { domainId } = req.params;
    const updates = req.body; // Fields sent in the request

    console.log("Updating domain:", domainId);
    console.log("Data received for update:", updates);

    if (!domainId) {
      return res.status(400).json({ success: false, message: "Domain ID is required" });
    }

    // Find the existing domain to keep untouched fields
    const existingDomain = await Domain.findById(domainId);
    if (!existingDomain) {
      return res.status(404).json({ success: false, message: "Domain not found" });
    }

    // Only update fields that are provided in the request
    const updatedDomain = await Domain.findByIdAndUpdate(
      domainId,
      { $set: updates }, // Only updates the provided fields
      { new: true, runValidators: true } // Returns updated document, applies validation
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