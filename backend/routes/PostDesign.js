const express = require("express");
const { saveOrUpdatePostDesign } = require("../controllers/PostDesign");
const router = express.Router();

// Create or Update PostDesign for a postId
router.post("/saveOrUpdatePostDesign", saveOrUpdatePostDesign);

module.exports = router;
