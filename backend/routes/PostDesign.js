const express = require("express");
const { saveOrUpdatePostDesign, getPostDesignById } = require("../controllers/PostDesign");
const router = express.Router();

// Create or Update PostDesign for a postId
router.post("/saveOrUpdatePostDesign", saveOrUpdatePostDesign);

// Get PostDesign by ID
router.get("/:id", getPostDesignById);

module.exports = router;
