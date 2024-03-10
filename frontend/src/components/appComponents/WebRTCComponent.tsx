import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";

const WebRTCComponent: React.FC = () => {
  const socket = useRef(io("http://localhost:5000"));
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Event listener for the 'init' event
    socket.current.on("init", () => {
      // Create a room or join an existing one
      const newRoomId = prompt("Enter Room ID:");
      if (newRoomId) {
        setRoomId(newRoomId);
        socket.current.emit("join", { roomId: newRoomId });
      } else {
        alert("Room ID cannot be empty.");
      }
    });

    // Event listener for the 'ready' event
    socket.current.on("ready", () => {
      // Start WebRTC connection
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }

          // Initialize WebRTC peer connection
          peerRef.current = new SimplePeer({ initiator: true, stream });

          // Event listener for the 'signal' event (offer created)
          peerRef.current.on("signal", (offerSignal) => {
            // Send the offer to the signaling server
            socket.current.emit("offer", { offer: offerSignal, targetUserId: roomId });
          });

          // Event listener for the 'connect' event
          peerRef.current.on("connect", () => {
            console.log("WebRTC connected!");
          });

          // Event listener for the 'data' event (optional - for data communication)
          peerRef.current.on("data", (data) => {
            console.log("Received data:", data);
          });

          // Event listener for the 'stream' event (remote stream received)
          peerRef.current.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });
        })
        .catch((error) => {
          console.error("Error accessing webcam:", error);
        });
    });

    // Event listener for the 'full' event
    socket.current.on("full", () => {
      alert("Room is full. Try again later.");
    });

    // Clean up the socket connection on component unmount
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      socket.current.disconnect();
    };
  }, [roomId]);

  return (
    <div>
      <h1>WebRTC Test</h1>
      {!roomId && <button onClick={() => socket.current.emit("init")}>Join Room</button>}
      <div>
        <h2>Your Video</h2>
        <video ref={localVideoRef} autoPlay playsInline muted />
      </div>
      <div>
        <h2>Remote Video</h2>
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>
    </div>
  );
};

export default WebRTCComponent;
