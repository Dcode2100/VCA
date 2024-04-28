import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useLocation } from "react-router-dom";

const RoomPage = () => {
  const socket = useSocket();
  const [usersConnected, setUsersConnected] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const location = useLocation();
  
  const { roomID } = location.state;


  const handleUserJoined = useCallback(({ id, participants }) => {
    console.log(`User ${id} joined room`);
    setUsersConnected(participants);
    setAllUsers(participants);
  }, []);

    useEffect(() => {
      // Fetch all users in the room when the component mounts

      socket.emit("room:getAllUsers", { id: roomID });

      // Listen for response containing all users in the room
      socket.on("room:getAllUsers:response", ({ roomId, participants }) => {
        if (roomId === roomID) {
          setUsersConnected(participants);
          console.log("Users in room:", participants);
        }
      });

      // Subscribe to user:joined event
      socket.on("user:joined", handleUserJoined);

      return () => {
        // Unsubscribe from user:joined event
        socket.off("user:joined", handleUserJoined);
      };
    }, [socket, handleUserJoined]);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>People in the room right now:</h4>
      <ul>
        {usersConnected.map((userId) => (
          <li key={userId}>
            User ID: {userId}
            {/* Add any additional user information if needed */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomPage;
