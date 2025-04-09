const express = require('express');
const router = express.Router();
const {getAllPosts} = require('../controllers/Post.js');

router.get('/getAllPosts', getAllPosts);
module.exports = router;