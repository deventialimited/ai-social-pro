const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
  saveOrUpdateTemplateDesign,
  getTemplateDesignsByUserId,
} = require("../controllers/TemplateDesign"); // <- Controller should match

// Accept both data and files in a single multipart/form-data request
router.post(
  "/saveOrUpdateTemplateDesign/:id?",
  upload.fields([
    { name: "files" }, // Multiple image/background files
    { name: "templateImage", maxCount: 1 },
  ]),
  saveOrUpdateTemplateDesign
);
router.get("/templates/:userId", getTemplateDesignsByUserId);

module.exports = router;
