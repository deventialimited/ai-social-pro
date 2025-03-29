const express = require("express");
const {
  addDomain,
  getAllDomains,
  getDomainById,
  deleteDomain,
  getDomainsByUserId,
  updateDomain,
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
// Update domain business information
router.patch("/updateDomain/:id", updateDomain);

module.exports = router;
