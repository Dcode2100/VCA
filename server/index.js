const { Server } = require("socket.io");

const io = new Server(7000, {
  cors: true,
});

let roomCounter = 0; // Counter for generating room IDs
const rooms = new Map(); // Map to store room information

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  if(rooms.has(1)) {
    console.log(Array.from(rooms.get(1).participants));
  }
  socket.on("room:create", () => {
    roomCounter++;
    const roomID = roomCounter.toString();
    rooms.set(roomID, { participants: new Set([socket.id]) });
    socket.join(roomID);
    socket.emit("room:created", { roomID });
    socket.emit("room:join:response", { exists: true, roomID, participants: Array.from(rooms.get(roomID).participants) });

    console.log(Array.from(rooms.get(roomID).participants))
    console.log(`room Created: ${roomID} , User: ${rooms}`);

    io.to(roomID).emit("user:joined", { id: socket.id, participants: [socket.id] });


    console.log(`users in room ${roomID}`, Array.from(rooms.get(roomID).participants));
  });

  socket.on("room:join:request", (roomID) => {
    if (rooms.has(roomID)) {  
      rooms.get(roomID).participants.add(socket.id);
      socket.join(roomID);
      socket.emit("room:join:response", { exists: true, roomID, participants: Array.from(rooms.get(roomID).participants) });

      io.to(roomID).emit("user:joined", { id: socket.id , participants: Array.from(rooms.get(roomID).participants) });

      console.log(`users in room ${roomID}`,Array.from(rooms.get(roomID).participants));
      
      console.log(`User ${socket.id} joined Room ${roomID}`);
    } else {
      socket.emit("room:join:response", { exists: true, roomID, participants: Array.from(rooms.get(roomID).participants) });

   
    }
  });

  // handle get all users in the room
  socket.on("room:getAllUsers", ({ id }) => {
    if (rooms.has(id)) {
      const participants = Array.from(rooms.get(id).participants);
      socket.emit("room:getAllUsers:response", { roomId: id, participants });
    } else {
      console.log(`Room ${id} does not exist.`);
    }
  });
});
