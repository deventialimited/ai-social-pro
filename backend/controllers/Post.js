const Domain = require("../models/Domain");
const Post = require("../models/Post");
const axios = require("axios");
const { uploadToS3, deleteFromS3 } = require("../libs/s3Controllers"); // or wherever your S3 logic lives
const socket = require("../utils/socket");
const { generateDomainVisualAssets } = require("../helpers/generatePostImages");
const PostDesign = require("../models/PostDesign");
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
      "clientName clientWebsite siteLogo colors niche"
    );

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.updatePostImageFile = async (req, res) => {
  const { id } = req.params;
  const { type = "image" } = req.query;
  const typeMap = {
    image: "image",
    branding: "brandingImage",
    slogan: "sloganImage",
  };
  const schemaField = typeMap[type];

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

  const validTypes = Object.keys(typeMap);
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: `Invalid type provided. Must be one of: ${validTypes.join(
        ", "
      )}`,
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

    // Delete old image from S3 if exists
    const oldImageUrl = post[schemaField]?.imageUrl;
    if (oldImageUrl) {
      const oldImageKey = getS3KeyFromUrl(oldImageUrl);
      if (oldImageKey) {
        await deleteFromS3([oldImageKey]);
      }
    }

    // Upload new image to S3
    const fileForS3 = {
      originalname: `post_${type}_${Date.now()}_${file.originalname}`,
      mimetype: file.mimetype,
      buffer: file.buffer,
    };

    const uploadedImageUrl = await uploadToS3(fileForS3);

    // Update the corresponding image field
    post[schemaField] = {
      imageUrl: uploadedImageUrl,
      editorStatus: "edited",
    };

    await post.save();

    res.status(200).json({
      success: true,
      message: `${type} updated successfully`,
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
  const { topic, content, status } = req.body; // Get fields to update from request body

  // Validate required fields (at least one field should be provided to update)
  if (!topic && !content && !status) {
    return res.status(400).json({
      success: false,
      message:
        "At least one field (topic, content, or status) is required to update the post",
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
    console.log(
      "Updating post image for postId:",
      postId,
      "with imageUrl:",
      imageUrl
    );
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

    post.image = {
      imageUrl: uploadedImageUrl,
      editorStatus: "not_edited",
    };
    await post.save();

    const updatedPost = await Post.findOne({ postId }).populate(
      "domainId",
      "clientName clientWebsite siteLogo colors niche"
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
    if (!domain) {
      return res.status(404).json({ message: "client id not found" });
    }

    const newPost = new Post({
      postId: jsonData.post_id || "",
      domainId: domain._id,
      userId: domain.userId,
      image: "", // image will be added later
      topic: jsonData.topic || "",
      related_keywords: jsonData.related_keywords || [],
      content: jsonData.content || "",
      slogan: jsonData.slogan || "",
      imageIdeas: jsonData.imageIdeas || [], // Store imageIdeas from the response
      postDate: jsonData.date ? new Date(jsonData.date) : Date.now(),
      platform: jsonData.platform?.toLowerCase(),
    });

    const savedPost = await newPost.save();
    let logoUrl = domain?.siteLogo;

    // If siteLogo is an empty string, generate a letter-based logo
    if (!logoUrl || logoUrl.trim() === "") {
      const name = encodeURIComponent(domain?.clientName || "Logo");
      logoUrl = `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&format=png&size=128`;
    }
    console.log(domain);
    const generatedImages = await generateDomainVisualAssets({
      postId: savedPost?._id,
      platform: savedPost?.platform,
      sloganText: savedPost?.slogan,
      brandName: domain?.clientName,
      primaryColor: domain?.colors[1],
      brandLogoUrl: logoUrl,
      keywords:
        savedPost?.related_keywords?.length > 0
          ? [...savedPost?.related_keywords, domain?.niche]
          : [domain?.niche],
    });

    // Determine editorStatus based on fallbackCase
    const editorStatus = generatedImages.fallbackCase ? "not_edited" : "edited";

    savedPost.sloganImage = {
      imageUrl: generatedImages.sloganImage,
      editorStatus,
    };

    savedPost.brandingImage = {
      imageUrl: generatedImages.brandingImage,
      editorStatus,
    };

    console.log(savedPost);
    await savedPost.save();
    const postData = await Post.findById(savedPost._id).populate(
      "domainId",
      "clientName clientWebsite siteLogo colors niche"
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
      post: postData,
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
      .populate("domainId", "clientName clientWebsite siteLogo colors niche")
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
      platform: firstPost.platform,
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

exports.deletePost = async (req, res) => {
  const id = req.params.id;
  console.log("Deleting post ID:", id);

  if (!id) {
    return res.status(400).json({ message: "Post ID is required" });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Delete images from S3 if present
    const imageFields = ["image", "brandingImage", "sloganImage"];
    const keysToDelete = [];

    imageFields.forEach((field) => {
      const imageUrl = post[field]?.imageUrl;
      if (imageUrl) {
        const imageKey = getS3KeyFromUrl(imageUrl);
        if (imageKey) {
          keysToDelete.push(imageKey);
        }
      }
    });

    if (keysToDelete.length > 0) {
      await deleteFromS3(keysToDelete);
    }

    // Delete associated PostDesigns and their images
    const postDesigns = await PostDesign.find({ postId: post._id });

    const allFilesToDelete = [];

    for (const design of postDesigns) {
      const designElements = design.elements || [];

      designElements.forEach((el) => {
        if (el.props?.src) {
          const key = el.props.src.split("/").pop();
          allFilesToDelete.push(key);
        }
      });

      if (design.backgrounds?.src) {
        const key = design.backgrounds.src.split("/").pop();
        allFilesToDelete.push(key);
      }
    }

    // Now delete PostDesigns
    await PostDesign.deleteMany({ postId: post._id });

    // Delete all related images from S3
    if (allFilesToDelete.length > 0) {
      await deleteFromS3(allFilesToDelete);
    }

    // Delete Post itself
    await Post.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Post and related assets deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.updatePostStatusToPublished = async (req, res) => {
  const { postId, status, socialMediaLinks } = req.body;
  console.log("Updating status for post ID:", postId, "to:", status);

  // Validate required fields
  if (!postId) {
    return res.status(400).json({ message: "Post ID is required" });
  }
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }
  if (
    status.toLowerCase() === "published" &&
    (!socialMediaLinks ||
      !Array.isArray(socialMediaLinks) ||
      socialMediaLinks.length === 0)
  ) {
    return res.status(400).json({
      message:
        "socialMediaLinks must be a non-empty array of { platform, url } objects for published status",
    });
  }

  const normalizedStatus = status.toLowerCase();
  const validStatuses = ["generated", "scheduled", "published"];
  if (!validStatuses.includes(normalizedStatus)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  // Validate socialMediaLinks array entries
  if (normalizedStatus === "published") {
    for (const entry of socialMediaLinks) {
      if (!entry.platform || !entry.url) {
        return res.status(400).json({
          message: "Each socialMediaLinks entry must have platform and url",
        });
      }
      // Validate URL format
      if (!/^https?:\/\/.+/.test(entry.url)) {
        return res.status(400).json({
          message: `Invalid URL format for ${entry.platform}: ${entry.url}`,
        });
      }
    }
  }

  try {
    const post = await Post.findOne({ postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Ensure post is in "scheduled" status before allowing "published"
    if (normalizedStatus === "published" && post.status !== "scheduled") {
      return res.status(400).json({
        message: `Post is not in scheduled status, current status: ${post.status}`,
      });
    }

    // Append new socialMediaLinks for "published" status, avoiding duplicates
    if (normalizedStatus === "published") {
      const existingPlatforms = post.socialMediaLinks.map((entry) =>
        entry.platform.toLowerCase()
      );
      const newLinks = socialMediaLinks.filter(
        (entry) => !existingPlatforms.includes(entry.platform.toLowerCase())
      );
      if (newLinks.length === 0 && socialMediaLinks.length > 0) {
        return res.status(400).json({
          message: "All provided platforms already have associated URLs",
        });
      }
      post.socialMediaLinks.push(
        ...newLinks.map((entry) => ({
          platform: entry.platform.toLowerCase(),
          url: entry.url,
        }))
      );
    }

    // Update status and timestamp
    post.status = normalizedStatus;
    post.updatedAt = Date.now();
    await post.save();

    // Emit socket.io event
    const io = socket.getIO();
    const room = `room_${post.userId}`;
    io.to(room).emit("postStatusUpdated", {
      postId: post.postId,
      _id: post._id,
      status: post.status,
      domainId: post.domainId,
      updatedAt: post.updatedAt,
    });
    console.log(`Emitted postStatusUpdated to ${room} for post ${postId}`);

    res.status(200).json({
      message: `Post status updated to ${normalizedStatus} successfully`,
      post,
    });
  } catch (error) {
    console.error("Error updating post status:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error in post data",
        error: Object.values(error.errors)
          .map((err) => err.message)
          .join(", "),
      });
    }
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.updatePostTab = async (req, res) => {
  try {
    const { postId } = req.params;
    const { selectedTab } = req.body;
    const userId = req.user.id; // From authMiddleware

    // Validate selectedTab
    const validTabs = ["aiImage", "brandingImage", "sloganImage"];
    if (!selectedTab || !validTabs.includes(selectedTab)) {
      return res.status(400).json({ error: "Invalid tab value" });
    }

    // Find post and verify user authorization
    const post = await Post.findOne({ postId });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update selectedTab
    post.selectedTab = selectedTab;
    post.updatedAt = new Date();
    await post.save();

    res.json({ success: true, selectedTab: post.selectedTab });
  } catch (error) {
    console.error("Error updating post tab:", error);
    res.status(500).json({ error: "Failed to update post tab" });
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
