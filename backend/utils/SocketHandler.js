const User = require("../models/User");
const Domain = require("../models/Domain");
const mongoose = require("mongoose");

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
const SocketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    // Notify admin of a new tax return creation
const userId = socket.handshake.query.userId;
    if(userId){
      console.log(userId)
      const room=`room_${userId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    }
    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("Connection error:", error.message);
      // Optional: Notify client or admin about connection issues
    });

    // Handle reconnection attempts
    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(
        `Reconnection attempt #${attemptNumber} by socket: ${socket.id}`
      );
    });

    // Handle successful reconnection
    socket.on("reconnect", (attemptNumber) => {
      console.log(
        `Socket ${socket.id} successfully reconnected after ${attemptNumber} attempt(s).`
      );
    });

    // Handle reconnection failure
    socket.on("reconnect_failed", () => {
      console.error(`Socket ${socket.id} failed to reconnect.`);
      // Optional: Trigger fallback logic, such as notifying the user
    });
    socket.on("ping", () => {
      socket.emit("pong");
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
    // Handle disconnections
    socket.on("disconnect", (reason) => {
      console.log(`A user disconnected: ${socket.id}, Reason: ${reason}`);

      switch (reason) {
        case "io server disconnect":
          console.warn(
            "Server forcefully disconnected the socket. Attempting to reconnect..."
          );
          socket.connect();
          break;
        case "io client disconnect":
          console.info("Client manually disconnected the socket.");
          break;
        case "ping timeout":
          console.error("Connection lost due to ping timeout.");
          break;
        case "transport close":
          console.warn(
            "Connection closed (e.g., network issue or browser tab closed)."
          );
          break;
        case "transport error":
          console.error("Transport error occurred.");
          break;
        default:
          console.warn("Unknown disconnection reason.");
      }
    });
  });
};

module.exports = { SocketHandler };
