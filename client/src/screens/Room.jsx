import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useParams, useLocation } from "react-router-dom";

const RoomPage = () => {
  const location = useLocation();
  const { participants } = location.state || {};
  const socket = useSocket();
  const [usersConnected, setUsersConnected] = useState([]);
  const { roomIDNO } = useParams();

  // const handleUserJoined = useCallback(({ id, participants }) => {
  //   console.log(`User ${id} joined room`);
  //   setUsersConnected((prevUsers) => [...participants, ...prevUsers]);
  // }, []);

  useEffect(() => {
    socket.emit("room:getAllUsers", { id: roomIDNO });
    socket.on("room:getAllUsers:response", ({ roomId, participants }) => {
      setUsersConnected(participants);
      console.log("Users in room:", participants);
    });
    console.log("participants from lobby", participants, "roomid", roomIDNO);
    return () => {
      socket.off("room:getAllUsers:response");
    };
  }, [socket, roomIDNO, participants, usersConnected]);

  return (
    <div>
      <h1>Room ID: {roomIDNO}</h1>
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
