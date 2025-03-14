/**
 * User Model
 * Defines the schema for users in MongoDB
 */
import mongoose from "mongoose";

// Domain schema embedded within User
const domainSchema = new mongoose.Schema(
  {
    logoUrl: String,
    companyName: String,
    companyDescription: String,
    industry: String,
    websiteUrl: String,
    // Add additional fields as needed
  },
  { _id: false }
);

// Post schema embedded within User
const postSchema = new mongoose.Schema(
  {
    post_id: {
      type: String,
      required: true,
    },
    content: String,
    image: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String, // Store hashed password
      required: function () {
        return !this.googleId; // Password required only if not using Google login
      },
    },
    googleId: {
      type: String,
      sparse: true, // Allows multiple `null` values for Google users
    },
    displayName: {
      type: String,
      required: true,
    },
    createdTime: {
      type: Date,
      default: Date.now,
    },
    // Store domains as a Map with domain name as key
    domains: {
      type: Map,
      of: Object, // Ensure domainSchema exists or use Object
      default: {},
    },
    // Array of posts
    posts: {
      type: [Object], // Ensure postSchema exists or use Object
      default: [],
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt`
  }
);

export default mongoose.model("User", userSchema);
