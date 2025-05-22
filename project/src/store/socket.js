// socket.js
import { io } from "socket.io-client";

let socket;
// const baseURL = "https://api.oneyearsocial.com";
const baseURL = "http://localhost:4000";
export const getSocket = (user) => {
  if (!socket?.connected) {
    socket = io(baseURL, {
      reconnection: true, // Automatically try to reconnect
      // reconnectionAttempts: 10, // Number of attempts before giving up
      reconnectionDelay: 100, // Initial delay between attempts (1 second)
      reconnectionDelayMax: 2000, // Maximum delay between attempts (5 seconds)
      timeout: 20000, // Timeout for initial connection (20 seconds)
      transports: ["websocket"], // Use WebSocket transport only
      query: { userId: user?._id },
    });
  }
  return socket;
};
