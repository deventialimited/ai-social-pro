const { v4: uuidv4 } = require("uuid");
const Domain = require("../models/Domain");
const Post = require("../models/Post");
const User = require("../models/User");
const getRawBody = require("raw-body");
const axios = require("axios");
const { uploadToS3, deleteFromS3 } = require("../libs/s3Controllers"); // or wherever your S3 logic lives
const mongoose = require("mongoose");
const socket = require("../utils/socket");
const TemplateDesign = require("../models/TemplateDesign");
const puppeteer = require("puppeteer");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");
const mime = require("mime-types");
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
const platformDimensions = [
  { width: 1200, height: 675, ratio: "1.91:1" }, // Facebook, LinkedIn, Twitter
  { width: 1080, height: 1080, ratio: "1:1" }, // Instagram
  // Add more if needed
];
// Helper to prepare file object from path
const prepareFileObject = async (filePath) => {
  const buffer = await fsp.readFile(filePath); // <-- THIS will work only with fs.promises
  return {
    originalname: path.basename(filePath),
    mimetype: mime.lookup(filePath) || "application/octet-stream",
    buffer,
  };
};
const automateCreateTemplates = async (
  userId,
  sloganText,
  domainId,
  postId
) => {
  // Get primary brand color
  const domain = await Domain.findById(domainId);

  let logoUrl = domain?.siteLogo;

  // If siteLogo is an empty string, generate a letter-based logo
  if (!logoUrl || logoUrl.trim() === "") {
    const name = encodeURIComponent(domain?.clientName || "Logo");
    logoUrl = `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&format=png&size=128`;
  }

  const user = await User.findById(userId);
  const bgColor = domain?.colors?.[0] || "rgba(255,255,255,1)";

  const dimensions = platformDimensions[0]; // pick first for now
  const canvasWidth = dimensions.width;
  const canvasHeight = dimensions.height;

  const paddingBottom = canvasHeight * 0.1;
  const paddingLeft = canvasWidth * 0.1;

  const imageWidth = canvasWidth * 0.1;
  const imageHeight = imageWidth;

  const imageX = paddingLeft;
  const imageY = canvasHeight - imageHeight - paddingBottom;

  const textX = imageX + imageWidth + 30; // 10px gap from image
  const textY = imageY;

  // --- SLOGAN TEMPLATE ---
  const sloganElementId = `text-${uuidv4()}`;
  const imageId = `text-${uuidv4()}`;

  const sloganTemplate = await TemplateDesign.create({
    userId,
    templateId: `${user?.username}-${uuidv4()}`,
    templateImage: "Some",
    templateType: "private",
    templateCategory: "slogan",
    canvas: {
      width: dimensions.width,
      height: dimensions.height,
      ratio: dimensions.ratio,
      styles: {
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        backgroundColor: bgColor,
      },
    },
    elements: [
      {
        id: sloganElementId,
        type: "text",
        category: "header",
        position: { x: dimensions.width / 2, y: dimensions.height / 2 },
        effects: {
          blur: { enabled: false, value: 3 },
          textStroke: { enabled: false, value: 2, color: "#808080" },
          background: {
            enabled: true,
            cornerRadius: 0,
            padding: "20px",
            opacity: 100,
            color: "#FFFFFF",
          },
          shadow: {
            enabled: false,
            blur: 0,
            offsetX: 0,
            offsetY: 0,
            opacity: 100,
            color: "#000000",
          },
        },
        styles: {
          color: "#000000",
          fontSize: "36px",
          fontWeight: "bold",
          maxWidth: "90%",
          width: "max-content",
          height: "auto",
          zIndex: 1,
          transform: "translate(-50%, -50%)", // Add this
          position: "absolute",
          padding: "20px",
          left: "50%",
          top: "50%",
          textAlign: "center",
          verticalAlign: "middle",
          backgroundColor: "#FFFFFF",
          borderRadius: "0px",
          opacity: 1,
        },
        props: { text: sloganText || "Slogan Here" },
        visible: true,
        locked: false,
      },
    ],
    layers: [
      {
        id: `layer-${uuidv4()}`,
        elementId: sloganElementId,
        visible: true,
        locked: false,
      },
    ],
    backgrounds: {
      type: "color",
      color: bgColor,
    },
    version: 1,
  });

  // --- BRANDING TEMPLATE ---
  const brandingTemplate = await TemplateDesign.create({
    userId,
    templateId: `${user?.username}-${uuidv4()}`,
    templateImage: "Some",
    templateType: "private",
    templateCategory: "branding",
    canvas: {
      width: dimensions.width,
      height: dimensions.height,
      ratio: dimensions.ratio,
      styles: {
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        backgroundColor: bgColor,
      },
    },
    elements: [
      {
        id: imageId,
        type: "image",
        position: { x: imageX, y: imageY },
        effects: {
          blur: { enabled: false, value: 10 },
          brightness: { enabled: false, value: 100 },
          sepia: { enabled: false, value: 0 },
          grayscale: { enabled: false, value: 0 },
          border: { enabled: false, value: 2, color: "#000000" },
          cornerRadius: { enabled: true, value: imageWidth / 2 },
          shadow: {
            enabled: false,
            blur: 5,
            offsetX: 0,
            offsetY: 0,
            opacity: 100,
            color: "#000000",
          },
        },
        styles: {
          width: imageWidth,
          height: imageHeight,
          zIndex: 1,
          position: "absolute",
          borderRadius: `${imageWidth / 2}px`,
          objectFit: "cover",
        },
        props: {
          src: logoUrl,
          previewUrl: logoUrl,
          mask: "circle",
          originalSrc: logoUrl,
        },
        visible: true,
        locked: false,
      },
      {
        id: sloganElementId,
        type: "text",
        category: "slogan",
        position: { x: textX, y: textY },
        effects: {
          blur: { enabled: false, value: 3 },
          textStroke: { enabled: false, value: 2, color: "#808080" },
          background: {
            enabled: true,
            cornerRadius: 0,
            padding: 10,
            opacity: 100,
            color: "#FFFFFF",
          },
          shadow: {
            enabled: false,
            blur: 0,
            offsetX: 0,
            offsetY: 0,
            opacity: 100,
            color: "#000000",
          },
        },
        styles: {
          color: "#000000",
          fontSize: "68px",
          fontWeight: "bold",
          maxWidth: "70%",
          width: "max-content",
          height: "auto",
          zIndex: 2,
          position: "absolute",
          backgroundColor: "#FFFFFF",
          borderRadius: "5px",
          opacity: 1,
          textAlign: "left",
          padding: "20px",
        },
        props: {
          text: domain?.clientName || "Your Slogan Here",
        },
        visible: true,
        locked: false,
      },
    ],

    layers: [
      {
        id: `layer-${uuidv4()}`,
        elementId: imageId,
        visible: true,
        locked: false,
      },
      {
        id: `layer-${uuidv4()}`,
        elementId: sloganElementId,
        visible: true,
        locked: false,
      },
    ],
    backgrounds: {
      type: "color",
      color: bgColor,
    },
    version: 1,
  });

  return {
    sloganTemplate,
    brandingTemplate,
  };
};
function camelToKebab(str) {
  return str.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}
