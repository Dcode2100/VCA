import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketIds, setRemoteSocketIds] = useState([]);
  const [myStream, setMyStream] = useState();
  const [remoteStreams, setRemoteStreams] = useState([]);

  const handleUserJoined = useCallback(({ id }) => {
    console.log(`Email ${id} joined room`);
    setRemoteSocketIds((prevIds) => [...prevIds, id]);
  }, []);

  const handleCallUser = useCallback(
    async (remoteSocketId) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const offer = await peer.getOffer();
      socket.emit("user:call", { to: remoteSocketId, offer });
    },
    [socket]
  );

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketIds((prevIds) => [...prevIds, from]);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(async ({ from, ans }) => {
    await peer.setRemoteDescription(ans, from);
  }, []);

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleNegoNeeded = useCallback(
    async (remoteSocketId) => {
      const offer = await peer.getOffer();
      socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    },
    [socket]
  );

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setRemoteDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStreams((prevStreams) => [...prevStreams, remoteStream]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeeded);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeeded);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeeded,
    handleNegoNeedFinal,
  ]);

  return (
    <div>
      <h1>Room Page</h1>
      {remoteSocketIds.length > 0 ? (
        <>
          <h4>Connected Users:</h4>
          <ul>
            {remoteSocketIds.map((id) => (
              <li key={id}>
                <button onClick={() => handleCallUser(id)}>Call User</button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <h4>No one in the room</h4>
      )}
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      <h1>My Stream</h1>
      {myStream && (
        <ReactPlayer
          playing
          muted
          height="100px"
          width="200px"
          url={myStream}
        />
      )}
      <h1>Remote Streams</h1>
      {remoteStreams.map((stream, index) => (
        <ReactPlayer
          key={index}
          playing
          muted
          height="100px"
          width="200px"
          url={stream}
        />
      ))}
    </div>
  );
};

export default RoomPage;
