let peer;

const createPeerConnection = () => {
  if (!peer) {
    peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
  }
  return peer;
};

const createOffer = async () => {
  try {
    debugger;
    const peer = createPeerConnection(); // This is a new peer connection
    const offer = await peer.createOffer(); // This is a new offer
    // i dont want to set the local description here 
    return offer;
  } catch (error) {
    console.error("Error creating an offer", error);
    throw error;
  }
};

const setLocalDescription = async (offer) => {
  try {
    const peer = createPeerConnection();
    await peer.setLocalDescription(new RTCSessionDescription(offer));
  } catch (error) {
    console.error("Error setting local description", error);
    throw error;
  }
};

export { createOffer, setLocalDescription };
