const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UploadedImageSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  imageUrl: { type: String, required: true }, // S3 URL
  originalName: { type: String, default: "" }, // original file name
  size: { type: Number, default: 0 }, // size in bytes (optional)

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexing for faster retrieval
UploadedImageSchema.index({ userId: 1, createdAt: -1 });

UploadedImageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const UploadedImage = mongoose.model("UploadedImage", UploadedImageSchema);
module.exports = UploadedImage;
