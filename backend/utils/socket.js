const { Server } = require("socket.io");

class Socket {
  constructor() {
    this.io = null;
  }

  initialize(httpServer) {
    if (this.io) {
      throw new Error("Socket.io already initialized!");
    }
    this.io = new Server(httpServer, {
      cors: {
        origin: [
            "https://dev.oneyearsocial.com",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5176/",
            "*",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 75000, // Set pingTimeout to 75 seconds (default is 60 seconds)
      pingInterval: 25000, // Set pingInterval to 25 seconds (default is 25 seconds)
    });
  }

  getIO() {
    if (!this.io) {
      throw new Error("Socket.io not initialized!");
    }
    return this.io;
  }
}

module.exports = new Socket();
