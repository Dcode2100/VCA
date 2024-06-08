# VCA
A Video confrencing web app


mysql://root:vcspassword@34.82.42.68:3306/vcs


***************************************************************

direct p2p conection using webrtc and chrome chat app

1. In first tab

const lc = new RTCPeerConnection()

const dc = lc.createDataChannel("Channel");

dc.onmessage = e => console.log("just got a message " + e.data);

dc.onopen = e => console.log("connection opened!")

lc.onicecandidate = e => console.log("new ice candidate " + JSON.stringify(lc.localDescription))

lc.createOffer().then(o => lc.setLocalDescription(o)).then(a => console.log("created answer"))


2. In second tab -> 

copy the offer from first tab and paste it in second tab

const rc = new RTCPeerConnection();

rc.onicecandidate = e => console.log("New Ice candidate! reprinting SDP" + JSON.stringify(rc.localDescription))

rc.ondatachannel = e => {
    rc.dc = e.channel;
    rc.dc.onmessage = e => console.log("new message from client" + e.data)
    rc.dc.oneopen = e => console.log("connection opened !!!!")
}

rc.setRemoteDescription(offer).then(e => console.log("offer set"))

rc.createAnswer().then(a=> rc.setLocalDescription(a)).then(a => console.log("created answer"))



3. In first tab
copy the answer from second tab and paste it in first tab

lc.setRemoteDescription(answer)

dc.send("message from dc channel publisher")

4. In second tab

rc.dc.send('message from dc channel subscriber')




