# VCA
A Video confrencing web app


mysql://root:vcspassword@34.82.42.68:3306/vcs

direct p2p conection using webrtc and simple console

1. In first tab
const lc = new RTCPeerConnection()

lc.onicecandidate = e => console.log("new ice candidate " + JSON.stringify(lc.localDescription))

lc.createOffer().then(o=> lc.setLocalDescription(o)).then(a=> console.log("set succesffully"))



webrtc-internals - >

createOffer
createOfferOnSuccess (type: "offer", 1 sections)
setLocalDescription (type: "offer", 1 sections)
setLocalDescriptionOnSuccess
signalingstatechange


2. In second tab
copy the offer from first tab and paste it in second tab

const offer = {"type":"offer","sdp":"v=0\r\no=- 9071671299354852901 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\n"}

const rc = new RTCPeerConnection()

rc.onicecandidate = e => console.log("new ice candidate " + JSON.stringify(rc.localDescription))

rc.setRemoteDescription(offer).then(a => console.log("offer set"))

rc.createAnswer().then(a=> rc.setLocalDescription(a).then(a => console.log("created answer"))

console.log(JSON.stringify(rc.localDescription))

 {"type":"answer","sdp":"v=0\r\no=- 7819600083561256494 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\n"}



webrtc-internals - >

Time	Event
08/06/2024, 08:38:27	
setRemoteDescription (type: "offer", 1 sections)
08/06/2024, 08:38:27	setRemoteDescriptionOnSuccess
08/06/2024, 08:38:27	
signalingstatechange
08/06/2024, 08:39:30	
createAnswer
08/06/2024, 08:39:30	
createAnswerOnSuccess (type: "answer", 1 sections)
08/06/2024, 08:39:30	
setLocalDescription (type: "answer", 1 sections)
08/06/2024, 08:39:30	setLocalDescriptionOnSuccess
08/06/2024, 08:39:30	
signalingstatechange

3. In first tab
copy the answer from second tab and paste it in first tab


webrtc-internals -> 

08/06/2024, 08:43:27	
setRemoteDescription (type: "answer", 1 sections)
08/06/2024, 08:43:27	setRemoteDescriptionOnSuccess
08/06/2024, 08:43:27	
signalingstatechange


