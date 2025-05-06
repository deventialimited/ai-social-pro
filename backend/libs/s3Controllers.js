const AWS = require("aws-sdk");
const multer = require("multer");

// S3 Configuration
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Uploads a file to S3 and returns the file URL
 * @param {Object} file - The file to upload
 * @returns {Promise<string>} - The URL of the uploaded file
 */
exports.uploadToS3 = async (file) => {
  try {
    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `domains-brand-logo/${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploadResult = await s3.upload(s3Params).promise();
    return uploadResult.Location;
  } catch (error) {
    console.error("Error in uploadToS3:", error);
    throw new Error("Failed to upload file to S3");
  }
};

/**
 * Deletes multiple files from S3
 * @param {string[]} keys - Array of S3 object keys to delete
 * @returns {Promise<Object>} - Result of the delete operation
 */
exports.deleteFromS3 = async (keys) => {
  if (!Array.isArray(keys) || keys.length === 0) {
    return { success: false, message: "No keys provided for deletion" };
  }

  const objectsToDelete = keys.map((key) => ({ Key: key }));

  const deleteParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Delete: { Objects: objectsToDelete },
  };

  try {
    const deleteResult = await s3.deleteObjects(deleteParams).promise();
    const deletedKeys = deleteResult.Deleted.map((obj) => obj.Key);

    return {
      success: true,
      message: "Files deleted successfully",
      deletedKeys,
    };
  } catch (error) {
    console.error("Error in deleteFromS3:", error);
    throw new Error("Failed to delete files from S3");
  }
};
exports.uploadToS3ForPostDesign = async ({
  postId,
  files,
  elements,
  backgrounds,
}) => {
  const uploaded = [];

  for (const file of files) {
    const matchedElement = elements.find((el) => el.id === file.originalname);
    const matchedBackgroundKey = Object.keys(backgrounds || {}).find(
      (key) => key === file.originalname
    );

    let fileType = null;
    let folderName = null;

    if (matchedElement) {
      fileType = "elements";
      folderName = matchedElement.type;
    } else if (matchedBackgroundKey) {
      fileType = "backgrounds";
      folderName = "custom";
    } else {
      continue; // Unknown file, skip
    }

    const key = `post-design-files/post-${postId}/${fileType}/${folderName}/${Date.now()}_${
      file.originalname
    }`;

    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploadResult = await s3.upload(s3Params).promise();

    uploaded.push({
      type: fileType === "elements" ? "element" : "background",
      id: file.originalname,
      url: uploadResult.Location,
    });
  }

  return uploaded;
};

exports.deleteFromS3ForPostDesign = async (urls) => {
  if (!urls.length) return;

  const keys = urls.map((url) => {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.substring(1)); // remove leading slash
  });

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Delete: { Objects: keys.map((Key) => ({ Key })) },
  };

  try {
    await s3.deleteObjects(params).promise();
  } catch (error) {
    console.error("Failed to delete from S3", error);
    throw error;
  }
};

const allowedElementTypesWithFiles = ["image"];
const allowedFileFields = ["files"];

exports.validatePostDesignUpload = (req, res, next) => {
  try {
    const data = JSON.parse(req.body.data);
    const { elements = [], backgrounds = {} } = data;
    const files = req.files?.files || [];

    // Step 1: Prepare allowed file IDs
    const requiredFileIds = new Set();

    if (files?.length > 0) {
      // From elements
      for (const el of elements) {
        if (allowedElementTypesWithFiles.includes(el.type)) {
          requiredFileIds.add(el.id);
        }
      }

      // From background
      if (["image", "video"].includes(backgrounds?.type)) {
        requiredFileIds.add("background");
      }
    }
    // Step 2: Verify uploaded files match required
    const uploadedFileIds = new Set(files?.map((file) => file.originalname));

    const missingFiles = [...requiredFileIds].filter(
      (id) => !uploadedFileIds.has(id)
    );
    const unexpectedFiles = [...uploadedFileIds].filter(
      (id) => !requiredFileIds.has(id)
    );

    if (missingFiles.length > 0) {
      return res.status(400).json({
        error: `Missing required files: ${missingFiles.join(", ")}`,
      });
    }

    if (unexpectedFiles.length > 0) {
      return res.status(400).json({
        error: `Unexpected uploaded files: ${unexpectedFiles.join(", ")}`,
      });
    }
    // Write updated data back into request for further use
    req.postDesignData = data;

    next();
  } catch (err) {
    console.error("Validation Middleware Error:", err);
    return res.status(400).json({ error: "Invalid postDesign data structure" });
  }
};
