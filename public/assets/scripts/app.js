// Connection permettant de communiquer l'offre avec l'autre utilisateur (websocket par exemple)
let signalingChannel = new SignalingChannel()
let pc // RTCPeerConnection

// Appelé lors de la réception d'une SessionDescription
let offerCreated = function(desc) {
    // On l'enregistre sur le point local
    pc.setLocalDescription(desc, function() {
        // On l'envoie l'offre à l'autre utilisateur
        signalingChannel.send(JSON.stringify({
            sdp: pc.localDescription
        }));
    }, logError)
}

// Permet de démarrer une conversation audio / vidéo
let startTalk = function() {
    pc = new RTCPeerConnection({
        iceServers: [{
            url: 'stun:stun.example.org'
        }]
    })

    // Lorsque l'on reçoit une nouvelle "route" possible on l'envois à l'autre utilisateur
    pc.onicecandidate = function(evt) {
        if (evt.candidate)
            signalingChannel.send(JSON.stringify({
                candidate: evt.candidate
            }))
    }

    // Permet de capturer la génération de "l'offre"
    pc.onnegotiationneeded = function() {
        pc.createOffer(offerCreated, logError) // On crée l'offre
    }

    // Quand on reçoit un flux vidéo on l'injecte dans notre <video>
    pc.onaddstream = function(e) {
        $video.src = URL.createObjectURL(e.stream)
    }

    // On utilise l'api media pour obtenir la vidéo / son de l'utilisateur
    navigator.getUserMedia({
        audio: true,
        video: true
    }, function(stream) {
        maVideo.src = URL.createObjectURL(stream);
        pc.addStream(stream);
    }, logError)
}

// Quand on reçoit un message de l'autre utilisateur
signalingChannel.onmessage = function(evt) {
    if (!pc) {
        startTalk()
    }
    let message = JSON.parse(evt.data)
    if (message.sdp)
        pc.setRemoteDescription(new RTCSessionDescription(message.sdp), function() {
            if (pc.remoteDescription.type == 'offer')
                pc.createAnswer(offerCreated, logError)
        }, logError)
    else
        pc.addIceCandidate(new RTCIceCandidate(message.candidate))
}