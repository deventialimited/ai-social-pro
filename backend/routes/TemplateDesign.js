const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
  saveOrUpdateTemplateDesign,
  getTemplateDesignsByUserId,
  deleteTemplateDesign,
} = require("../controllers/TemplateDesign"); // <- Controller should match

// Accept both data and files in a single multipart/form-data request
router.post(
  "/saveOrUpdateTemplateDesign",
  upload.fields([
    { name: "files" }, // Multiple image/background files
    { name: "templateImage", maxCount: 1 },
  ]),
  saveOrUpdateTemplateDesign
);
router.get("/:userId", getTemplateDesignsByUserId);
router.delete("/deleteTemplateDesign/:id", deleteTemplateDesign);

module.exports = router;
