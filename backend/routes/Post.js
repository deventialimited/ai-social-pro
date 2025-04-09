const express = require("express");
const router = express.Router();
const {
  getAllPostsBydomainId,
  processPubSub,
} = require("../controllers/Post.js");

router.get("/getAllPostsBydomainId/:domainId", getAllPostsBydomainId);
router.post("/processPubSub", processPubSub);
module.exports = router;
