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
            offer
        });

        io.to(roomID).emit("user:joined", { id: socket.id, participants: [socket.id] });
    });

    socket.on("room:getAllUsers", ({ clientRoomId }) => {
        console.log("getAllUsers activated", clientRoomId, "socketId", socket.id);
        getAllUsers(clientRoomId, socket);
    });

    socket.on("room:join:request", (roomID) => {        
        if (rooms.has(roomID)) {
            joinRoom(roomID, socket.id);
            socket.join(roomID);
            const offer = rooms.get(roomID).offer;
            const participants = Array.from(rooms.get(roomID).participants);
            socket.emit("room:join:response", {
                RoomExists: true,
                roomID,
                offer,
            });
            socket.emit("room:participants", { roomId: roomID, participants });
            io.to(roomID).emit("user:joined", { userId: socket.id }); 
            io.to(socket.id).emit('room:join:offer', { offer });
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

    socket.on("participant:sendAnswer", ({ roomID, answer }) => {
        if (rooms.has(roomID)) {
            const room = rooms.get(roomID);
            const roomCreatorId = Array.from(room.participants)[0];
            io.to(roomCreatorId).emit("participant:answer", { participantId: socket.id, answer });
        }
    });

    // Handle setting the remote description on the room creator side
    socket.on("participant:answer", async ({ participantId, answer }) => {
        try {
            const peer = createPeerConnection(participantId); // Ensure you have a peer connection for the participant
            await peer.setRemoteDescription(new RTCSessionDescription(answer));
            console.log(`Set remote description for participant ${participantId}`);
        } catch (error) {
            console.error("Error setting remote description", error);
        }
    });

    socket.on("webrtc:offer", ({ to, offer }) => {
        io.to(to).emit("webrtc:offer", { from: socket.id, offer });
    });

    socket.on("webrtc:answer", ({ to, answer }) => {
        io.to(to).emit("webrtc:answer", { from: socket.id, answer });
    });

    socket.on("webrtc:ice-candidate", ({ to, candidate }) => {
        io.to(to).emit("webrtc:ice-candidate", { from: socket.id, candidate });
    });

}

module.exports = { handleRoomEvents };