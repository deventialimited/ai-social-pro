const express = require("express");
const router = express.Router();
const {
  getAllPostsBydomainId,
  processPubSub,
  updatePost,
  getFirstPost,
  updatePostImage,
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
router.get("/getFirstPost/:id", getFirstPost);
module.exports = router;
