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

exports.updateDomainBusiness = async (req, res) => {
    try {
        const { domainId } = req.params; // Get domain ID from URL params
        const updates = req.body; // Get updated business details from request body

        const updatedDomain = await Domain.findByIdAndUpdate(domainId, updates, { 
            new: true, // Return updated document
            runValidators: true // Ensure validation rules are applied
        });

        if (!updatedDomain) {
            return res.status(404).json({ success: false, message: "Domain not found" });
        }

        res.status(200).json({ success: true, message: "Business updated successfully", data: updatedDomain });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


// Update Marketing Strategy
exports.updateDomainMarketingStrategy = async (req, res) => {
    try {
        const { domainId } = req.params; // Get domain ID from URL params
        const { marketingStrategy } = req.body; // Get marketing strategy updates

        if (!marketingStrategy) {
            return res.status(400).json({ success: false, message: "No marketing strategy data provided" });
        }

        const updatedDomain = await Domain.findByIdAndUpdate(
            domainId, 
            { marketingStrategy }, 
            { new: true, runValidators: true }
        );

        if (!updatedDomain) {
            return res.status(404).json({ success: false, message: "Domain not found" });
        }

        res.status(200).json({ success: true, message: "Marketing strategy updated successfully", data: updatedDomain });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};