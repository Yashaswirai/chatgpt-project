const { Server } = require("socket.io");
const { generateAIContent } = require("../services/Ai.service");
const connectSocket = (httpServer) => {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("Ai-message", async (message) => {
      const response = await generateAIContent(message);
      socket.emit("Ai-response", response);
    });
  });

  return io;
};

module.exports = connectSocket;
