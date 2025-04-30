const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const {
  saveOrUpdatePostDesign,
  getPostDesignById,
} = require("../controllers/PostDesign");
const { validatePostDesignUpload } = require("../libs/s3Controllers");

// Accept both data and files in a single multipart/form-data request
router.post(
  "/saveOrUpdatePostDesign/:postId",
  upload.fields([
    { name: "files" }, // Accept multiple files
  ]),
  validatePostDesignUpload,
  saveOrUpdatePostDesign
);

router.get("/:id", getPostDesignById);

module.exports = router;
