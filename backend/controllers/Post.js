const Domain = require("../models/Domain");
const Post = require("../models/Post");
const getRawBody = require("raw-body");
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
      "clientName clientWebsite siteLogo"
    );

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
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
exports.processPubSub = async (req, res) => {
  try {
    let jsonData = req.body;

    // Check if jsonData exists
    if (!jsonData || Object.keys(jsonData).length === 0) {
      return res.status(400).json({ message: "Generated posts is required" });
    }

    console.log("Generated Posts", JSON.stringify(jsonData));

    // Proceed with your existing logic
    const domain = await Domain.findOne({
      client_email: jsonData?.client_email,
      clientWebsite: jsonData?.website,
    });

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" });
    }

    const newPost = new Post({
      postId: jsonData?.post_id,
      domainId: domain._id,
      userId: domain.userId,
      image: jsonData?.image,
      topic: jsonData?.topic,
      content: jsonData?.content,
      slogan: jsonData?.slogan,
      postDate: new Date(jsonData?.date),
      platforms: Array.isArray(jsonData?.platform)
        ? jsonData.platform
        : [jsonData.platform], // Ensure it's an array
    });

    const savedPost = await newPost.save();
    console.log("Post saved to database:", savedPost);

    res.status(201).json({
      message: "Post saved successfully",
      postId: savedPost.postId,
      userId: savedPost.userId,
      domainId: savedPost.domainId,
    });
  } catch (error) {
    console.error("Error in processPubSub controller:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
