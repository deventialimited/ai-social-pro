const PostDesign = require("../models/PostDesign");

exports.saveOrUpdatePostDesign = async (req, res) => {
  try {
    const { postId, canvas, elements, layers, backgrounds } = req.body;

    if (!postId) {
      return res.status(400).json({ message: "postId is required" });
    }

    let existingDesign = await PostDesign.findOne({ postId });

    if (existingDesign) {
      let updated = false;

      // Compare and update canvas
      if (JSON.stringify(existingDesign.canvas) !== JSON.stringify(canvas)) {
        existingDesign.canvas = canvas;
        updated = true;
      }

      // Compare and update elements
      if (
        JSON.stringify(existingDesign.elements) !== JSON.stringify(elements)
      ) {
        existingDesign.elements = elements;
        updated = true;
      }

      // Compare and update layers
      if (JSON.stringify(existingDesign.layers) !== JSON.stringify(layers)) {
        existingDesign.layers = layers;
        updated = true;
      }

      // Compare and update backgrounds
      if (
        JSON.stringify(existingDesign.backgrounds) !==
        JSON.stringify(backgrounds)
      ) {
        existingDesign.backgrounds = backgrounds;
        updated = true;
      }

      if (updated) {
        existingDesign.updatedAt = new Date();
        await existingDesign.save();
        return res.status(200).json({
          message: "PostDesign updated successfully",
          postDesign: existingDesign,
        });
      } else {
        return res.status(200).json({
          message: "No changes detected, PostDesign remains the same",
          postDesign: existingDesign,
        });
      }
    } else {
      // Create new
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
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
