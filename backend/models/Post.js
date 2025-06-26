const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: "Domain" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  postId: { type: String, default: "" },
  image: {
    imageUrl: { type: String, default: "" },
    editorStatus: {
      type: String,
      enum: ["not_edited", "edited"],
      default: "not_edited",
    },
  },
  brandingImage: {
    imageUrl: { type: String, default: "" },
    editorStatus: {
      type: String,
      enum: ["not_edited", "edited"],
      default: "not_edited",
    },
  },
  sloganImage: {
    imageUrl: { type: String, default: "" },
    editorStatus: {
      type: String,
      enum: ["not_edited", "edited"],
      default: "not_edited",
    },
  },

  topic: { type: String, default: "" },
  content: { type: String, default: "" },
  slogan: { type: String, default: "" },

  date: { type: Date, default: Date.now },
  platform: { type: String, default: "" },
  related_keywords: { type: [String], default: [] },
  status: { type: String, default: "generated" },
  socialMediaLinks: [
    {
      platform: {
        type: String,
        enum: ["twitter", "instagram", "facebook", "linkedin"],
        required: true,
      },
      url: { type: String, required: true },
    },
  ],
  followers: { type: Number, default: 0, min: 0 },
  imageIdeas: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PostSchema.index({ platform: 1, createdAt: -1 });

PostSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

PostSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
