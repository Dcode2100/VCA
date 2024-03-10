import React, { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const WebSocketTest: React.FC = () => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    useEffect(() => {
        const socket: Socket = io("http://localhost:5000");

        // Function to initialize WebRTC
        const initWebRTC = async () => {
            const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
            peerConnection.current = new RTCPeerConnection(configuration);

            // Add event listeners
            peerConnection.current.addEventListener("icecandidate", handleICECandidate);
            peerConnection.current.addEventListener("iceconnectionstatechange", handleICEConnectionStateChange);
            peerConnection.current.addEventListener("track", handleTrack);

            // Get user media and add to the local video element
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Add tracks from the stream to the peer connection
                stream.getTracks().forEach((track) => {
                    peerConnection.current?.addTrack(track, stream);
                });

                // Create and send an offer to the other peer
                const offer = await peerConnection.current.createOffer();
                await peerConnection.current.setLocalDescription(offer);
                socket.emit("offer", { offer });
            } catch (error) {
                console.error("Error accessing webcam:", error);
            }
        };

        // Function to handle ICE candidates
        const handleICECandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                // Send ICE candidate to the other peer
                socket.emit("ice-candidate", { candidate: event.candidate });
            }
        };

        // Function to handle ICE connection state changes
        const handleICEConnectionStateChange = () => {
            const iceConnectionState = peerConnection.current?.iceConnectionState;
            console.log("ICE Connection State:", iceConnectionState);
        };

        // Function to handle incoming tracks
        const handleTrack = (event: RTCTrackEvent) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Event listener for receiving offer from the other peer
        socket.on("offer", async (data) => {
            const { offer } = data;

            console.log("Received offer:", offer);

            // Set the remote description
            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(offer));

            // Create and send an answer back
            const answer = await peerConnection.current?.createAnswer();
            await peerConnection.current?.setLocalDescription(answer);
            socket.emit("answer", { answer });
        });

        // Event listener for receiving answer from the other peer
        socket.on("answer", async (data) => {
            const { answer } = data;

            console.log("Received answer:", answer);

            // Set the remote description
            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
        });

        // Event listener for receiving ICE candidate from the other peer
        socket.on("ice-candidate", (data) => {
            const { candidate } = data;

            console.log("Received ICE candidate:", candidate);

            // Add the ICE candidate to the peer connection
            peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
        });

        // Initialize WebRTC when the component mounts
        initWebRTC();

        // Clean up the socket connection and peer connection on component unmount
        return () => {
            if (peerConnection.current) {
                peerConnection.current.close();
            }
            socket.disconnect();
        };
    }, []);

    return (
        <div>
            <h1>WebSocket + WebRTC Test</h1>
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

export default WebSocketTest;
