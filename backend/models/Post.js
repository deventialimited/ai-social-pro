const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Post Schema
 * Main schema for social media posts
 */
const PostSchema = new Schema(
  {
    postId: {
      type: String,
      default: "",
      unique: true,
      index: true,
      sparse: true, // Only index non-null, non-empty values
    },
    domainId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain", // References the Domain model
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
    },
    // Content fields
    image: { type: String, default: "" },
    topic: { type: String, default: "" },
    content: { type: String, default: "" },
    slogan: { type: String, default: "" }, // Added slogan field

    // Metadata
    postDate: { type: Date, default: Date.now }, // Renamed date to postDate
    platform: {
      type: [String],
      default: [], // Optional: provides a default empty array
    },
    status: { type: String, default: "" },
    followers: { type: Number, default: 0, min: 0 },

    // Design elements
    shapes: [
      {
        id: { type: String, default: "" },
        type: {
          type: String,
          default: "rectangle",
          enum: ["rectangle", "circle", "triangle", "text", "line", "custom"],
        },
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        width: { type: Number, default: 100 },
        height: { type: Number, default: 100 },
        color: { type: String, default: "#000000" },
        zIndex: { type: Number, default: 1 },
        rotation: { type: Number, default: 0 },
        textContent: { type: String, default: "" },
        transparency: { type: Number, default: 0, min: 0, max: 100 },
        effects: {
          shadow: { type: Boolean, default: false },
          blur: { type: Number, default: 0 },
          offsetX: { type: Number, default: 0 },
          offsetY: { type: Number, default: 0 },
          opacity: { type: Number, default: 100 },
          color: { type: String, default: "#000000" },
        },
        borderStyle: {
          type: String,
          default: "solid",
          enum: ["solid", "dashed", "dotted", "none"],
        },
        borderColor: { type: String, default: "#000000" },
        borderWidth: { type: Number, default: 1, min: 0 },
      },
    ],
    images: [
      {
        id: { type: String, default: "" },
        url: { type: String, default: "" },
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        width: { type: Number, default: 200 },
        height: { type: Number, default: 300 },
        rotation: { type: Number, default: 0 },
        zIndex: { type: Number, default: 1 },
      },
    ],
    backgroundColor: { type: String, default: "#ffffff" },
    backgroundImage: { type: String, default: null },

    // History tracking
    history: { type: Array, default: [] },
    historyIndex: { type: Number, default: -1 },

    // Image transformations
    imageScale: { type: Number, default: 1 },
    imageRotation: { type: Number, default: 0 },
    imagePosition: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    imageFilters: {
      brightness: { type: Number, default: 100, min: 0, max: 200 },
      contrast: { type: Number, default: 100, min: 0, max: 200 },
      saturation: { type: Number, default: 100, min: 0, max: 200 },
    },
    imageEffects: {
      blur: { type: Number, default: 0, min: 0, max: 100 },
      brightness: { type: Number, default: 100, min: 0, max: 200 },
      sepia: { type: Number, default: 0, min: 0, max: 100 },
      grayscale: { type: Number, default: 0, min: 0, max: 100 },
      border: { type: Number, default: 0, min: 0 },
      cornerRadius: { type: Number, default: 0, min: 0 },
      shadow: {
        blur: { type: Number, default: 0, min: 0 },
        offsetX: { type: Number, default: 0 },
        offsetY: { type: Number, default: 0 },
      },
    },
    scaleX: { type: Number, default: 1 },
    scaleY: { type: Number, default: 1 },

    // Engagement metrics
    analytics: {
      views: { type: Number, default: 0, min: 0 },
      likes: { type: Number, default: 0, min: 0 },
      shares: { type: Number, default: 0, min: 0 },
      comments: { type: Number, default: 0, min: 0 },
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    versionKey: false, // Don't include __v field
    strict: false, // Allow for flexibility in the schema
  }
);

// Index for faster queries
PostSchema.index({ platform: 1, createdAt: -1 });
PostSchema.index({ "analytics.views": -1 });

// Middleware to update the updatedAt field on save
PostSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for post age in days
PostSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to track post analytics update
PostSchema.methods.updateAnalytics = function (metrics) {
  if (metrics.views) this.analytics.views += metrics.views;
  if (metrics.likes) this.analytics.likes += metrics.likes;
  if (metrics.shares) this.analytics.shares += metrics.shares;
  if (metrics.comments) this.analytics.comments += metrics.comments;
  return this.save();
};

// Create a model from the schema
const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
