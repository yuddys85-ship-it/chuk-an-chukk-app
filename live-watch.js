"use strict";

/*
=========================================================
 CHUK AN CHUKK
 LIVE WATCH — VIEWER WEBRTC
=========================================================

 Viewer:
 - Tidak membuka kamera
 - Tidak membuka microphone
 - Hanya menerima video Host
 - Room: live-watch.html?room=CHUK-XXXXXX

 Signaling:
 Supabase Realtime Broadcast

 Media:
 WebRTC
=========================================================
*/

document.addEventListener("DOMContentLoaded", async () => {

    console.log("👀 CHUK AN CHUKK LIVE WATCH START");

    const remoteVideo =
        document.getElementById("chukRemoteLive");

    if (!remoteVideo) {
        console.error("❌ #chukRemoteLive tidak ditemukan");
        return;
    }

    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.muted = false;

    remoteVideo.setAttribute("autoplay", "");
    remoteVideo.setAttribute("playsinline", "");
    remoteVideo.setAttribute("webkit-playsinline", "");

    const SUPABASE_URL =
        "https://aoaqvbrxgtfuvyiscpic.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Yjdm78LEqtijgVfB160byA_RHsml_Ga";

    if (
        !window.supabase ||
        !window.supabase.createClient
    ) {
        console.error("❌ Supabase SDK belum tersedia");
        showStatus("Supabase belum siap.");
        return;
    }

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    const params =
        new URLSearchParams(
            window.location.search
        );

    const roomId =
        params.get("room");

    if (!roomId) {
        console.error("❌ ROOM ID tidak ditemukan");
        showStatus("Room Live tidak ditemukan.");
        return;
    }

    console.log("🏠 ROOM VIEWER:", roomId);

    const viewerId =
        "viewer-" +
        Math.random()
            .toString(36)
            .substring(2, 10) +
        "-" +
        Date.now().toString(36);

    console.log("👀 VIEWER ID:", viewerId);

    function showStatus(message) {

        let status =
            document.getElementById("liveWatchStatus");

        if (!status) {

            status =
                document.createElement("div");

            status.id =
                "liveWatchStatus";

            status.style.position =
                "fixed";

            status.style.left =
                "50%";

            status.style.top =
                "50%";

            status.style.transform =
                "translate(-50%, -50%)";

            status.style.zIndex =
                "999999";

            status.style.color =
                "#fff";

            status.style.background =
                "rgba(0,0,0,.75)";

            status.style.padding =
                "14px 20px";

            status.style.borderRadius =
                "14px";

            status.style.fontSize =
                "15px";

            status.style.textAlign =
                "center";

            status.style.pointerEvents =
                "none";

            document.body.appendChild(status);
        }

        status.textContent =
            message;
    }

    function hideStatus() {

        const status =
            document.getElementById(
                "liveWatchStatus"
            );

        if (status) {
            status.remove();
        }
    }

    const rtcConfig = {

        iceServers: [

            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302"
                ]
            }

        ]

    };

    let peerConnection = null;

    /*
    =====================================================
    ICE QUEUE
    =====================================================
    */

    const pendingHostIce = [];

    async function addHostIce(candidate) {

        if (!candidate) {
            return;
        }

        if (!peerConnection) {

            console.log(
                "⏳ ICE Host diantrikan"
            );

            pendingHostIce.push(candidate);

            return;
        }

        try {

            await peerConnection.addIceCandidate(
                new RTCIceCandidate(candidate)
            );

            console.log(
                "🧊 ICE HOST DITERIMA"
            );

        } catch (error) {

            console.warn(
                "⚠️ ICE Host belum bisa ditambahkan:",
                error
            );

            pendingHostIce.push(candidate);
        }
    }

    async function flushHostIce() {

        if (!peerConnection) {
            return;
        }

        if (!pendingHostIce.length) {
            return;
        }

        console.log(
            "🧊 Memproses ICE antrean:",
            pendingHostIce.length
        );

        while (pendingHostIce.length) {

            const candidate =
                pendingHostIce.shift();

            try {

                await peerConnection.addIceCandidate(
                    new RTCIceCandidate(candidate)
                );

                console.log(
                    "✅ ICE antrean berhasil ditambahkan"
                );

            } catch (error) {

                console.warn(
                    "⚠️ Gagal memproses ICE antrean:",
                    error
                );
            }
        }
    }

    /*
    =====================================================
    CREATE PEER
    =====================================================
    */

    function createPeerConnection() {

        if (peerConnection) {

            try {
                peerConnection.close();
            } catch (error) {}

        }

        console.log(
            "🔗 Membuat PeerConnection Viewer"
        );

        peerConnection =
            new RTCPeerConnection(
                rtcConfig
            );

        peerConnection.ontrack =
            event => {

                console.log(
                    "🎥 TRACK HOST DITERIMA"
                );

                let stream = null;

                if (
                    event.streams &&
                    event.streams.length
                ) {

                    stream =
                        event.streams[0];

                } else {

                    stream =
                        new MediaStream();

                    stream.addTrack(
                        event.track
                    );
                }

                remoteVideo.srcObject =
                    stream;

                console.log(
                    "📺 STREAM HOST DIPASANG KE VIDEO"
                );

                remoteVideo.play()
                    .then(() => {

                        console.log(
                            "✅ LIVE HOST TAMPIL"
                        );

                        hideStatus();

                    })
                    .catch(error => {

                        console.warn(
                            "⚠️ Autoplay gagal:",
                            error
                        );

                        showStatus(
                            "Tap layar untuk menonton Live."
                        );
                    });
            };

        peerConnection.onicecandidate =
            async event => {

                if (!event.candidate) {
                    return;
                }

                try {

                    await channel.send({

                        type: "broadcast",

                        event: "viewer-ice",

                        payload: {

                            roomId:
                                roomId,

                            viewerId:
                                viewerId,

                            candidate:
                                event.candidate
                        }
                    });

                    console.log(
                        "🧊 ICE VIEWER DIKIRIM"
                    );

                } catch (error) {

                    console.error(
                        "❌ Gagal kirim ICE Viewer:",
                        error
                    );
                }
            };

        peerConnection.onconnectionstatechange =
            () => {

                if (!peerConnection) {
                    return;
                }

                console.log(
                    "🌐 WEBRTC:",
                    peerConnection.connectionState
                );

                switch (
                    peerConnection.connectionState
                ) {

                    case "new":

                        showStatus(
                            "Menunggu koneksi..."
                        );

                        break;

                    case "connecting":

                        showStatus(
                            "Menghubungkan ke Live..."
                        );

                        break;

                    case "connected":

                        console.log(
                            "✅ VIEWER TERHUBUNG KE HOST"
                        );

                        hideStatus();

                        break;

                    case "disconnected":

                        showStatus(
                            "Koneksi Live terputus."
                        );

                        break;

                    case "failed":

                        console.error(
                            "❌ WEBRTC CONNECTION FAILED"
                        );

                        showStatus(
                            "Gagal terhubung ke Live."
                        );

                        break;

                    case "closed":

                        showStatus(
                            "Live telah ditutup."
                        );

                        break;
                }
            };

        peerConnection.oniceconnectionstatechange =
            () => {

                if (!peerConnection) {
                    return;
                }

                console.log(
                    "🧊 ICE STATE:",
                    peerConnection.iceConnectionState
                );
            };

        return peerConnection;
    }

    /*
    =====================================================
    SUPABASE CHANNEL
    =====================================================
    */

    const channel =
        supabaseClient.channel(
            `chuk-live-${roomId}`,
            {
                config: {
                    broadcast: {
                        self: false
                    }
                }
            }
        );

    /*
    =====================================================
    HOST OFFER
    =====================================================
    */

    channel.on(
        "broadcast",
        {
            event: "host-offer"
        },
        async payload => {

            const data =
                payload.payload || {};

            console.log(
                "📡 OFFER HOST DITERIMA"
            );

            if (
                data.roomId &&
                data.roomId !== roomId
            ) {
                return;
            }

            if (
                data.viewerId &&
                data.viewerId !== viewerId
            ) {

                console.log(
                    "ℹ️ Offer untuk viewer lain"
                );

                return;
            }

            if (!data.offer) {

                console.warn(
                    "⚠️ OFFER HOST KOSONG"
                );

                return;
            }

            try {

                const pc =
                    createPeerConnection();

                await pc.setRemoteDescription(
                    new RTCSessionDescription(
                        data.offer
                    )
                );

                console.log(
                    "✅ REMOTE DESCRIPTION HOST TERPASANG"
                );

                await flushHostIce();

                const answer =
                    await pc.createAnswer();

                await pc.setLocalDescription(
                    answer
                );

                await channel.send({

                    type: "broadcast",

                    event: "viewer-answer",

                    payload: {

                        roomId:
                            roomId,

                        viewerId:
                            viewerId,

                        answer:
                            pc.localDescription
                    }
                });

                console.log(
                    "📡 ANSWER VIEWER DIKIRIM"
                );

            } catch (error) {

                console.error(
                    "❌ GAGAL MEMPROSES OFFER:",
                    error
                );

                showStatus(
                    "Gagal menghubungkan Live."
                );
            }
        }
    );

    /*
    =====================================================
    HOST ICE
    =====================================================
    */

    channel.on(
        "broadcast",
        {
            event: "host-ice"
        },
        async payload => {

            const data =
                payload.payload || {};

            if (
                data.roomId &&
                data.roomId !== roomId
            ) {
                return;
            }

            if (
                data.viewerId &&
                data.viewerId !== viewerId
            ) {
                return;
            }

            if (!data.candidate) {
                return;
            }

            await addHostIce(
                data.candidate
            );
        }
    );

    /*
    =====================================================
    CONNECT CHANNEL
    =====================================================
    */

    showStatus(
        "Menghubungkan ke Live..."
    );

    channel.subscribe(
        async status => {

            console.log(
                "📡 VIEWER CHANNEL:",
                status
            );

            if (
                status === "SUBSCRIBED"
            ) {

                console.log(
                    "✅ VIEWER TERHUBUNG KE ROOM:",
                    roomId
                );

                showStatus(
                    "Menunggu Host..."
                );

                try {

                    await channel.send({

                        type: "broadcast",

                        event: "viewer-join",

                        payload: {

                            roomId:
                                roomId,

                            viewerId:
                                viewerId
                        }
                    });

                    console.log(
                        "📡 VIEWER-JOIN DIKIRIM:",
                        viewerId
                    );

                } catch (error) {

                    console.error(
                        "❌ GAGAL KIRIM VIEWER-JOIN:",
                        error
                    );

                    showStatus(
                        "Gagal masuk ke Live."
                    );
                }
            }

            if (
                status === "CHANNEL_ERROR"
            ) {

                console.error(
                    "❌ SUPABASE CHANNEL ERROR"
                );

                showStatus(
                    "Gagal terhubung ke Live."
                );
            }

            if (
                status === "TIMED_OUT"
            ) {

                console.error(
                    "❌ SUPABASE CHANNEL TIMEOUT"
                );

                showStatus(
                    "Koneksi timeout."
                );
            }
        }
    );

    /*
    =====================================================
    TAP UNTUK PLAY
    =====================================================
    */

    document.addEventListener(
        "click",
        () => {

            if (
                remoteVideo.srcObject
            ) {

                remoteVideo.play()
                    .then(() => {
                        hideStatus();
                    })
                    .catch(() => {});
            }
        },
        {
            passive: true
        }
    );

    /*
    =====================================================
    CLEANUP
    =====================================================
    */

    window.addEventListener(
        "beforeunload",
        () => {

            if (peerConnection) {

                try {
                    peerConnection.close();
                } catch (error) {}

                peerConnection =
                    null;
            }

            try {

                supabaseClient.removeChannel(
                    channel
                );

            } catch (error) {}
        }
    );

    console.log(
        "🚀 LIVE WATCH VIEWER SIAP"
    );
});
