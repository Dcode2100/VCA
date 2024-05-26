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

  const handleRoomCreated = useCallback(
    ({ roomID }) => {
      setIsCreatingRoom(false); // Reset room creation flag
      // Redirect to the newly created room page
      navigate(`/room/${roomID}`);
    },
    [navigate]
  );

  const handleJoinRoom = useCallback(
    ({ roomID }) => {
      // Redirect to the room page upon successful room joining
      navigate(`/room/${roomID}`);
    },
    [navigate]
  );

  const handleCreateNewRoom = useCallback(() => {
    if (!isCreatingRoom) {
      setIsCreatingRoom(true); // Set room creation flag
      socket.emit("room:create");
    }
  }, [isCreatingRoom, socket]);

  useEffect(() => {
    // Listen for room:created event after room creation
    socket.on("room:created", handleRoomCreated);
    // Listen for room:join:response event after joining a room
    socket.on("room:join:response", ({ exists, roomID, participants }) => {
      if (exists) {
        // Room exists, navigate to the room
        // navigate(`/room/${roomID}`);
        console.log("Room exists", exists, roomID, participants);
        navigate(`/room/${roomID}`, { state: { roomID, participants } });
        
      } else {
        // Room does not exist, display an error message or handle it as needed
        console.log("Room does not exist");
      }
    });

    return () => {
      socket.off("room:created", handleRoomCreated);
      socket.off("room:join:response");
    };
  }, [socket, handleRoomCreated, navigate]);

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
