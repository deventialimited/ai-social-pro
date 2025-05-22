// src/context/SocketContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { getSocket } from "./socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user?._id) return;

    const socket = getSocket(user); // Retrieve the singleton instance
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
      setSocket(socket);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log(`Reconnection attempt ${attempt}...`);
    });

    socket.on("reconnect_failed", () => {
      console.error(
        "All reconnection attempts failed. Please check your network."
      );
      // Optionally, show a user-facing error message
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      socket.connect(); // Reconnect if server disconnected the client
    });

    // Listen for the userUpdated event
    socket.on("userUpdated", (updatedUser) => {
      console.log("Received userUpdated event:", updatedUser);

      const currentUser = JSON.parse(localStorage.getItem("user"));
      console.log(updatedUser, "this is updated user");
      // Check if the current user exists and has the same _id
      if (currentUser && currentUser?._id === updatedUser?._id) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("User updated in localStorage");
      } else {
        console.log("userUpdated event ignored: ID mismatch");
      }
    });

    // Start heartbeat
    let heartbeatInterval = null;
    const HEARTBEAT_INTERVAL = 10000; // 10 seconds
    const startHeartbeat = () => {
      console.log("Starting heartbeat...");
      heartbeatInterval = setInterval(() => {
        if (socket.connected) {
          console.log("Sending ping...");
          socket.emit("ping");
        } else {
          console.warn("Socket not connected, skipping ping.");
        }
      }, HEARTBEAT_INTERVAL);
    };

    const stopHeartbeat = () => {
      console.log("Stopping heartbeat...");
      clearInterval(heartbeatInterval);
    };

    startHeartbeat();
    return () => {
      console.log("Disconnecting socket...");
      socket.off("connect_error");
      socket.off("userUpdated");
      socket.off("disconnect");
      stopHeartbeat();
      socket.off("pong");
      socket.disconnect(); // Proper cleanup
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketProvider;
