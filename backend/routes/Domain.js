const express = require("express");
const {
  addDomain,
  getAllDomains,
  getDomainById,
  deleteDomain,
  getDomainsByUserId,
  updateDomainBusiness,
  updateDomainMarketingStrategy
} = require("../controllers/Domain");
const router = express.Router();

// Add a new domain
router.post("/addDomain", addDomain);

// Get all domains
router.get("/getAllDomains", getAllDomains);

// Get domain by ID
router.get("/getDomainById/:id", getDomainById);

// Get all domains by userId
router.get("/getDomainsByUserId/:userId", getDomainsByUserId);

// Delete domain
router.delete("/deleteDomain/:id", deleteDomain);
// Route to update Business Information
router.patch("/business/:domainId", updateDomainBusiness);

// Route to update Marketing Strategy
router.patch("/marketing-strategy/:domainId", updateDomainMarketingStrategy);

module.exports = router;
