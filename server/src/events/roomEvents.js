const { createRoom, joinRoom, getAllUsers, exitRoom } = require("../utils/socketUtils");
const { rooms } = require("../models/room"); // Import rooms from models

function handleRoomEvents(io, socket) {
    socket.on("room:create", async ({ offer }) => {
        const roomID = await createRoom(socket.id, offer);
        socket.join(roomID);
        console.log(roomID);
        console.log("rooms", rooms);
        console.log("offer", offer);
        socket.emit("room:created:response", {
            RoomExists: true,
            roomID,
            participants: Array.from(rooms.get(roomID).participants),
            offer
        });

        io.to(roomID).emit("user:joined", { id: socket.id, participants: [socket.id] });
    });

    socket.on("room:getAllUsers", ({ clientRoomId }) => {
        console.log("getAllUsers activated", clientRoomId, "socketId", socket.id);
        getAllUsers(clientRoomId, socket);
    });

    socket.on("room:join:request", (roomID) => {
        console.log(roomID)
        if (rooms.has(roomID)) {
            joinRoom(roomID, socket.id);
            socket.join(roomID);
            socket.emit("room:join:response", {
                RoomExists: true,
                roomID,
                participants: Array.from(rooms.get(roomID).participants)
            });

            io.to(roomID).emit("user:joined"); 
        } else {
            socket.emit("room:join:response", { exists: false, roomID, participants: [] });
        }
    });

    socket.on("room:exit:request", ({ roomId: roomId, socketId: socketId }) => {

        if (rooms.has(roomId)) {

            exitRoom(roomId, socketId); // This will remove the user from the room 

            io.emit("user:left",() => {});

            socket.emit("room:exit:response", { success: true });

        } else {
            socket.emit("room:exit:response", { success: false, message: "Room does not exist" });
        }
    })




}

module.exports = { handleRoomEvents };