function convertStylesToString(styles = {}) {
  return Object.entries(styles)
    .map(([key, value]) => `${camelToKebab(key)}: ${value};`)
    .join(" ");
}

const generateHTMLFromTemplateData = (templateData) => {
  const { canvas, elements } = templateData;

  return `
    <html>
    <body style="margin:0; padding:0; background:${
      canvas.styles.backgroundColor
    }; width:${canvas.width}px; height:${canvas.height}px; position:relative;">
      ${elements
        .map((el) => {
          if (el.type === "text") {
            const styleString = Object.entries(el.styles || {})
              .map(([key, value]) => `${camelToKebab(key)}:${value}`)
              .join(";");

            return `<div style="
              position:absolute;
              top:${el.position.y}px;
              left:${el.position.x}px;
              ${styleString}
            ">${el.props.text}</div>`;
          }

          if (el.type === "image") {
            const styleString = `
              position: absolute;
              top: ${el.position.y}px;
              left: ${el.position.x}px;
              ${convertStylesToString(el.styles)}
            `
              .trim()
              .replace(/\s+/g, " ");

            return `<img src="${el.props?.src}" style="${styleString}" />`;
          }

          return "";
        })
        .join("\n")}
    </body>
    </html>
  `;
};

const renderImageFromHTML = async (canvas, htmlString, outputPath) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlString, { waitUntil: "networkidle0" });
  await page.setViewport({ width: canvas.width, height: canvas.height });
  await page.screenshot({ path: outputPath, type: "png" });
  await browser.close();
  return outputPath;
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

    const { sloganTemplate, brandingTemplate } = await automateCreateTemplates(
      domain.userId,
      jsonData.slogan,
      domain._id,
      savedPost._id
    );
    // === GENERATE HTML FROM TEMPLATE DATA ===
    const sloganHTML = generateHTMLFromTemplateData(sloganTemplate);
    const brandingHTML = generateHTMLFromTemplateData(brandingTemplate);
    // === RENDER TO IMAGE ===
    const sloganImagePath = path.join(
      __dirname,
      `../public/generated/slogan-${uuidv4()}.png`
    );
    const brandingImagePath = path.join(
      __dirname,
      `../public/generated/branding-${uuidv4()}.png`
    );

    await renderImageFromHTML(
      sloganTemplate?.canvas,
      sloganHTML,
      sloganImagePath
    );
    await renderImageFromHTML(
      brandingTemplate?.canvas,
      brandingHTML,
      brandingImagePath
    );
    // Process and upload
    const sloganFile = await prepareFileObject(sloganImagePath);
    const brandingFile = await prepareFileObject(brandingImagePath);

    const sloganImageUrl = await uploadToS3(sloganFile);
    const brandingImageUrl = await uploadToS3(brandingFile);

    // Delete the local files after upload
    await Promise.all([
      fsp.unlink(sloganImagePath),
      fsp.unlink(brandingImagePath),
    ]);
    savedPost.sloganImage = sloganImageUrl;
    savedPost.brandingImage = brandingImageUrl;
    sloganTemplate.templateImage = sloganImageUrl;
    brandingTemplate.templateImage = brandingImageUrl;
    await sloganTemplate.save();
    await brandingTemplate.save();
    await savedPost.save();
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
      savedPost,
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
