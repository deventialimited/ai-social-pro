const mongoose = require("mongoose");

// Define Marketing Strategy as an embedded object

const marketingStrategySchema = new mongoose.Schema(
  {
    targetAudience: [{ type: String, trim: true }], // Array of strings for multiple audiences
    audiencePains: [{ type: String, trim: true }], // Array of pains
    coreValues: [{ type: String, trim: true }], // Array of values
  },
  { _id: false }
); // Prevents auto-generating _id for subdocument
// Define the Domain schema with user reference
const domainSchema = new mongoose.Schema(
  {
    client_email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    clientWebsite: {
      type: String,
      trim: true,
    },
    clientName: {
      type: String,
      trim: true,
    },
    clientDescription: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    niche: {
      type: String,
      trim: true,
    },
    colors: {
      type: String,
      trim: true,
    },
    // Problems faced by the audience (comma-separated string or JSON)
    language: { type: String, required: false },
    country: { type: String, required: false },
    state: { type: String, required: false },
    siteLogo: {
      type: String, // URL of the logo
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      index: true, // Ensures efficient querying
    },
    marketingStrategy: marketingStrategySchema, // Embedded marketing strategy
  },
  {
    timestamps: true,
  }
);

// Method to get color array
domainSchema.methods.getColorArray = function () {
  return this.colors.split(", ").map((color) => color.trim());
};

// Create and export the model
const Domain = mongoose.model("Domain", domainSchema);

module.exports = Domain;
