const { Server } = require("socket.io");
const { handleConnection } = require("./src/events");

const io = new Server(7000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  handleConnection(io, socket);
});

console.log("Server is running on port 7000");
