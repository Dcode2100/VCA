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

function getAllUsers(roomID, socket) {
    if (rooms.has(roomID)) {
        const participants = Array.from(rooms.get(roomID).participants);
        socket.emit("room:getAllUsers:response", { roomId: roomID, participants });
    } else {
        console.log(`Room ${roomID} does not exist.`);
    }
}

module.exports = { createRoom, joinRoom, getAllUsers };
