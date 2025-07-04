const express = require("express");
const router = express.Router();
const {
  getAllPostsBydomainId,
  processPubSub,
  updatePost,
  getFirstPost,
  updatePostImage,
  updatePostImageFile,
  updatePostTime,
  deletePost,
  updatePostStatusToPublished,
  updatePostTab,
} = require("../controllers/Post.js");
// routes/postRoutes.js or similar
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.patch("/updatePostImage/:id", upload.single("image"), updatePostImage);

router.get("/getAllPostsBydomainId/:domainId", getAllPostsBydomainId);
// Update a post using MongoDB _id
router.put("/updatePost/:id", updatePost);
router.post("/processPubSub", processPubSub);
router.post("/updatePostImage", updatePostImage); // 👈 New route
router.patch(
  "/updatePostImageFile/:id",
  upload.single("image"),
  updatePostImageFile
); // 👈 New route
router.get("/getFirstPost/:id", getFirstPost);
router.post("/updatePostTime", updatePostTime); // 👈 New route
router.delete("/deletePost/:id", deletePost);
router.post("/updatePostStatus", updatePostStatusToPublished);
router.patch("/:postId", updatePostTab);

module.exports = router;
