  const { Server } = require("socket.io");

  const io = new Server(7000, {
    cors: true,
  });

  let roomCounter = 0; // Counter for generating room IDs
  const rooms = new Map(); // Map to store room information

  io.on("connection", (socket) => {
    console.log(`Socket Connected`, socket.id);

    socket.on("room:create", () => {
      // Increment the room counter to generate the next room ID
      roomCounter++;

      const roomID = roomCounter.toString(); // Convert room counter to string

      // Create a new room entry
      rooms.set(roomID, { participants: new Set([socket.id]) });
      console.log(rooms)
      // Emit room created event to the creator
      socket.emit("room:created", { roomID });

      console.log(`Room Created: ${roomID}`);
    });

    socket.on("room:join:request", (roomID) => {
      // Check if the room exists
      if (rooms.has(roomID)) {
        // Room exists, send a response indicating success
        socket.emit("room:join:response", { exists: true, roomID });
        // Add the participant to the room
        rooms.get(roomID).participants.add(socket.id);
        // Emit user joined event to all participants in the room
        io.to(roomID).emit("user:joined", { id: socket.id });
        // Join the room
        socket.join(roomID);
        console.log(`User ${socket.id} joined Room ${roomID}`);
      } else {
        // Room does not exist, send a response indicating failure
        socket.emit("room:join:response", { exists: false });
      }
    });


    socket.on("user:call", ({ to, offer }) => {
      // Simulate receiving the offer
      setTimeout(() => {
        io.to(to).emit("incomming:call", { from: socket.id, offer });
      }, 1000); // Delay of 1 second
    });

    socket.on("call:accepted", ({ to, ans }) => {
      // Simulate receiving the answer
      setTimeout(() => {
        io.to(to).emit("call:accepted", { from: socket.id, ans });
      }, 1000); // Delay of 1 second
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
      console.log("peer:nego:needed", offer);
      // Simulate receiving the offer for renegotiation
      setTimeout(() => {
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
      }, 1000); // Delay of 1 second
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
      console.log("peer:nego:done", ans);
      // Simulate receiving the answer for renegotiation
      setTimeout(() => {
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
      }, 1000); // Delay of 1 second
    });
  });


