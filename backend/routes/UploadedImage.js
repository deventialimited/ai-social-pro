const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  uploadUserImage,
  getUploadedImagesByUserId,
} = require("../controllers/UploadedImage");
const upload = multer(); // using multer memory storage

// Upload image
router.post("/uploadUserImage", upload.single("file"), uploadUserImage);

// Get all uploaded images by user ID
router.get("/getUploadedImagesByUserId/:userId", getUploadedImagesByUserId);

module.exports = router;
