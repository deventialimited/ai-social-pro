const Domain = require("../models/Domain");
const Post = require("../models/Post");
const getRawBody = require("raw-body");
const axios = require("axios");
const { uploadToS3, deleteFromS3 } = require("../libs/s3Controllers"); // or wherever your S3 logic lives
const mongoose = require("mongoose");
const socket = require("../utils/socket");
exports.getAllPostsBydomainId = async (req, res) => {
  try {
    const { domainId } = req.params; // Extract domainId from query parameters

    // Validate domainId
    if (!domainId) {
      return res.status(400).json({ message: "Domain ID is required" });
    }

    // Find the domain by ID
    const domain = await Domain.findById(domainId);
    if (!domain) {
      return res.status(404).json({ message: "Domain not found" });
    }

    // Fetch all posts associated with the domain
    const posts = await Post.find({ domainId }).populate(
      "domainId",
      "clientName clientWebsite siteLogo colors"
    );

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.updatePostImageFile = async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Post ID is required",
    });
  }

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "Image file is required",
    });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // If old image exists, delete it from S3
    if (post.image) {
      const oldImageKey = getS3KeyFromUrl(post.image);
      if (oldImageKey) {
        await deleteFromS3([oldImageKey]);
      }
    }

    // Upload new image
    const fileForS3 = {
      originalname: `post_image_${Date.now()}_${file.originalname}`,
      mimetype: file.mimetype,
      buffer: file.buffer,
    };

    const uploadedImageUrl = await uploadToS3(fileForS3);

    // Update DB
    post.image = uploadedImageUrl;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Post image updated successfully",
      post,
    });
  } catch (error) {
    console.error("Error updating post image:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading image or updating post",
      error: error.message,
    });
  }
};
// Update a post
exports.updatePost = async (req, res) => {
  const { id } = req.params; // Get id from URL parameters
  const { topic, content, platforms, status } = req.body; // Get fields to update from request body

  // Validate required fields (at least one field should be provided to update)
  if (!topic && !content && !platforms && !status) {
    return res.status(400).json({
      success: false,
      message:
        "At least one field (topic, content, platforms, or status) is required to update the post",
    });
  }

  // Validate id
  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Post ID (_id) is required",
    });
  }

  try {
    // Check if the post exists
    const existingPost = await Post.findById(id);
    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Prepare the update object with only the fields that are provided
    const updateData = {};
    if (topic !== undefined) updateData.topic = topic;
    if (content !== undefined) updateData.content = content;
    if (platforms !== undefined && platforms?.length > 0) {
      // Validate platforms (ensure it's an array of strings)
      if (!Array.isArray(platforms)) {
        return res.status(400).json({
          success: false,
          message: "Platforms must be an array of strings",
        });
      }
      updateData.platforms = platforms;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // Return the updated document
    );
    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    // Respond with the updated post
    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update post",
      error: error.message,
    });
  }
};

