/**
 * Post Controller
 * Handles post creation, updates, and retrieval
 */
import User from "../models/User.model.js";
import Post from "../models/Post.model.js";
import { uploadBase64Image } from "../utils/imageUpload.js";
import { verifyToken } from "../config/jwt.js";

/**
 * Get all posts for a user
 * @route GET /api/posts
 */
export const getPosts = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const authToken = authHeader.split(" ")[1]; // Extract token

    // Verify token
    const decoded = verifyToken(authToken);
    if (!decoded.id) return res.status(401).json({ message: "Invalid token" });

    // Find user by ID
    let user = await User.findById(decoded.id).select("+domains");

    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("getPostsLogs: user.domain " + JSON.stringify(user.domains));
    // ———————————————— Transform domains here ————————————————
    if (user.domains) {
      if (user.toObject) {
        console.log("user converted to object");
        user = user.toObject({ getters: true, flattenMaps: true });
 
      }
    
      console.log("Before transforming:", JSON.stringify(user.domains)); // Debug log
    
      const dotDomains = {};
      const domainsObject = JSON.parse(JSON.stringify(user.domains)); // Ensure it is a plain object
    
      for (const [key, value] of Object.entries(domainsObject)) {
        console.log("current domain: " + key + ", value:", JSON.stringify(value));
        const realDomain = key.replace(/_dot_/g, ".");
        dotDomains[realDomain] = value;
      }
    
      console.log("final domains:", JSON.stringify(dotDomains));
      user.domains = dotDomains;
    }
    
    // ————————————————————————————————————————————————

    return res.status(200).json(user); // Return the transformed user object
  } catch (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


/**
 * Update a post
 * @route POST /api/posts/update
 */
export const updatePostData = async (req, res) => {
  try {
    const { post } = req.body;

    if (!post || !post.post_id) {
      return res.status(400).json({ error: "Invalid post data" });
    }

    const user = req.user; // From auth middleware

    // If base64 image is provided, upload to Cloudinary
    if (post.imageBase64 && post.imageBase64 !== "") {
      // Upload image to Cloudinary
      const imageUrl = await uploadBase64Image(post.imageBase64);

      // Update post with new image URL
      post.image = imageUrl;

      // Remove base64 data
      delete post.imageBase64;
    } else if (post.imageBase64) {
      // If empty base64 string, just remove it
      delete post.imageBase64;
    }

    // Update post in database
    await User.findOneAndUpdate(
      {
        _id: user._id,
        "posts.post_id": post.post_id,
      },
      {
        $set: { "posts.$": post },
      }
    );

    res.status(200).json({ success: "Post updated successfully" });
  } catch (error) {
    console.error("Error in updatePostData:", error);
    res.status(500).json({ error: `Error: ${error.message}` });
  }
};

/**
 * Create a new post
 * @route POST /api/posts/create
 */
export const createPost = async (req, res) => {
  try {
    const { post } = req.body;

    if (!post || !post.post_id) {
      return res.status(400).json({ error: "Invalid post data" });
    }

    const user = req.user; // From auth middleware

    // If base64 image is provided, upload to Cloudinary
    if (post.imageBase64 && post.imageBase64 !== "") {
      const imageUrl = await uploadBase64Image(post.imageBase64, "posts");
      post.imageUrl = imageUrl;
      delete post.imageBase64;
    }

    // Create new post document in MongoDB
    const newPost = new Post({
      userId: user._id, // Associate post with user
      title: post.title,
      content: post.content,
      imageUrl: post.imageUrl || "", // If no image, store empty string
    });

    // Save post in the Posts collection
    await newPost.save();

    // Also save reference to the post in the User's document
    await User.findByIdAndUpdate(user._id, { $push: { posts: newPost._id } });

    res.status(201).json({
      success: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error("Error in createPost:", error);
    res.status(500).json({ error: `Error: ${error.message}` });
  }
};

/**
 * Process posts from PubSub
 * @route POST /api/posts/pubsub
 */
export const processPubSub = async (req, res) => {
  try {
    const jsonData = req.body;

    if (!jsonData || typeof jsonData !== "object") {
      console.error("Invalid JSON payload:", jsonData);
      return res.status(400).send("Invalid JSON payload");
    }

    console.log("PubSub called with data:", jsonData);

    // Extract email from request body
    const userEmail = jsonData.client_email;

    if (!userEmail) {
      return res.status(400).send("User email is required.");
    }

    // Find user by email and update their posts
    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail }, // Find user by email
      { $push: { posts: jsonData } },
      { new: true, upsert: true } // Ensures user exists or creates it
    );

    console.log("Successfully updated MongoDB.", updatedUser);
    return res.status(200).send("Data processed successfully");
  } catch (error) {
    console.error("Error processing message:", error);
    return res.status(500).send("Error processing message");
  }
};

//process test
//getsite test
//getpost api testing
//change protected post
