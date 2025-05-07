const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 4000;
const UserRoutes = require("./routes/User");
const UploadedImageRoutes = require("./routes/UploadedImage");
const DomainRoutes = require("./routes/Domain");
const PostRoutes = require("./routes/Post");
const PostDesignRoutes = require("./routes/PostDesign");
const { createServer } = require("http");
const { Server } = require("socket.io");
const {socketConnection} = require("./utils/SocketConnection");
require("dotenv").config();

// ch
const app = express();
const corsOptions = {
  origin: [
    "https://dev.oneyearsocial.com",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5176/",
    "*",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

app.use(cors(corsOptions));
app.set("trust proxy", true);

// Increase the body size limit to 50MB (adjust as needed)
app.use(express.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));
app.use(bodyParser.json({ limit: "500mb" }));
app.use("/uploads", express.static("uploads"));

app.use("/api/v1/users", UserRoutes);
app.use("/api/v1/domains", DomainRoutes);
app.use("/api/v1/posts", PostRoutes);
app.use("/api/v1/postsDesign", PostDesignRoutes);
app.use("/api/v1/uploadedImage", UploadedImageRoutes);
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running!" });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://dev.oneyearsocial.com",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5176/",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});
socketConnection(io);
app.set("io", io); // now you can access `io` from req.app.get("io")

// Start the server
httpServer.listen(PORT, async () => {
  await require("./libs/db")();
  console.log(`Server is running on port ${PORT}`);
});
