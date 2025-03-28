const Domain = require('../routes/Domain'); // Adjust path as needed

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
    user 
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
      user
    };

    const newDomain = new Domain(domainData);
    const savedDomain = await newDomain.save();

    res.status(201).json({
      success: true,
      message: "Domain created successfully",
      data: savedDomain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all domains
exports.getAllDomains = async (req, res) => {
  try {
    const domains = await Domain.find().populate('user', 'username email');

    res.status(200).json({
      success: true,
      count: domains.length,
      data: domains
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get domain by ID
exports.getDomainById = async (req, res) => {
  const domainId = req.params.id;

  try {
    const domain = await Domain.findById(domainId)
      .populate('user', 'username email');

    if (!domain) {
      return res.status(404).json({
        success: false,
        error: "Domain not found"
      });
    }

    res.status(200).json({
      success: true,
      data: domain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
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
        error: "Domain not found"
      });
    }

    await Domain.findByIdAndDelete(domainId);

    res.status(200).json({
      success: true,
      message: "Domain deleted successfully",
      data: domain
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  addDomain: exports.addDomain,
  getAllDomains: exports.getAllDomains,
  getDomainById: exports.getDomainById,
  deleteDomain: exports.deleteDomain
};