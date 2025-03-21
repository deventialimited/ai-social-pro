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

    const authToken = authHeader.split(" ")[1];

    const decoded = verifyToken(authToken);
    if (!decoded.id) return res.status(401).json({ message: "Invalid token" });

    let user = await User.findById(decoded.id).select("+domains");
    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("getPostsLogs: user.domain " + JSON.stringify(user.domains));

    if (user.domains) {
      if (user.toObject) {
        console.log("user converted to object");
        user = user.toObject({ getters: true, flattenMaps: true });
      }

      console.log("Before transforming:", JSON.stringify(user.domains));

      const domainsObject = JSON.parse(JSON.stringify(user.domains));
      const dotDomains = {};

      function buildDomainRecursive(key, value) {
        let domainPart = key.replace(/^https?:\/\//, "").replace(/\/+$/, "");

        let node = value;
        while (
          node &&
          typeof node === "object" &&
          !Array.isArray(node) &&
          Object.keys(node).length === 1
        ) {
          const [childKey] = Object.keys(node);
          const childValue = node[childKey];
          const cleanChildKey = childKey.replace(/\/+$/, "");

          domainPart = domainPart
            ? domainPart + "." + cleanChildKey
            : cleanChildKey;

          node = childValue;
        }

        return { domainPart, finalData: node };
      }

      for (const [key, value] of Object.entries(domainsObject)) {
        console.log(
          "current domain: " + key + ", value:",
          JSON.stringify(value)
        );

        if (key.includes("_dot_")) {
          const realDomain = key.replace(/_dot_/g, ".");
          dotDomains[realDomain] = value;
        } else if (key.includes("___DOT__")) {
          const realDomain = key.replace(/___DOT___/g, ".");
          dotDomains[realDomain] = value;
        } else {
          const { domainPart, finalData } = buildDomainRecursive(key, value);
          dotDomains[domainPart] = finalData;
        }
      }

      console.log("final domains:", JSON.stringify(dotDomains));
      user.domains = dotDomains;
    }
    // ————————————————————————————————————————————————

    return res.status(200).json(user);
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

// new pubsub for fixing the issue
// export const processPubSub = async (req, res) => {
//   try {
//     const jsonData = req.body;

//     if (!jsonData || !Array.isArray(jsonData)) {
//       console.error("Invalid JSON payload:", jsonData);
//       return res.status(400).send("Invalid JSON payload, expected an array");
//     }

//     console.log("PubSub called with data:", jsonData.length, "posts");

//     // Step 1: Group posts by user email
//     const groupedPosts = jsonData.reduce((acc, post) => {
//       const userEmail = post.client_email;
//       if (!userEmail) {
//         console.warn("Skipping post without email:", post);
//         return acc;
//       }
//       acc[userEmail] = acc[userEmail] || [];
//       acc[userEmail].push(post);
//       return acc;
//     }, {});

//     // Step 2: Bulk insert grouped posts into each user document
//     const updatePromises = Object.entries(groupedPosts).map(
//       async ([email, posts]) => {
//         try {
//           return await User.findOneAndUpdate(
//             { email },
//             { $push: { posts: { $each: posts } } }, // bulk insert in array
//             { new: true, upsert: true }
//           );
//         } catch (err) {
//           console.error(`Error updating user ${email}:`, err);
//           throw err;
//         }
//       }
//     );

//     await Promise.all(updatePromises);

//     console.log("Successfully processed all posts.");
//     return res.status(200).send("All data processed successfully");
//   } catch (error) {
//     console.error("Error processing message:", error);
//     return res.status(500).json({
//       message: "skajdfhksadfhkljshldjf;l",
//       error: error.message, // or use `error.stack` to see more
//     });
//   }
// };

// my old working pubsub
export const processPubSub = async (req, res) => {
  try {
    const jsonData = req.body;


    console.log("PubSub called with data:", jsonData);

    
      const userEmail = jsonData.client_email;

      if (!userEmail) {
        console.warn("Skipping post without email:", post);
       return res.status(400).send("Post json must contain a client_email key");
      }

      await User.findOneAndUpdate(
        { email: userEmail },
        { $push: { posts: jsonData } },
        { new: true, upsert: true }
      );
    

    console.log("Successfully processed all posts.");
    return res.status(200).send("All data processed successfully");
  } catch (error) {
    console.error("Error processing message:", error);
    return res.status(500).send("Error processing message");
  }
};

//process test
//getsite test
//getpost api testing
//change protected post
