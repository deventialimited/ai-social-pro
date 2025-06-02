// src/context/SocketContext.js
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { getSocket } from "./socket";
import { useAuthStore } from "./useAuthStore";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, setUser } = useAuthStore();

  const heartbeatRef = useRef(null);

  useEffect(() => {
    if (!user || !user._id) return;

    const socketInstance = getSocket(user);
    socketInstance.connect();

    const handleConnect = () => {
      console.log("Connected to socket server:", socketInstance.id);
      setSocket(socketInstance);
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error);
    };

    const handleReconnectAttempt = (attempt) => {
      console.log(`Reconnection attempt ${attempt}...`);
    };

    const handleReconnectFailed = () => {
      console.error("All reconnection attempts failed.");
    };

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        socketInstance.connect(); // reconnect only if disconnected by server
      }
    };

    const handleUserUpdated = (updatedUser) => {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser && currentUser._id === updatedUser._id) {
        setUser(updatedUser);
        console.log("User updated in localStorage");
      } else {
        console.log("userUpdated event ignored: ID mismatch");
      }
    };

    const startHeartbeat = () => {
      if (heartbeatRef.current) return;
      heartbeatRef.current = setInterval(() => {
        if (socketInstance.connected) {
          console.log("Sending ping...");
          socketInstance.emit("ping");
        }
      }, 10000);
    };

    const stopHeartbeat = () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
        console.log("Stopping heartbeat...");
      }
    };

    // Attach socket event listeners
    socketInstance.on("connect", handleConnect);
    socketInstance.on("connect_error", handleConnectError);
    socketInstance.on("reconnect_attempt", handleReconnectAttempt);
    socketInstance.on("reconnect_failed", handleReconnectFailed);
    socketInstance.on("disconnect", handleDisconnect);
    socketInstance.on("userUpdated", handleUserUpdated);

    startHeartbeat();

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("connect_error", handleConnectError);
      socketInstance.off("reconnect_attempt", handleReconnectAttempt);
      socketInstance.off("reconnect_failed", handleReconnectFailed);
      socketInstance.off("disconnect", handleDisconnect);
      socketInstance.off("userUpdated", handleUserUpdated);
      stopHeartbeat();
      socketInstance.disconnect();
    };
  }, [user]); // key change: user is in dependency array

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketProvider;
