import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SocketProvider, useSocket } from "../context/SocketProvider";
import { createOffer } from "../service/peer";

const LobbyScreen = () => {
  const [room, setRoom] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false); // Track if room creation is in progress

  const socket = useSocket();
  const navigate = useNavigate();

  const handleJoinRoom = useCallback(
    (e) => {
      e.preventDefault();
      if (!isCreatingRoom && room.trim() !== "") {
        socket.emit("room:join:request", room.trim());
      }
    },
    [isCreatingRoom, room, socket]
  );

  const handleCreateNewRoom = useCallback(() => {
    if (!isCreatingRoom) {
      setIsCreatingRoom(true);
      const offer = createOffer();
      offer.then((offer) => {
        console.log("offer", offer);
        socket.emit("room:create", { offer });
      });
    }
  }, [isCreatingRoom, socket]);

  useEffect(() => {
    console.log(isCreatingRoom);
    socket.on(
      "room:created:response",
      ({ RoomExists, roomID, participants, offer }) => {
        if (RoomExists) {
          setIsCreatingRoom(false);
          // console.log("lobbyConsole", RoomExists, roomID, participants);
          navigate(`/room/${roomID}`, {
            state: { roomIdLobby: roomID, OwnerOffer: offer },
          });
        } else {
          alert("Room does not exist");
        }
      }
    );

    socket.on("room:join:response", ({ RoomExists, roomID, participants }) => {
      console.log(RoomExists);
      if (RoomExists) {
        navigate(`/room/${roomID}`, { state: { roomIdLobby: roomID } });
      } else {
        alert("Room does not exist");
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
      <form onSubmit={handleJoinRoom}>
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
