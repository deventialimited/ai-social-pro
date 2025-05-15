const mongoose = require("mongoose");

const templateDesignSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  templateId: {
    type: String,
    required: true,  // Make sure templateId is also required
  },
  templateType: {
    type: String, // e.g., "public", "private"
    required: true,  // Marked as required
  },
  templateImage: {
    type: String, // URL to show preview of the template
  },

  canvas: {
    width: Number,
    height: Number,
    ratio: String, // e.g., "16:9", "1:1", or custom
    styles: Object, // additional canvas-wide styles (e.g. boxShadow, border)
  },

  elements: [
    {
      id: { type: String, unique: true }, // unique frontend ID
      type: { type: String },
      category: { type: String }, // e.g., header, subheader, body (for text), or shape type
      position: {
        x: Number,
        y: Number,
      },
      size: {
        width: Number,
        height: Number,
      },
      rotation: Number,
      opacity: Number,
      zIndex: Number,
      effects: Object, // flexible style object (e.g., color, fontSize, backgroundImage, borderRadius, etc.)
      styles: Object, // flexible style object (e.g., color, fontSize, backgroundImage, borderRadius, etc.)
      props: Object, // specific props (e.g., text content, image URL, etc.)
      visible: Boolean,
      locked: Boolean,
    },
  ],

  layers: [
    {
      id: String,
      name: String,
      elementId: String,
      visible: Boolean,
      locked: Boolean,
    },
  ],

  backgrounds: {
    type: { type: String }, // "color", "gradient", "image", "video"
    url: String, // only if image or video
    color: String, // only if color
    gradient: Object, // if gradient
  },

  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TemplateDesign", templateDesignSchema);
