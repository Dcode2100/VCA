const { createRoom, joinRoom, getAllUsers } = require("../utils/socketUtils");
const { rooms } = require("../models/room"); // Import rooms from models

function handleRoomEvents(io, socket) {
    socket.on("room:create", () => {
        const roomID = createRoom(socket.id);
        socket.join(roomID);
        socket.emit("room:created", { roomID });
        socket.emit("room:join:response", {
            exists: true,
            roomID,
            participants: Array.from(rooms.get(roomID).participants)
        });

        io.to(roomID).emit("user:joined", { id: socket.id, participants: [socket.id] });
    });

    socket.on("room:join:request", (roomID) => {
        if (rooms.has(roomID)) {
            joinRoom(roomID, socket.id);
            socket.join(roomID);
            socket.emit("room:join:response", {
                exists: true,
                roomID,
                participants: Array.from(rooms.get(roomID).participants)
            });

            io.to(roomID).emit("user:joined", {
                id: socket.id,
                participants: Array.from(rooms.get(roomID).participants)
            });
        } else {
            socket.emit("room:join:response", { exists: false, roomID, participants: [] });

            io.to(roomID).emit("user:joined", {
                id: socket.id,
                participants: Array.from(rooms.get(roomID).participants)
            }); 
        }
    });

    socket.on("room:getAllUsers", ({ id }) => {
        getAllUsers(id, socket);
    });
}

module.exports = { handleRoomEvents };
