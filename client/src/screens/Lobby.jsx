import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import {
  createOffer,
  createPeerConnection,
  setRemoteDescription,
  setLocalDescription,
} from "../service/peer";

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
      createOffer(socket.id).then((offer) => {
        console.log("offer", offer);
        socket.emit("room:create", { offer });
      });
    }
  }, [isCreatingRoom, socket]);

  useEffect(() => {
    console.log(isCreatingRoom);

    socket.on("room:created:response", ({ RoomExists, roomID, offer }) => {
      if (RoomExists) {
        setIsCreatingRoom(false);
        setLocalDescription(socket.id, offer);
        navigate(`/room/${roomID}`, {
          state: { roomIdLobby: roomID, OwnerOffer: offer },
        });
      } else {
        alert("Room does not exist");
      }
    });

    socket.on("room:join:response", ({ RoomExists, roomID, offer }) => {
      console.log(RoomExists);
      debugger;
      if (RoomExists) {
        // Listen for the offer from the room creator
        debugger;
        socket.on("room:join:offer", async ({ offer }) => {
          const peerId = socket.id;
          const peerConnection = createPeerConnection(peerId);
          await setRemoteDescription(peerId, offer);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          debugger;
          socket.emit("participant:sendAnswer", { roomID: roomID, answer });
        });

        navigate(`/room/${roomID}`, {
          state: { roomIdLobby: roomID, OwnerOffer: offer },
        });
      } else {
        alert("Room does not exist");
      }
    });

    return () => {
      socket.off("room:created:response");
      socket.off("room:join:response");
      socket.off("room:join:offer");
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
