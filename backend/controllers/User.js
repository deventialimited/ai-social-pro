require("dotenv").config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { v4: uuidv4 } = require("uuid"); // For generating unique filenames
const sendWelcomeEmail = require("../helpers/email/welcomeEmail");
const sendTwoFactorOtpEmail = require("../helpers/email/twoFactorEmail");
const sendResetPasswordEmail = require("../helpers/email/resetPasswordEmail");
const sendVerificationEmail = require("../helpers/email/verificationEmail");
const { sendSms } = require("../helpers/sms/sendSms");
const socket = require("../utils/socket");
exports.sendPhoneVerificationOtp = async (req, res) => {
  const { phone, userId } = req.body;

  try {
    // Check if the phone number is already linked to another verified account
    const existingUser = await User.findOne({ phone, phoneVerified: true });
    if (existingUser && existingUser._id.toString() !== userId.toString()) {
      return res.status(400).json({
        success: false,
        error: "This phone number is already verified with another account.",
      });
    }

    // Check if the user exists
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error:
          "User does not exist. Please verify your details or create a new account.",
      });
    }

    // If the user's phone is missing or different from the incoming phone number, update it
    if (!user.phone || user.phone !== phone) {
      user.phone = phone;
      user.phoneVerified = false; // Reset verification status
      await user.save();
    } else if (user.phoneVerified) {
      return res.status(400).json({
        success: false,
        error:
          "Phone number already verified. You can continue using your account.",
      });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    console.log("OTP sent to phone:", otp); // For testing purposes
    // Include userId in the token
    const token = jwt.sign({ userId, phone, otp }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    // Send OTP via SMS using the helper
    const message = `Your verification code is: ${otp}`;
    const smsResponse = await sendSms(phone, message);

    if (!smsResponse.success) {
      return res.status(500).json({
        success: false,
        error: `Failed to send SMS: ${smsResponse.error}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to phone successfully",
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

//edit profile
exports.editProfile = async (req, res) => {
  const userId = req.params.id;
  const { username, email, phone } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    // Handle image upload if a new image is provided
    if (req.file) {
      // Delete existing profile image if it exists
      if (user.profileImage) {
        const existingImageKey = user.profileImage.split("/").pop(); // Get the file key from URL
        const deleteParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `profile-images/${existingImageKey}`,
        };

        await s3.deleteObject(deleteParams).promise();
      }

      // Upload the new profile image to S3
      const file = req.file;
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `profile-images/${uuidv4()}_${file.originalname}`, // Unique filename
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const uploadResult = await s3.upload(s3Params).promise();
      user.profileImage = uploadResult.Location; // Save the image URL in the database
    }

    // Save the updated user to the database
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Register user
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if a user with the provided email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        error: "This email has already signed up with us, please sign in.",
      });
    }
    // Generate the image URL using the admin's name
    const profileImage = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
      email
    )}`;
    // If user does not exist, create a new user
    user = new User({
      username,
      email,
      password,
      profileImage,
    });
    await user.save(); // Ensures the pre("save") hook runs
    // Generate OTP for email verification
    const otp = crypto.randomInt(100000, 999999).toString();
    const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });
    await sendVerificationEmail(email, otp);

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      token,
      user,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Looks like you're le new here! Let's get you signed up.",
      });
    }
    // Check if the user has a Facebook or Google account or doesn't have a password set
    if (user.googleId && !user.password) {
      return res.status(400).json({
        success: false,
        error:
          "The password you have entered is wrong. please try again or reset your password",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error:
          "The password you have entered is wrong. please try again or reset your password",
      });
    }
    if (!user?.emailVerified) {
      // Generate OTP for email verification
      const otp = crypto.randomInt(100000, 999999).toString();
      const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, {
        expiresIn: "5m",
      });
      console.log("OTP sent to email:", otp); // For testing purposes
      // await sendVerificationEmail(email, otp);

      return res.status(200).json({
        success: true,
        message: "You are unverified user. Please verify your email.",
        emailUnVerified: true,
        token,
        user,
      });
    }
    if (user.twoFactorEnabled) {
      const methods = user.twoFactorMethods;
      let token;

      // Generate OTP if email 2FA is enabled
      if (methods.email) {
        const otp = crypto.randomInt(100000, 999999).toString();
        token = jwt.sign({ email, otp }, process.env.JWT_SECRET, {
          expiresIn: "5m",
        });

        await sendTwoFactorOtpEmail(email, otp);
      }

      // Return the response indicating that 2FA is required
      return res.status(200).json({
        success: true,
        message: "Two-factor authentication required",
        twoFactorRequired: true,
        user,
        methods,
        token: methods.email ? token : undefined, // Include the token if email 2FA is enabled
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
exports.sendEmailVerificationOtp = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error:
          "User does not exist. Please verify your details or create a new account.",
      });
    }

    if (user.emailVerified) {
      return res
        .status(400)
        .json({ success: false, error: "This email is already verified." });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const token = jwt.sign({ email, otp }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });
    await sendVerificationEmail(email, otp);
    // console.log("OTP sent to email:", otp); // For testing purposes
    res.status(200).json({
      success: true,
      message: "OTP sent to email successfully.",
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Verify Email and Phone
exports.verifyOtp = async (req, res) => {
  const { token, otp, method } = req.body; // method can be "email" or "phone"

  try {
    // Decode the JWT to retrieve the necessary information, this will also check if the token is expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the OTP matches
    if (decoded.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Oops! That OTP doesn’t match. Please try again.",
      });
    }

    let updateField = {};
    let queryField = {};

    // Determine which method is being verified
    if (method === "email") {
      queryField = { email: decoded.email };
      updateField = { emailVerified: true };
    } else if (method === "phone") {
      queryField = { _id: decoded.userId }; // Use userId instead of phone
      updateField = { phoneVerified: true };
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid verification method. Please use 'email' or 'phone'.",
      });
    }

    // Update the user's verification status
    const user = await User.findOneAndUpdate(queryField, updateField, {
      new: true,
    });

    // If user is not found, return an error
    if (!user) {
      return res.status(404).json({
        success: false,
        error:
          "User does not exist. Please verify your details or create a new account.",
      });
    }

    // If email is verified, send a welcome email
    if (method === "email") {
      await sendWelcomeEmail(user.email, user.username);
    }

    res.status(200).json({
      success: true,
      message: `${
        method.charAt(0).toUpperCase() + method.slice(1)
      } verified successfully`,
      user,
    });
  } catch (error) {
    // Handle token expiration error
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        error: "Your session has expired. Please request a new OTP",
      });
    }

    // Handle other errors
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.googleAuth = async (req, res) => {
  const { googleId, name, email, picture } = req.body;
  try {
    let user = await User.findOne({ email });
    let userType;
    // Generate the image URL using the admin's name
    const profileImage = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
      name
    )}`;
    if (!user) {
      // If the user doesn't exist, create a new user
      user = await User.create({
        username: name,
        email: email,
        googleId: googleId,
        profileImage: picture || profileImage,
        emailVerified: true, // Google accounts are generally verified
      });
      await sendWelcomeEmail(email, name);
      userType = "new";
    } else {
      // If user exists but doesn't have googleId, update googleId and emailVerified
      if (!user.googleId) {
        user.googleId = googleId;
        user.emailVerified = true; // Mark email as verified if logging in via Google
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      user,
      userType,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Forgot Password Controller
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error:
          "We couldn't find an account with this email. Please check and try again.",
      });
    }
    if (user?.status === "blocked") {
      return res.status(403).json({
        success: false,
        error: `Your account is blocked, please contact us for more information: <a href="mailto:taxpro@simpple.tax" target="_blank" rel="noopener noreferrer" class="text-blue-500">taxpro@simpple.tax</a>`,
      });
    }
    if (user?.isDeletedByAdmin) {
      return res.status(403).json({
        success: false,
        error: `Your account has been deleted. Please contact us at: <a href="mailto:taxpro@simpple.tax" target="_blank" rel="noopener noreferrer" class="text-blue-500">taxpro@simpple.tax</a>`,
      });
    }
    // Generate a reset token with a 5-minute expiration
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    // Determine the URL based on whether the user has a password
    let resetUrl;
    if (user.password) {
      resetUrl = `${process.env.Base_User_Url}?reset-password-userId=${user._id}&token=${token}`;
    } else {
      resetUrl = `${process.env.Base_User_Url}?set-password-userId=${user._id}&token=${token}`;
    }

    // Send email with the reset link
    await sendResetPasswordEmail(user.email, resetUrl);
    if (user.password) {
      res.status(200).json({
        message:
          "Check your email for the password reset link. If you don't see it, check your spam or junk folder.",
      });
    } else {
      res.status(200).json({
        message:
          "Check your email for the set new password link. If you don't see it, check your spam or junk folder.",
      });
    }
  } catch (error) {
    console.error("Error in forgotPassword controller:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Reset Password Controller
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params; // Get the user ID from the URL params
    const { token, newPassword } = req.body; // Get the token and new password from the request body

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          error: "This link has expired. Please request a new password reset.",
        });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(400).json({
          error: "This link has expired. Please request a new password reset.",
        });
      } else {
        return res.status(400).json({
          error: "This link has expired. Please request a new password reset.",
        });
      }
    }

    // Ensure the token is for the correct user
    if (decoded.id !== id) {
      return res.status(400).json({
        error: "This link has expired. Please request a new password reset.",
      });
    }

    // Find the user by ID and resetPasswordToken and ensure the token is still valid
    const user = await User.findOne({
      _id: id,
    });

    if (!user) {
      return res.status(400).json({
        error:
          "User does not exist. Please verify your details or create a new account.",
      });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Set Password Controller
exports.setPassword = async (req, res) => {
  try {
    const { id } = req.params; // Get the user ID from the URL params
    const { token, newPassword } = req.body; // Get the token and new password from the request body

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          error: "This link has expired. Please request a new password reset.",
        });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(400).json({
          error: "This link has expired. Please request a new password reset.",
        });
      } else {
        return res.status(400).json({
          error: "This link has expired. Please request a new password reset.",
        });
      }
    }

    // Ensure the token is for the correct user
    if (decoded.id !== id) {
      return res.status(400).json({
        error: "This link has expired. Please request a new password reset.",
      });
    }

    // Find the user by ID
    const user = await User.findOne({
      _id: id,
    });

    if (!user) {
      return res.status(400).json({
        error:
          "User does not exist. Please verify your details or create a new account.",
      });
    }

    // Ensure the user does not already have a password
    if (user.password) {
      return res.status(400).json({
        error:
          "This account already has a password. Please log in or reset your password if needed.",
      });
    }

    // Set the user's password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password set successfully!" });
  } catch (error) {
    console.error("Error in setPassword controller:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.setupTwoFactorAuth = async (req, res) => {
  const { method, enabled } = req.body; // "email" or "authenticatorApp" and a boolean to enable/disable
  const userId = req.params.id; // User ID passed in the request

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (method === "email") {
      // Enable or disable 2FA via email
      user.twoFactorMethods.email = enabled;
      user.twoFactorEnabled =
        user.twoFactorMethods.email || user.twoFactorMethods.authenticatorApp;
    } else if (method === "authenticatorApp") {
      if (enabled) {
        // Generate a secret for TOTP and send it to the user
        const secret = speakeasy.generateSecret({ length: 20 });
        if (user?.appVerified) {
          user.twoFactorMethods.authenticatorApp = true;
        }
        user.twoFactorSecret = secret.base32; // Store the base32 encoded secret

        // Generate the QR code URL for the user's authenticator app
        const otpauthUrl = secret.otpauth_url;
        const qrCode = await qrcode.toDataURL(otpauthUrl);

        // Save changes before returning the QR code
        await user.save();

        return res.status(200).json({
          success: true,
          message: "Authenticator App 2FA enabled successfully.",
          qrCode, // Send QR code to frontend
          secret: secret.base32, // Optionally, send the secret
          user,
        });
      } else {
        // Disable authenticator app 2FA
        user.twoFactorMethods.authenticatorApp = false;
        user.appVerified = false;
        user.twoFactorSecret = null; // Clear the stored secret
        user.twoFactorEnabled =
          user.twoFactorMethods.email || user.twoFactorMethods.authenticatorApp;
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid 2FA method" });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `${method === "email" ? "Email" : "Authenticator App"} 2FA ${
        enabled ? "enabled" : "disabled"
      } successfully.`,
      user,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.verifyTwoFactorAuth = async (req, res) => {
  const { userId, otp, method, token } = req.body; // method is either "email" or "authenticatorApp"
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (method === "authenticatorApp") {
      // Verify the OTP against the stored secret for TOTP
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: otp,
        window: 1, // Adjust the window for tolerance of clock drift if necessary
      });
      if (!isValid) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      } else if (!user?.appVerified) {
        // If OTP is valid, update the appVerified status
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId },
          {
            "twoFactorMethods.authenticatorApp": true,
            appVerified: true, // Set appVerified to true
          },
          { new: true }
        );

        return res.status(200).json({
          success: true,
          message: "Authenticator App verified successfully.",
          user: updatedUser,
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "Authenticator App verified successfully.",
          user: user,
        });
      }
    } else if (method === "email") {
      try {
        // Verify OTP sent via email
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.otp !== otp) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid OTP" });
        } else {
          return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user,
          });
        }
      } catch (error) {
        // Handle token errors
        if (error.name === "TokenExpiredError") {
          return res
            .status(400)
            .json({ success: false, message: "OTP has expired." });
        } else if (error.name === "JsonWebTokenError") {
          return res
            .status(400)
            .json({ success: false, message: "Invalid token." });
        } else {
          return res
            .status(400)
            .json({ success: false, message: "Token verification failed." });
        }
      }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid 2FA method" });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all users with tax returns
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users sorted by createdAt
    const users = await User.find().sort({ createdAt: -1 });

    // Process each user to include detailed tax returns
    const usersWithTaxReturns = await Promise.all(
      users.map(async (user) => {
        // Fetch tax returns for the current user
        const taxReturns = await TaxReturn.find({ userId: user._id });

        // Fetch detailed info for each tax return
        const detailedTaxReturns = await Promise.all(
          taxReturns.map(async (taxReturn) => {
            return await getTaxReturnInfo(taxReturn._id);
          })
        );

        // Append tax returns to the user
        return {
          ...user.toObject(), // Convert user to plain object
          taxReturns: detailedTaxReturns, // Append detailed tax returns
        };
      })
    );

    // Send the response
    res.status(200).json({
      success: true,
      data: usersWithTaxReturns,
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Block/Activate User Controller
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params; // Get the user ID from the URL params
    const { status } = req.body; // Get the new status from the request body

    // Validate the new status
    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update the user's status
    user.status = status;
    await user.save();
    const io = socket.getIO(); // Get the Socket.IO instance

    if (status === "blocked") {
      io.emit("user_account_status_updated", {
        userId: user?._id,
      });
    }
    res.status(200).json({
      success: true,
      message: `${user?.username} account has been ${
        status === "active" ? "activated" : "blocked"
      } successfully.`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get User Account Status Controller
exports.getUserAccountStatus = async (req, res) => {
  try {
    const { id } = req.params; // Get user ID from request params

    // Find the user by ID
    const user = await User.findById(id).select("status");

    if (!user) {
      return res.status(200).json({ status: "Deleted" });
    }

    res.status(200).json({ status: user.status });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    // Find and update the user to mark as deleted
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all tax returns associated with the user
    const taxReturns = await TaxReturn.find({ userId: id });
    const taxReturnIds = taxReturns.map((tr) => tr._id);

    // Loop through each tax return and delete related messages
    for (const taxReturnId of taxReturnIds) {
      // Find associated documents for the tax return
      const documents = await Document.find({ taxReturnId });

      // Extract document keys for deletion
      const DockeysToDelete = documents.map((doc) => {
        const fileKey = new URL(doc.documentURL).pathname.split("/").pop();
        return `uploaded-taxpayer-files/${fileKey}`;
      });

      // Delete documents from S3 using the deleteFromS3 function
      if (DockeysToDelete.length > 0) {
        await deleteFromS3(DockeysToDelete);
      }
      const signaturefiles = await SignatureFile.find({ taxReturnId });

      // Extract document keys for deletion
      const SigkeysToDelete = signaturefiles.flatMap((file) => {
        const keys = [];

        // Extract admin file key
        if (file.adminFileUrl) {
          const adminFileKey = new URL(file.adminFileUrl).pathname
            .split("/")
            .pop();
          keys.push(`uploaded-taxpayer-files/${adminFileKey}`);
        }

        // Extract user file key
        if (file.userFileUrl) {
          const userFileKey = new URL(file.userFileUrl).pathname
            .split("/")
            .pop();
          keys.push(`uploaded-taxpayer-files/${userFileKey}`);
        }

        return keys;
      });

      // Delete documents from S3 using the deleteFromS3 function
      if (SigkeysToDelete.length > 0) {
        await deleteFromS3(SigkeysToDelete);
      }

      // Delete associated records in MongoDB
      await AnswerOrField.deleteMany({ taxReturnId });
      await Document.deleteMany({ taxReturnId });
      await BillingHistory.deleteMany({ taxReturnId });
      await SignatureFile.deleteMany({ taxReturnId });
      // Find messages associated with the tax return
      const messages = await Messages.find({ taxReturnId });
      let messageFileKeysToDelete = [];
      // Extract file keys for deletion from messages
      messageFileKeysToDelete.push(
        ...messages.flatMap((message) =>
          message.files.map((file) => {
            const fileKey = new URL(file.fileUrl).pathname.split("/").pop();
            return `uploaded-taxpayer-files/${fileKey}`;
          })
        )
      );
      // Delete message files from S3
      if (messageFileKeysToDelete.length > 0) {
        await deleteFromS3(messageFileKeysToDelete);
      }
      // Delete messages for the current tax return
      await Messages.deleteMany({ taxReturnId });

      await TaxReturn.findByIdAndDelete(taxReturnId);
    }

    const io = socket.getIO(); // Get the Socket.IO instance
    if (io) {
      io.emit("user_account_status_updated", {
        userId: user?._id,
      });
      io.emit("tax_return_updated", {
        isTaxReturnUpdated: true,
      });
    } else {
      console.error("Socket.IO instance is not initialized");
    }
    res.status(200).json({
      success: true,
      message: "User and associated tax return messages deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user and related data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateSelectedDomain = async (req, res) => {
  const { userId, selectedWebsiteId } = req.body;

  try {
    // Ensure valid input
    if (!userId || !selectedWebsiteId) {
      return res
        .status(400)
        .json({ error: "User ID and Domain ID are required." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update the user's selected domain
    console.log("current website", user.selectedWebsiteId);
    user.selectedWebsiteId = selectedWebsiteId;
    console.log("new website", user.selectedWebsiteId);
    await user.save();

    // Return the updated user
    res
      .status(200)
      .json({ message: "Selected domain updated successfully.", user });
  } catch (error) {
    console.error("Error updating selected domain:", error);
    res
      .status(500)
      .json({ error: "Server error while updating selected domain." });
  }
};

exports.updatePlatformConnection = async (req, res) => {
  try {
    const { userId, platformName, status } = req.body;
    if (!userId || !platformName || !status) {
      console.log("missing data", req.body);
      return res
        .status(400)
        .json({ error: "userId, platformName and status are required." });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) return res.status(404).json({ error: "User not found." });

    const platformIndex = user.PlatformConnected.findIndex(
      (item) => item.platformName.toLowerCase() === platformName.toLowerCase()
    );

    if (platformIndex > -1) {
      // Update existing platform
      user.PlatformConnected[platformIndex].status = status;
    } else {
      // Add new platform
      user.PlatformConnected.push({ platformName, status });
    }

    await user.save();
    const io = socket.getIO(); // Get the Socket.IO instance
    if (!io) {
      console.error("Socket.IO instance is not initialized");
    }
    // Emit an event to the specific user
    io.emit("userUpdated", user);

    res.status(200).json({
      message: "Platform connection updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Error updating platform connection:", error);
    res.status(500).json({ error: "Server error while updating platform." });
  }
};

exports.getSocialAccountsStatus = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const foundUser = await User.findById(userId).lean();

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const connectedPlatforms =
      foundUser.PlatformConnected?.filter((p) => p.status === "connected") ||
      [];

    res.status(200).json(connectedPlatforms);
  } catch (error) {
    console.error("Error fetching social account status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.disconnectPlatform = async (req, res) => {
  try {
    const { userId, platformName } = req.body;
    console.log("Disconnect ", req.body);
    if (!userId || !platformName) {
      return res
        .status(400)
        .json({ message: "userId and platformName are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const before = user.PlatformConnected.length;

    user.PlatformConnected = user.PlatformConnected.filter(
      (acc) => acc.platformName.toLowerCase() !== platformName.toLowerCase()
    );

    const after = user.PlatformConnected.length;

    if (before === after) {
      return res
        .status(400)
        .json({ message: "Platform not found or already removed" });
    }

    await user.save();
    return res
      .status(200)
      .json({ message: `${platformName} disconnected`, user });
  } catch (error) {
    console.error("Error disconnecting social platform:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.addPostSchedule = async (req, res) => {
  try {
    const { userId, postScheduleData } = req.body;
    const { days, times, randomize } = postScheduleData;
    console.log("selected DAYS", days);
    console.log(postScheduleData);
    console.log("publishong fdats", times);
    if (!days || !times) {
      console.log("selectedDays and publishing times mising");
      return res.status(400).json({
        success: false,
        message: "selectedDays and publishingTimes are required.",
      });
    }
    console.log("selected DAYS", days);
    const user = await User.findByIdAndUpdate(
      userId,
      {
        postSchedule: {
          selectedDays: days,
          publishingTimes: times,
          randomizeTime: randomize,
          createdAt: new Date(),
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post schedule updated successfully.",
      user: user,
    });
  } catch (error) {
    console.error("Error updating post schedule:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};