exports.updatePostImage = async (req, res) => {
  try {
    const { postId, imageUrl } = req.body;

    if (!postId || !imageUrl) {
      return res
        .status(400)
        .json({ message: "postId and imageUrl are required" });
    }

    const post = await Post.findOne({ postId }).populate("domainId");
    if (!post) {
      return res.status(501).json({ message: "Post not found" });
    }

    let uploadedImageUrl = "";
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      const buffer = Buffer.from(response.data, "binary");
      const file = {
        originalname: `downloaded_${Date.now()}.jpg`,
        mimetype: response.headers["content-type"],
        buffer,
      };

      uploadedImageUrl = await uploadToS3(file);
    } catch (err) {
      console.error("Failed to fetch or upload image:", err);
      return res
        .status(500)
        .json({ message: "Image upload failed", error: err.message });
    }

    post.image = uploadedImageUrl;
    await post.save();

    const updatedPost = await Post.findOne({ postId }).populate(
      "domainId",
      "clientName clientWebsite siteLogo colors"
    );

    socket
      .getIO()
      .to(`room_${post.userId}_${post.domainId._id}`)
      .emit("PostImageUpdated", {
        message: "Image added to post",
        post: updatedPost,
      });

    res.status(200).json({
      message: "Post image updated successfully",
      postId: post._id,
      imageUrl: uploadedImageUrl,
    });
  } catch (error) {
    console.error("Error in updatePostImage:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.processPubSub = async (req, res) => {
  try {
    console.log("into pubsub");
    const jsonData = req.body;

    if (!jsonData || Object.keys(jsonData).length === 0) {
      return res
        .status(400)
        .json({ message: "Generated post data is required" });
    }

    console.log("Generated Post:", JSON.stringify(jsonData));

    const domain = await Domain.findOne({ client_id: jsonData?.client_id });
    console.log("Domain:", domain);
    if (!domain) {
      return res.status(404).json({ message: "client id not found" });
    }

    const newPost = new Post({
      postId: jsonData.post_id || "",
      domainId: domain._id,
      userId: domain.userId,
      image: "", // image will be added later
      topic: jsonData.topic || "",
      content: jsonData.content || "",
      slogan: jsonData.slogan || "",
      postDate: jsonData.date ? new Date(jsonData.date) : Date.now(),
      platforms: Array.isArray(jsonData.platform)
        ? jsonData.platform
        : jsonData.platform
        ? [jsonData.platform]
        : [],
    });

    const savedPost = await newPost.save();

    const postData = await Post.findById(savedPost._id).populate(
      "domainId",
      "clientName clientWebsite siteLogo colors"
    );

    socket
      .getIO()
      .to(`room_${domain?.userId}_${domain?._id}`)
      .emit("PostSaved", {
        message: "Post created without image",
        post: postData,
      });

    res.status(201).json({
      message: "Post created successfully (without image)",
      postId: savedPost.postId,
    });
  } catch (error) {
    console.error("Error in processPubSub:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getFirstPost = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Domain ID:", id); // Log the domainId for debugging

    // Check if domain exists
    const domainExists = await Domain.findById(id);
    if (!domainExists) {
      return res
        .status(404)
        .json({ success: false, message: "Domain not found" });
    }

    // Find the first post for this domain (sorted by createdAt)
    const firstPost = await Post.findOne({ domainId: id })
      .populate("domainId", "clientName clientWebsite siteLogo colors")
      .sort({ createdAt: 1 }) // Get the oldest post (first created)
      .lean(); // Convert to plain JavaScript object
    console.log(firstPost);
    if (!firstPost) {
      console.error("No posts found for this domain....if no firstPost"); // Log if no posts are found
      return res.status(404).json({
        success: false,
        message: "No posts found for this domain",
      });
    }

    // Format the response data
    const responseData = {
      id: firstPost._id,
      domainId: firstPost.domainId,
      domainInfo: {
        // Add a separate object for domain info
        clientName: firstPost.domainId.clientName,
        clientWebsite: firstPost.domainId.clientWebsite,
        siteLogo: firstPost.domainId.siteLogo,
      },
      userId: firstPost.userId,
      image: firstPost.image,
      topic: firstPost.topic,
      content: firstPost.content,
      slogan: firstPost.slogan,
      date: firstPost.date,
      platforms: firstPost.platforms,
      status: firstPost.status,
      followers: firstPost.followers,
      editorStatus: firstPost.editorStatus,
      createdAt: firstPost.createdAt,
      updatedAt: firstPost.updatedAt,
      ageInDays: firstPost.ageInDays, // Utilizing the virtual property
    };
    console.log("First Post Data:", responseData); // Log the response data for debugging
    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching first post:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching first post",
      error: error.message,
    });
  }
};

exports.updatePostTime = async (req, res) => {
  const { postId, newTime } = req.body;

  if (!postId || !newTime) {
    return res.status(400).json({ error: "postId and newTime are required" });
  }

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { date: new Date(newTime) },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res
      .status(200)
      .json({ message: "Post time updated successfully", post: updatedPost });
  } catch (error) {
    console.error("Error updating post time:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

function getS3KeyFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const key = decodeURIComponent(urlObj.pathname).substring(1); // remove leading '/'
    return key;
  } catch (e) {
    console.error("Invalid URL:", url);
    return null;
  }
}
