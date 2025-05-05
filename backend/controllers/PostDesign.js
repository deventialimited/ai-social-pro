const {
  uploadToS3ForPostDesign,
  deleteFromS3ForPostDesign,
} = require("../libs/s3Controllers");
const Post = require("../models/Post");
const PostDesign = require("../models/PostDesign");
const path = require("path");
exports.getPostDesignById = async (req, res) => {
  try {
    const { id } = req.params;
    const postDesign = await PostDesign.findOne({ postId: id });

    if (!postDesign) {
      return res.status(404).json({ message: "PostDesign not found" });
    }

    return res.status(200).json(postDesign);
  } catch (error) {
    console.error("Error in getPostDesignById:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.saveOrUpdatePostDesign = async (req, res) => {
  try {
    const { postId } = req.params;
    const { canvas, elements, layers, backgrounds } = JSON.parse(req.body.data);
    const files = req.files?.files || [];

    const existingDesign = await PostDesign.findOne({ postId });

    // Upload new files and map URLs back to props and backgrounds
    const newFileUrls = await uploadToS3ForPostDesign({
      postId,
      files,
      elements,
      backgrounds,
    });

    // Merge file URLs into elements and backgrounds
    newFileUrls.forEach(({ type, id, url }) => {
      if (type === "element") {
        const el = elements.find((el) => el.id === id);
        if (el) {
          el.props.src = url;
          el.props.previewUrl = url;
        }
      } else if (type === "background") {
        backgrounds.src = url;
      }
    });

    if (existingDesign) {
      // Determine files to delete
      const filesToDelete = [];

      if (
        JSON.stringify(existingDesign.elements) !== JSON.stringify(elements)
      ) {
        // Find old file URLs not used anymore
        existingDesign.elements.forEach((oldEl) => {
          const match = elements.find((el) => el.id === oldEl.id);
          if (!match && oldEl.props?.src) {
            filesToDelete.push(oldEl.props.src);
          }
        });
      }

      if (
        JSON.stringify(existingDesign.backgrounds) !==
        JSON.stringify(backgrounds)
      ) {
        if (existingDesign.backgrounds?.src) {
          filesToDelete.push(existingDesign.backgrounds?.src);
        }
      }

      await deleteFromS3ForPostDesign(filesToDelete);
      // Step 3: Sync background to canvas.styles
      if (!canvas.styles) canvas.styles = {};

      if (backgrounds?.type === "color") {
        canvas.styles.backgroundColor = backgrounds?.color;
      } else if (backgrounds?.type === "image") {
        canvas.styles.backgroundImage = `url(${backgrounds?.src})`;
      } else if (backgrounds?.type === "video") {
        canvas.styles.backgroundVideo = backgrounds?.src; // if you handle it
      }
      // Update
      existingDesign.canvas = canvas;
      existingDesign.elements = elements;
      existingDesign.layers = layers;
      existingDesign.backgrounds = backgrounds;
      existingDesign.updatedAt = new Date();

      await existingDesign.save();
      const latestPost = await Post.findByIdAndUpdate(postId, {
        editorStatus: "edited",
      });

      return res.status(200).json({
        message: "PostDesign updated successfully",
        postDesign: existingDesign,
        latestPost,
      });
    } else {
      const newPostDesign = new PostDesign({
        postId,
        canvas,
        elements,
        layers,
        backgrounds,
      });

      await newPostDesign.save();

      return res.status(201).json({
        message: "PostDesign created successfully",
        postDesign: newPostDesign,
      });
    }
  } catch (error) {
    console.error("Error in saveOrUpdatePostDesign:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
