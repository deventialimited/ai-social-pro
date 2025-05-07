const User = require("../models/User");
const Domain = require("../models/Domain");
const mongoose = require("mongoose");
function socketConnection(io) {
  //for connection
  io.on("connection", (socket) => {
    console.log("Connection done: Socket Id", socket.id);

    //for disconnection
    socket.on("disconnect", () => {
      console.log("Disconnected: Socket Id", socket.id);
    });
    socket.on("JoinRoom", async ({ userId, domainId }, callback) => {
      console.log("In the Join Room", userId, domainId);
      const isValid = await verifyUserDomain(userId, domainId);

      if (!isValid) {
        return callback({ success: false, message: "Invalid user or domain" });
      }

      socket.join(`room_${userId}_${domainId}`);
      return callback({ success: true });
    });
  
  });
}

async function verifyUserDomain(userId, domainId) {
  console.log("into the verifyUserDomain function");
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return false;
    }
    const domain = await Domain.findById(domainId).populate("userId");
    if (!domain) {
      console.log("Domain not found");
      return false;
    }
    if (domain.userId._id.toString() !== user._id.toString()) {
      console.log("User and domain do not match");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error verifying user and domain:", error);
    return false;
  }
}
module.exports = { socketConnection };
