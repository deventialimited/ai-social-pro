/**
 * Express Application Setup
 */
import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/error.middleware.js"

// Import routes
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.routes.js";

// Initialize app
const app = express();
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});
// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
