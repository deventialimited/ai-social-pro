const express = require("express");
const router = express.Router();
const { getAllPosts, processPubSub } = require("../controllers/Post.js");

router.get("/getAllPosts", getAllPosts);
router.post("/processPubSub", processPubSub);
module.exports = router;
