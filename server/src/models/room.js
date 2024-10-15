let roomCounter = 0;
const rooms = new Map();

function generateRoomID() {
    roomCounter++;
    return roomCounter.toString();
}

module.exports = { rooms, generateRoomID };