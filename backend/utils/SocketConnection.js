function socketConnection(io) {
  //for connection
  io.on("connection", (socket) => {
    console.log("Connection done: Socket Id", socket.id);

    //for disconnection
    socket.on("disconnect", () => {
      console.log("Disconnected: Socket Id", socket.id);
    });
  });
}
module.exports = socketConnection;
