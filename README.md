# VCA
A Video confrencing web app


mysql://root:vcspassword@34.82.42.68:3306/vcs


signalling server -> const express = require("express")
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})

const roomUsers = new Map()

io.on('connection', (socket) => {
  console.log(`A new user connected with socket ID: ${socket.id}`)

  socket.on('offer', (offer, targetSocketId) => {
    console.log(
      `Offer received on server from ${socket.id} to be able to send to ${targetSocketId}`,
      offer
    )

    io.to(targetSocketId).emit('offer', offer, socket.id)
  })

  socket.on('answer', (answer, targetSocketId) => {
    console.log(a
      `Answer received on server to be able to send to ${targetSocketId}`,
      answer
    )

    io.to(targetSocketId).emit('answer', answer, socket.id)
  })

  socket.on('ice-candidate', (iceCandidate, targetSocketId) => {
    console.log(`Ice candidate received on server to be able to send to ${targetSocketId} `, iceCandidate)

    io.to(targetSocketId).emit('ice-candidate', iceCandidate, socket.id)
  })

  socket.on('create-meet-link', () => {
    console.log('Create meet link received on server')

    // TODO: replace this with uuid library to get a unique meet link.
    const meetLink = `${socket.id}-${new Date().getTime()}`

    io.to(socket.id).emit('meet-link-created', meetLink)
  })

  socket.on('join-meet-link', (meetLink) => {
    console.log('Join meet link received on server: ', meetLink)

    const maxUsersPerRoom = process.env.MAX_USERS_PER_ROOM || 3

    const users = roomUsers.get(meetLink) || []

    if (users.length >= maxUsersPerRoom) {
      io.to(socket.id).emit('room-full', meetLink)
      return
    }

    socket.join(meetLink)

    users.push(socket.id)
    roomUsers.set(meetLink, [...new Set(users)])

    socket.to(meetLink).emit('user-joined', socket.id)
  })

  socket.on('disconnect', () => {
    roomUsers.forEach((users, meetLink) => {
      const index = users.indexOf(socket.id)

      if (index > -1) {
        users.splice(index, 1)
        roomUsers.set(meetLink, users)
        socket.to(meetLink).emit('user-left', socket.id)
      }
    })

    console.log('After leave', roomUsers)
  })
})

const port = process.env.PORT || 8000

server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});






second suggestion -> 

// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log(`User connected with socket ID: ${socket.id}`);

  socket.on('offer', (offer, targetSocketId) => {
    console.log(`Offer received from ${socket.id} for ${targetSocketId}`);
    io.to(targetSocketId).emit('offer', offer, socket.id);
  });

  socket.on('answer', (answer, targetSocketId) => {
    console.log(`Answer received from ${socket.id} for ${targetSocketId}`);
    io.to(targetSocketId).emit('answer', answer, socket.id);
  });

  socket.on('ice-candidate', (iceCandidate, targetSocketId) => {
    console.log(`ICE candidate received from ${socket.id} for ${targetSocketId}`);
    io.to(targetSocketId).emit('ice-candidate', iceCandidate, socket.id);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected with socket ID: ${socket.id}`);
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
