import React, { useEffect, useCallback, useState, useRef } from "react";
import { useSocket } from "../context/SocketProvider";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { createPeerConnection, setLocalDescription, setRemoteDescription } from "../service/peer";

const RoomPage = () => {
  const location = useLocation();
  const { roomIdLobby, OwnerOffer } = location.state || {};
  const [roomId, setRoomId] = useState(null);
  const socket = useSocket();
  const navigate = useNavigate();
  const [roomParticipants, setRoomParticipants] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const localVideoRef = useRef(null);
  const peerConnections = useRef({});

  const handleExitRoom = useCallback(() => {
    socket.emit("room:exit:request", {
      roomId: roomId,
      socketId: socket.id,
    });
  }, [socket, roomId]);

  const setupLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const createPeerConnectionForUser = (userId) => {
    const peerConnection = createPeerConnection(userId, socket);
    peerConnections.current[userId] = peerConnection;

    peerConnection.ontrack = (event) => {
      setRemoteStreams((prevStreams) => ({
        ...prevStreams,
        [userId]: event.streams[0],
      }));
    };

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    return peerConnection;
  };

  useEffect(() => {
    let isInitialized = false;

    setupLocalStream();

    function initializeFirstTimeRoomCreation() {
      if (OwnerOffer && !isInitialized) {
        console.log("OwnerOffer local description set successfully", OwnerOffer);
        setLocalDescription(socket.id, OwnerOffer);
        isInitialized = true;
      }
    }

    initializeFirstTimeRoomCreation();

    socket.on("room:participants", ({ roomId, participants }) => {
      setRoomParticipants(participants);
      setRoomId(roomId);
    });

    socket.on("user:joined", ({ userId }) => {
      setRoomParticipants(prev => [...prev, userId]);
      if (localStream) {
        const peerConnection = createPeerConnectionForUser(userId);
        peerConnection.createOffer().then((offer) => {
          peerConnection.setLocalDescription(offer);
          socket.emit("webrtc:offer", { to: userId, offer });
        });
      }
    });

    socket.on("user:left", ({ userId }) => {
      // Instead of emitting getAllUsers, update the participants list directly
      setRoomParticipants(prev => prev.filter(id => id !== userId));
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }
      setRemoteStreams((prevStreams) => {
        const newStreams = { ...prevStreams };
        delete newStreams[userId];
        return newStreams;
      });
    });

    socket.on("room:exit:response", ({ success, message }) => {
      if (success) {
        navigate("/");
      } else {
        alert(message);
      }
    });

    socket.on("webrtc:offer", async ({ from, offer }) => {
      const peerConnection = createPeerConnectionForUser(from);
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("webrtc:answer", { to: from, answer });
    });

    socket.on("webrtc:answer", async ({ from, answer }) => {
      const peerConnection = peerConnections.current[from];
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on("webrtc:ice-candidate", async ({ from, candidate }) => {
      const peerConnection = peerConnections.current[from];
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.off("room:participants");
      socket.off("user:joined");
      socket.off("room:exit:response");
      socket.off("user:left");
      socket.off("webrtc:offer");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice-candidate");
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      isInitialized = false;
    };
  }, [socket, roomIdLobby, OwnerOffer, localStream]);

  return (
    <div>
      <h1>Room ID: {roomId ? roomId : " Not available"}</h1>
      <h4>People in the room right now:</h4>
      <ul>
        {roomParticipants?.map((userId) => (
          <li key={userId}>User ID: {userId}</li>
        ))}
      </ul>
      <div className="video-container">
        <div className="local-video">
          <h3>Your Video</h3>
          <video ref={localVideoRef} autoPlay muted playsInline />
        </div>
        {Object.entries(remoteStreams).map(([userId, stream]) => (
          <div key={userId} className="remote-video">
            <h3>User: {userId}</h3>
            <video
              ref={(el) => {
                if (el) el.srcObject = stream;
              }}
              autoPlay
              playsInline
            />
          </div>
        ))}
      </div>
      <button onClick={handleExitRoom}>Exit Room</button>
    </div>
  );
};

export default RoomPage;