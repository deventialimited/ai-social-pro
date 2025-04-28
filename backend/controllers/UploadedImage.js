const UploadedImage = require("../models/UploadedImage");
const User = require("../models/User");
const { uploadToS3 } = require("../libs/s3Controllers");
// Upload an image
exports.uploadUserImage = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;

    if (!userId || !file) {
      return res.status(400).json({ message: "User ID and file are required" });
    }

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upload to S3
    const imageUrl = await uploadToS3(file);

    // Save in MongoDB
    const uploadedImage = new UploadedImage({
      userId,
      imageUrl,
      originalName: file.originalname,
      size: file.size,
    });

    await uploadedImage.save();

    res
      .status(201)
      .json({ message: "Image uploaded successfully", data: uploadedImage });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all uploaded images by user
exports.getUploadedImagesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const images = await UploadedImage.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json(images);
  } catch (error) {
    console.error("Error fetching uploaded images:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
