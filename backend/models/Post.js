const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: "Domain" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  image: { type: String, default: "" },
  topic: { type: String, default: "" },
  content: { type: String, default: "" },
  slogan: { type: String, default: "" },

  date: { type: Date, default: Date.now },
  platforms: { type: [String], default: [] },
  status: { type: String, default: "generated" },
  followers: { type: Number, default: 0, min: 0 },

  // 👇 Editor status to track if edited by user in main editor
  editorStatus: {
    type: String,
    enum: ["not_edited", "edited"],
    default: "not_edited",
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PostSchema.index({ platforms: 1, createdAt: -1 });

PostSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

PostSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
