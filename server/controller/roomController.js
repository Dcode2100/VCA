let rooms = new Map();
let roomCounter = 0;

const createRoom = (socket) => {
    roomCounter++;
    const roomID = roomCounter.toString();
    rooms.set(roomID, { participants: new Set([socket.id]) });
    socket.join(roomID);
    return { roomID, participants: Array.from(rooms.get(roomID).participants) };
};

const joinRoom = (socket, roomID) => {
    if (rooms.has(roomID)) {
        rooms.get(roomID).participants.add(socket.id);
        socket.join(roomID);
        return { exists: true, participants: Array.from(rooms.get(roomID).participants) };
    } else {
        return { exists: false };
    }
};

const getAllUsers = (roomID) => {
    if (rooms.has(roomID)) {
        return { participants: Array.from(rooms.get(roomID).participants) };
    } else {
        return { participants: [] };
    }
};

module.exports = { createRoom, joinRoom, getAllUsers };
