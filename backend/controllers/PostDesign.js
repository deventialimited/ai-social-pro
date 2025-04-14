const {
  uploadToS3ForPostDesign,
  deleteFromS3ForPostDesign,
} = require("../libs/s3Controllers");
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

// exports.saveOrUpdatePostDesign = async (req, res) => {
//   try {
//     const { postId, canvas, elements, layers, backgrounds } = req.body;

//     if (!postId) {
//       return res.status(400).json({ message: "postId is required" });
//     }

//     // Ensure postId is a string
//     const stringPostId = String(postId);

//     let existingDesign = await PostDesign.findOne({ postId: stringPostId });

//     if (existingDesign) {
//       let updated = false;

//       // Compare and update canvas
//       if (JSON.stringify(existingDesign.canvas) !== JSON.stringify(canvas)) {
//         existingDesign.canvas = canvas;
//         updated = true;
//       }

//       // Compare and update elements
//       if (JSON.stringify(existingDesign.elements) !== JSON.stringify(elements)) {
//         existingDesign.elements = elements;
//         updated = true;
//       }

//       // Compare and update layers
//       if (JSON.stringify(existingDesign.layers) !== JSON.stringify(layers)) {
//         existingDesign.layers = layers;
//         updated = true;
//       }

//       // Compare and update backgrounds
//       if (JSON.stringify(existingDesign.backgrounds) !== JSON.stringify(backgrounds)) {
//         existingDesign.backgrounds = backgrounds;
//         updated = true;
//       }

//       if (updated) {
//         existingDesign.updatedAt = new Date();
//         await existingDesign.save();
//         return res.status(200).json({
//           message: "PostDesign updated successfully",
//           postDesign: existingDesign,
//         });
//       } else {
//         return res.status(200).json({
//           message: "No changes detected, PostDesign remains the same",
//           postDesign: existingDesign,
//         });
//       }
//     } else {
//       // Create new
//       const newPostDesign = new PostDesign({
//         postId: stringPostId,
//         canvas,
//         elements,
//         layers,
//         backgrounds,
//       });

//       await newPostDesign.save();
//       return res.status(201).json({
//         message: "PostDesign created successfully",
//         postDesign: newPostDesign,
//       });
//     }
//   } catch (error) {
//     console.error("Error in saveOrUpdatePostDesign:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

exports.saveOrUpdatePostDesign = async (req, res) => {
  try {
    const { postId, canvas, elements, layers, backgrounds } = JSON.parse(
      req.body.data
    );
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
        if (el) el.props.url = url;
      } else if (type === "background") {
        if (!backgrounds.urls) backgrounds.urls = [];
        backgrounds.urls.push(url);
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
          if (!match && oldEl.props?.url) {
            filesToDelete.push(oldEl.props.url);
          }
        });
      }

      if (
        JSON.stringify(existingDesign.backgrounds) !==
        JSON.stringify(backgrounds)
      ) {
        if (existingDesign.backgrounds?.urls) {
          existingDesign.backgrounds.urls.forEach((oldBgUrl) => {
            if (!backgrounds.urls.includes(oldBgUrl)) {
              filesToDelete.push(oldBgUrl);
            }
          });
        }
      }

      await deleteFromS3ForPostDesign(filesToDelete);
      // Step 3: Sync background to canvas.styles
      if (!canvas.styles) canvas.styles = {};

      if (backgrounds.type === "color") {
        canvas.styles.backgroundColor = backgrounds.value;
      } else if (backgrounds.type === "image") {
        canvas.styles.backgroundImage = `url(${backgrounds.value})`;
      } else if (backgrounds.type === "video") {
        canvas.styles.backgroundVideo = backgrounds.value; // if you handle it
      }
      // Update
      existingDesign.canvas = canvas;
      existingDesign.elements = elements;
      existingDesign.layers = layers;
      existingDesign.backgrounds = backgrounds;
      existingDesign.updatedAt = new Date();

      await existingDesign.save();

      return res.status(200).json({
        message: "PostDesign updated successfully",
        postDesign: existingDesign,
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
