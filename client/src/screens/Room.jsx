import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createPeerConnection } from "../service/peer";
const RoomPage = () => {
  const location = useLocation();
  const { roomIdLobby, OwnerOffer } = location.state || {};
  const [roomId, setRoomId] = useState(null);
  const socket = useSocket();
  const navigate = useNavigate();
  const [roomParticipants, setroomParticipants] = useState([]);

  const handleExitRoom = () => {
    socket.emit("room:exit:request", {
      roomId: roomId,
      socketId: socket.id,
    });
  };

  useEffect(() => {
    function initializeFirstTimeRoomCreation() {
      // ! 0. handle the OwnerOffer from the lobby
      if (OwnerOffer) {
        debugger;
        console.log(
          "OwnerOffer local description set successfully",
          OwnerOffer
        );
      }
    }

    initializeFirstTimeRoomCreation();
    // ! 1. Get all the users in the room
    socket.emit("room:getAllUsers", { clientRoomId: roomIdLobby });
    socket.on("room:getAllUsers:response", ({ roomId, participants }) => {
      setroomParticipants(participants);
      setRoomId(roomId);
    });
    console.log("roomid from lobby", roomIdLobby);

    // ! 2. When new user joins update the room and get new participants
    socket.on("user:joined", () => {
      socket.emit("room:getAllUsers", { clientRoomId: roomIdLobby });
    });

    // ! 3. Handle exit the room
    socket.on("room:exit:response", ({ success, message }) => {
      if (success) {
        navigate("/");
      } else {
        alert(message);
      }
    });

    // ! 4 Handle user Left room
    socket.on("user:left", () => {
      socket.emit("room:getAllUsers", { clientRoomId: roomIdLobby });
    });

    // ! 5. handle the participant sendanswer event here
    socket.on("participant:answer", async ({ participantId, answer }) => {
      try {
        debugger;
        const peerConnection = createPeerConnection(socket.id);
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        console.error("Error setting remote description", error);
      }
    });

    return () => {
      socket.off("room:getAllUsers:response");
      socket.off("user:joined");
      socket.off("room:exit:response");
      socket.off("user:left");
      socket.off("participant:answer");
    };
  }, [socket, roomId, OwnerOffer]);

  return (
    <div>
      <h1>Room ID: {roomId ? roomId : " Not available"}</h1>
      <h4>People in the room right now:</h4>
      <ul>
        {roomParticipants?.map((userId) => (
          <li key={userId}>User ID: {userId}</li>
        ))}
      </ul>
      <button onClick={handleExitRoom}>Exit Room</button>
    </div>
  );
};

export default RoomPage;
