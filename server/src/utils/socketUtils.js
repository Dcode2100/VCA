const { rooms, generateRoomID } = require("../models/room");

function createRoom(socketID) {
    const roomID = generateRoomID();
    rooms.set(roomID, { participants: new Set([socketID]) });
    return roomID;
}

function joinRoom(roomID, socketID) {
    if (rooms.has(roomID)) {
        rooms.get(roomID).participants.add(socketID);
    }
}

function getAllUsers(clientRoomId, socket) {
    if (rooms.has(clientRoomId)) {
        const participants = Array.from(rooms.get(clientRoomId).participants);
        socket.emit("room:getAllUsers:response", { roomId: clientRoomId, participants });
    } else {
        console.log(`Room ${clientRoomId} does not exist.`);
    }
}
function exitRoom(roomID, socketId) {
    const room = rooms.get(roomID);

    if (room && room.participants instanceof Set) {
        room.participants.delete(socketId);

        if (room.participants.size === 0) {
            rooms.delete(roomID); // Remove room if empty
            console.log(`Room ${roomID} deleted as it is empty.`);
        } else {
            rooms.set(roomID, room); // Update room with remaining participants
            // console.log(`Room ${roomID} updated with remaining participants:`, room.participants);
        }

    } else {
        console.error(`Room not found or participants is not a Set for room ID: ${roomID}`);
    }
}


module.exports = { createRoom, joinRoom, getAllUsers, exitRoom };
