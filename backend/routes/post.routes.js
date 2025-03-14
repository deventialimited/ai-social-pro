/**
 * Post Routes
 */
import express from "express";
import {
  getPosts,
  updatePostData,
  createPost,
  processPubSub,
} from "../controllers/post.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Protected routes

router.post("/createpost", protect, createPost);
router.get("/getuserposts", protect, getPosts);
router.post("/update", protect, updatePostData);

// PubSub webhook - not protected
router.post("/pubsub", processPubSub);

export default router;
