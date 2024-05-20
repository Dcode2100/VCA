const { handleRoomEvents } = require("./roomEvents");

function handleConnection(io, socket) {
    console.log(`Socket Connected: ${socket.id}`);

    handleRoomEvents(io, socket);
}

module.exports = { handleConnection };
