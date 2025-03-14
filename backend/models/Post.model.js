import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  content: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Post", PostSchema);
