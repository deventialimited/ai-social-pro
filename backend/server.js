import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";

// Connect to MongoDB
connectDB();

// Set port

const PORT = process.env.PORT || 4000;


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
