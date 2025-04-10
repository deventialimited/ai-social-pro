const express = require("express");
const {
  addDomain,
  getAllDomains,
  getDomainById,
  deleteDomain,
  getDomainsByUserId,
  updateDomain,
  uploadBrand,
 
} = require("../controllers/Domain");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
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
router.patch("/UpdateDomain/:id", updateDomain);
//update logo
router.patch("/updateBrand/:id", upload.single("logo"), uploadBrand);
module.exports = router;
