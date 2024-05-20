const { createRoom, joinRoom, getAllUsers } = require('../controller/roomController');

const registerSocketEvents = (io) => {
    io.on('connection', (socket) => {
        console.log('Socket Connected', socket.id);

        socket.on('room:create', () => {
            const { roomID, participants } = createRoom(socket);
            socket.emit('room:created', { roomID });
            socket.emit('room:join:response', { exists: true, roomID, participants });

            io.to(roomID).emit('user:joined', { id: socket.id, participants });
        });

        socket.on('room:join:request', (roomID) => {
            const { exists, participants } = joinRoom(socket, roomID);
            socket.emit('room:join:response', { exists, roomID, participants });

            if (exists) {
                io.to(roomID).emit('user:joined', { id: socket.id, participants });
            }
        });

        socket.on('room:getAllUsers', ({ id }) => {
            const { participants } = getAllUsers(id);
            socket.emit('room:getAllUsers:response', { roomId: id, participants });
        });

        socket.on('disconnect', () => {
            // Handle user disconnection, remove user from all rooms
            rooms.forEach((room, roomID) => {
                if (room.participants.has(socket.id)) {
                    room.participants.delete(socket.id);
                    const participants = Array.from(room.participants);
                    io.to(roomID).emit('user:left', { id: socket.id, participants });
                    console.log(`User ${socket.id} left Room ${roomID}`);
                }
            });
        });
    });
};

module.exports = registerSocketEvents;
