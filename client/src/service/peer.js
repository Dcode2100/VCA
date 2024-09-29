const peerConnections = {};

const createPeerConnection = (id, socket) => {
  if (!peerConnections[id]) {
    peerConnections[id] = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });

    peerConnections[id].onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc:ice-candidate", {
          to: id,
          candidate: event.candidate,
        });
      }
    };
  }
  return peerConnections[id];
};

const createOffer = async (id) => {
  try {
    const peer = createPeerConnection(id);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  } catch (error) {
    console.error("Error creating an offer", error);
    throw error;
  }
};

const setLocalDescription = async (id, offer) => {
  try {
    const peer = createPeerConnection(id);
    await peer.setLocalDescription(new RTCSessionDescription(offer));
  } catch (error) {
    console.error("Error setting local description", error);
    throw error;
  }
};

const setRemoteDescription = async (id, answer) => {
  try {
    const peer = createPeerConnection(id);
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (error) {
    console.error("Error setting remote description", error);
    throw error;
  }
};

const getPeerConnection = (id) => {
  return peerConnections[id];
};

export { createOffer, setLocalDescription, setRemoteDescription, getPeerConnection, createPeerConnection };