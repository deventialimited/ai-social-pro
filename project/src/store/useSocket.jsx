// src/context/SocketContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  // useEffect(() => {
  //   const newSocket = io("http://localhost:4000");
  //   setSocket(newSocket);

  //   return () => newSocket.disconnect();
  // }, []);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const socket = io("https://api.oneyearsocial.com");

    socket.on("connect", () => {
      console.log("Connected to socket server:", socket.id);
      setSocket(socket);
    });

    return () => {
      socket.disconnect(); // Proper cleanup
    };
  }, []);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketProvider;
