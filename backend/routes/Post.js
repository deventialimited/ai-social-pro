const express = require("express");
const router = express.Router();
const {
  getAllPostsBydomainId,
  processPubSub,
  updatePost,
  getFirstPost,
} = require("../controllers/Post.js");

router.get("/getAllPostsBydomainId/:domainId", getAllPostsBydomainId);
// Update a post using MongoDB _id
router.put("/updatePost/:id", updatePost);
router.post("/processPubSub", processPubSub);
router.get("/getFirstPost/:id", getFirstPost);
module.exports = router;
