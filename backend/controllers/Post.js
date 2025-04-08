const Domain = require("../models/Domain");
const Post = require("../models/Post");
exports.getAllPostsBydomainId = async (req, res) => {
  try {
    const { domainId } = req.body; // Extract domainId from query parameters

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
      "clientName clientWebsite"
    );

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.processPubSub = async (req, res) => {
  try {
    let rawBody = "";

    // Collect the data chunks from the request
    req.on("data", chunk => {
      rawBody += chunk;
    });

    // Once the data is fully received
    req.on("end", async () => {
      let jsonData;
      try {
        jsonData = JSON.parse(rawBody);
      } catch (err) {
        console.error("Invalid JSON body:", err.message);
        return res.status(400).json({ message: "Invalid JSON format" });
      }

      // Proceed with your existing logic
      const domain = await Domain.findOne({
        client_email: jsonData?.client_email,
        clientWebsite: jsonData?.website,
      });

      if (!domain) {
        return res.status(404).json({ message: "Domain not found" });
      }

      const newPost = new Post({
        postId: jsonData.post_id,
        domainId: domain._id,
        userId: domain.userId,
        image: jsonData.image,
        topic: jsonData.topic,
        content: jsonData.content,
        slogan: jsonData.slogan,
        postDate: new Date(jsonData.date),
        platform: jsonData.platform,
      });

      const savedPost = await newPost.save();
      console.log("Post saved to database:", savedPost);

      res.status(201).json({
        message: "Post saved successfully",
        postId: savedPost.postId,
        userId: savedPost.userId,
        domainId: savedPost.domainId,
      });
    });
  } catch (error) {
    console.error("Error in processPubSub controller:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

