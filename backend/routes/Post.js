const express = require("express");
const router = express.Router();
const {
  getAllPostsBydomainId,
  processPubSub,
  updatePost,
} = require("../controllers/Post.js");

router.get("/getAllPostsBydomainId/:domainId", getAllPostsBydomainId);
// Update a post using MongoDB _id
router.put("/updatePost/:id", updatePost);
router.post("/processPubSub", processPubSub);
module.exports = router;
