import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const LobbyScreen = () => {
  const [room, setRoom] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false); // Track if room creation is in progress

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (!isCreatingRoom && room.trim() !== "") {
        // Emit a request to join the room
        socket.emit("room:join:request", room.trim());
      }
    },
    [isCreatingRoom, room, socket]
  );

  const handleCreateNewRoom = useCallback(() => {
    if (!isCreatingRoom) {
      setIsCreatingRoom(true); // Set room creation flag
      socket.emit("room:create");
    }
  }, [isCreatingRoom, socket]);

  useEffect(() => {
    socket.on("room:join:response", ({ RoomExists, roomID, participants }) => {
      if (RoomExists) {
        // console.log("Room exists", RoomExists, roomID, participants);
        navigate(`/room/${roomID}`, { state: { participants } });
      } else {
        alert("Room does not exist");
        console.log("Room does not exist");
      }
    });

    return () => {
      socket.off("room:created");
      socket.off("room:join:response");
    };
  }, [socket, navigate]);

  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <label htmlFor="room">Enter Room Number:</label>
        <input
          type="text"
          id="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button type="submit" disabled={isCreatingRoom}>
          {isCreatingRoom ? "Joining Room..." : "Join Room"}
        </button>
      </form>
      <p>Or</p>
      <button onClick={handleCreateNewRoom} disabled={isCreatingRoom}>
        {isCreatingRoom ? "Creating Room..." : "Create New Room"}
      </button>
    </div>
  );
};

export default LobbyScreen;
