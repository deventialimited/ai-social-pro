const mongoose = require("mongoose");

// const databaseUrl = `mongodb://127.0.0.1:27017/${databaseName}`;
module.exports = async () => {
  try {
    const connectionParams = {
      useNewUrlParser: true, // Use the new MongoDB connection string parser
      useUnifiedTopology: true, // Opt-in to the MongoDB driver's new connection management engine
      socketTimeoutMS: 45000, // Socket timeout increased to 45 seconds
      connectTimeoutMS: 10000, // Connection timeout increased to 10 seconds
      serverSelectionTimeoutMS: 5000, // Timeout for selecting the MongoDB server
      retryWrites: true, // Enable retryable writes
    };

    // Suppress strictQuery warning
    mongoose.set("strictQuery", false);

    // Connect to MongoDB
    await mongoose.connect(process.env.Database_URL, connectionParams);

    console.log(`Database SocailPro is successfully connected`);
  } catch (error) {
    // Log the error and provide actionable information
    console.error("There are errors in MongoDB connection", error.message);

    // Check for specific timeout errors
    if (
      error.name === "MongoNetworkError" &&
      error.message.includes("ETIMEDOUT")
    ) {
      console.error(
        "It seems there is a network issue. Please check your internet connection or MongoDB Atlas settings."
      );
    } else {
      console.error("Unexpected error during MongoDB connection:", error);
    }
  }
};
