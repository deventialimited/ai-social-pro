const express = require("express");
const {
  addDomain,
  getAllDomains,
  getDomainById,
  deleteDomain,
} = require("../controllers/Domain");
const router = express.Router();

// Add a new domain
router.post("/addDomain", addDomain);

// Get all domains
router.get("/getAllDomains", getAllDomains);

// Get domain by ID
router.get("/getDomainById/:id", getDomainById);

// Delete domain
router.delete("/deleteDomain/:id", deleteDomain);

module.exports = router;
