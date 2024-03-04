const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});
const cors = require('cors');

app.use(cors({
  origin: '*', // Replace with your React app's domain
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies to be sent with the request if needed
}));

io.on("connection", function (socket) {
  console.log("connected");

  // Handle room joining
  socket.on("join", function (data) {
    socket.join(data.roomId);
    socket.room = data.roomId;
    const sockets = io.sockets.adapter.rooms.get(data.roomId);
    if (sockets.size === 1) {
      // If the first user in the room, emit 'init'
      return socket.emit("init");
    } else {
      if (sockets.size === 2) {
        // If the second user joined, emit 'ready' to start WebRTC connection
        io.to(data.roomId).emit("ready");
      } else {
        // If more than two users, emit 'full'
        socket.room = null;
        socket.leave(data.roomId);
        socket.emit("full");
      }
    }
  });

  // Handle WebRTC signaling events
  socket.on("offer", (data) => {
    const { offer, targetUserId } = data;
    // Send the offer to the target user
    io.to(targetUserId).emit("offer", { offer, senderUserId: socket.id });
  });

  socket.on("answer", (data) => {
    const { answer, targetUserId } = data;
    // Send the answer to the target user
    io.to(targetUserId).emit("answer", { answer });
  });

  socket.on("ice-candidate", (data) => {
    const { candidate, targetUserId } = data;
    // Send the ICE candidate to the target user
    io.to(targetUserId).emit("ice-candidate", { candidate });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    const roomId = Object.keys(socket.adapter.rooms)[0];
    if (socket.room) {
      // Notify the remaining user that someone disconnected
      io.to(socket.room).emit("disconnected");
    }
  });
});

server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
