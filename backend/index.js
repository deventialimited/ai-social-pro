const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 4000;
const UserRoutes = require("./routes/User");
const { createServer } = require("http");

require("dotenv").config();

// ch
const app = express();
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5176/",
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
const httpServer = createServer(app);

// Start the server
httpServer.listen(PORT, async () => {
  await require("./libs/db")();
  console.log(`Server is running on port ${PORT}`);
});
