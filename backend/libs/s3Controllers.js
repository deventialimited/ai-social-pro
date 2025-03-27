const AWS = require("aws-sdk");

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
      Key: `uploaded-taxpayer-files/${Date.now()}_${file.originalname}`,
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
