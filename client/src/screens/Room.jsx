import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useParams } from "react-router-dom";

const RoomPage = () => {
  const socket = useSocket();
  const [usersConnected, setUsersConnected] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const { roomID, participants } = useParams();
  const participantsFromLobby = participants ? participants.split(",") : [];

  const handleUserJoined = useCallback(({ id, participants }) => {
    console.log(`User ${id} joined room`);
    setUsersConnected(participants);
    setAllUsers(participants);
  }, []);

  useEffect(() => {
    console.log("participants from lobby", participantsFromLobby);
    // Fetch all users in the room when the component mounts

     socket.on("user:joined", handleUserJoined);

    if (participantsFromLobby) {
      setUsersConnected(participantsFromLobby);
    }
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("room:getAllUsers:response");
    };
  }, [socket, roomID, handleUserJoined]);

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
