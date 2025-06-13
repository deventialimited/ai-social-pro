const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const PostScheduleSchema = new mongoose.Schema(
  {
    selectedDays: {
      type: [String],
      default: [], // e.g., ['Monday', 'Wednesday']
    },
    publishingTimes: {
      type: String,
    },
    randomizeTime: {
      type: String, // e.g., '0 min (disabled)', '15 min'
      default: "0 min",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      minlength: [8, "Password must be at least 8 characters long"],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    profileImage: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorMethods: {
      email: {
        type: Boolean,
        default: false,
      },
      authenticatorApp: {
        type: Boolean,
        default: false,
      },
    },
    twoFactorSecret: {
      type: String, // This will store the secret key for the authenticator app
      required: function () {
        return this.twoFactorMethods.authenticatorApp === true;
      },
    },
    appVerified: {
      type: Boolean,
      default: false,
    },

    selectedWebsiteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      default: null,
    },
    stripeCustomerId: {
      type: String,
    },
    subscriptionId: {
      type: String,
    },
    subscriptionStatus: {
      type: String,
      enum: [
        "active",
        "past_due",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "trialing",
        "unpaid",
      ],
    },
    plan: {
      type: String,
      enum: ["starter", "professional","trial"],
      default:"trial"
    },
    trialStartedAt: { type: Date, default: null },
  trialEndsAt: { type: Date, default: null },
  hasUsedTrial: { type: Boolean, default: false },
    billingCycle: {
      type: String,
      enum: ["month", "yearly"],
    },
  
    PlatformConnected: [
      {
        platformName: {
          type: String,
        },
        status: {
          type: String,
          enum: ["connected", "disconnected"],
          default: "disconnected",
        },
      username:{
type:string
      },
        _id: false,
      },
    ],
    postSchedule: PostScheduleSchema,
  },

  { timestamps: true }
);

// Encrypt password before saving and emit socket events for new users
userSchema.pre("save", async function (next) {
  // Encrypt the password if it has been modified
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  // Update lastModified field
  this.lastModified = Date.now();
  next();
});

// Method to check password validity
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
