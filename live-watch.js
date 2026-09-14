"use strict";

/*
=========================================================
 CHUK AN CHUKK
 LIVE WATCH — DIAGNOSTIC VIEWER
=========================================================

 VIEWER:
 - Tidak membuka kamera
 - Tidak membuka microphone
 - Hanya menerima video Host
 - Room dari URL:
   live-watch.html?room=CHUK-XXXXXX

 STATUS KONEKSI DITAMPILKAN LANGSUNG DI LAYAR
=========================================================
*/

document.addEventListener("DOMContentLoaded", async () => {

    console.log("🚀 LIVE WATCH START");

    const remoteVideo =
        document.getElementById("chukRemoteLive");

    if (!remoteVideo) {
        console.error("❌ VIDEO VIEWER TIDAK DITEMUKAN");
        return;
    }

    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.muted = true;

    /*
    =====================================================
    STATUS BOX
    =====================================================
    */

    const statusBox =
        document.createElement("div");

    statusBox.id =
        "chukLiveDiagnostic";

    statusBox.style.position =
        "fixed";

    statusBox.style.left =
        "12px";

    statusBox.style.right =
        "12px";

    statusBox.style.bottom =
        "20px";

    statusBox.style.zIndex =
        "999999";

    statusBox.style.padding =
        "14px";

    statusBox.style.background =
        "rgba(0,0,0,.85)";

    statusBox.style.color =
        "#fff";

    statusBox.style.borderRadius =
        "14px";

    statusBox.style.fontFamily =
        "Arial,sans-serif";

    statusBox.style.fontSize =
        "14px";

    statusBox.style.lineHeight =
        "1.5";

    statusBox.style.textAlign =
        "center";

    statusBox.style.pointerEvents =
        "none";

    document.body.appendChild(
        statusBox
    );


    function status(message) {

        console.log(
            "📺 LIVE STATUS:",
            message
        );

        statusBox.innerHTML =
            message;
    }


    function success(message) {

        console.log(
            "✅",
            message
        );

        statusBox.innerHTML =
            "🟢 " + message;
    }


    function error(message) {

        console.error(
            "❌",
            message
        );

        statusBox.innerHTML =
            "🔴 " + message;
    }


    /*
    =====================================================
    ROOM
    =====================================================
    */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const roomId =
        params.get("room");

    if (!roomId) {

        error(
            "ROOM TIDAK DITEMUKAN"
        );

        return;
    }

    console.log(
        "🏠 ROOM:",
        roomId
    );

    status(
        "🏠 Room: " +
        roomId +
        "<br>⏳ Menyiapkan koneksi..."
    );


    /*
    =====================================================
    SUPABASE
    =====================================================
    */

    const SUPABASE_URL =
        "https://aoaqvbrxgtfuvyiscpic.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Yjdm78LEqtijgVfB160byA_RHsml_Ga";


    if (
        !window.supabase ||
        !window.supabase.createClient
    ) {

        error(
            "SUPABASE SDK TIDAK TERSEDIA"
        );

        return;
    }


    let supabaseClient;

    try {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        console.log(
            "✅ SUPABASE CLIENT SIAP"
        );

    } catch (err) {

        console.error(
            err
        );

        error(
            "GAGAL MEMBUAT SUPABASE CLIENT"
        );

        return;
    }


    /*
    =====================================================
    VIEWER ID
    =====================================================
    */

    const viewerId =
        "viewer-" +
        Math.random()
            .toString(36)
            .substring(2, 10) +
        "-" +
        Date.now().toString(36);


    console.log(
        "👀 VIEWER ID:",
        viewerId
    );


    /*
    =====================================================
    WEBRTC
    =====================================================
    */

    const rtcConfig = {

        iceServers: [

            {
                urls:
                    "stun:stun.l.google.com:19302"
            },

            {
                urls:
                    "stun:stun1.l.google.com:19302"
            }

        ]

    };


    let peerConnection =
        null;

    let remoteDescriptionReady =
        false;

    const pendingIce =
        [];


    /*
    =====================================================
    CHANNEL
    =====================================================
    */

    const channel =
        supabaseClient.channel(
            "chuk-live-" + roomId,
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
    ADD ICE
    =====================================================
    */

    async function addIce(candidate) {

        if (!candidate) {
            return;
        }


        if (
            !peerConnection ||
            !remoteDescriptionReady
        ) {

            pendingIce.push(
                candidate
            );

            console.log(
                "⏳ ICE MASUK ANTREAN:",
                pendingIce.length
            );

            return;
        }


        try {

            await peerConnection.addIceCandidate(
                new RTCIceCandidate(candidate)
            );

            console.log(
                "🧊 ICE HOST DITAMBAHKAN"
            );

        } catch (err) {

            console.error(
                "❌ ICE GAGAL:",
                err
            );
        }
    }


    /*
    =====================================================
    FLUSH ICE
    =====================================================
    */

    async function flushIce() {

        if (
            !peerConnection ||
            !remoteDescriptionReady
        ) {
            return;
        }


        console.log(
            "🧊 MEMPROSES ICE:",
            pendingIce.length
        );


        while (
            pendingIce.length > 0
        ) {

            const candidate =
                pendingIce.shift();

            try {

                await peerConnection.addIceCandidate(
                    new RTCIceCandidate(candidate)
                );

                console.log(
                    "✅ ICE ANTREAN OK"
                );

            } catch (err) {

                console.error(
                    "❌ ICE ANTREAN GAGAL:",
                    err
                );
            }
        }
    }


    /*
    =====================================================
    CREATE PEER
    =====================================================
    */

    function createPeer() {

        if (peerConnection) {

            try {
                peerConnection.close();
            } catch (e) {}

        }


        console.log(
            "🔗 MEMBUAT PEER CONNECTION"
        );


        peerConnection =
            new RTCPeerConnection(
                rtcConfig
            );


        /*
        ================================================
        TRACK HOST
        ================================================
        */

        peerConnection.ontrack =
            event => {

                console.log(
                    "🎥 TRACK HOST DITERIMA"
                );


                let stream;


                if (
                    event.streams &&
                    event.streams.length > 0
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


                remoteVideo.muted =
                    true;


                remoteVideo.play()
                    .then(() => {

                        success(
                            "LIVE TERHUBUNG 🔥"
                        );

                    })
                    .catch(err => {

                        console.warn(
                            "⚠️ VIDEO PLAY GAGAL:",
                            err
                        );

                        status(
                            "🟡 STREAM SUDAH MASUK<br>" +
                            "Tap layar untuk memutar."
                        );

                    });
            };


        /*
        ================================================
        ICE VIEWER
        ================================================
        */

        peerConnection.onicecandidate =
            async event => {

                if (
                    !event.candidate
                ) {
                    return;
                }


                console.log(
                    "🧊 ICE VIEWER DIKIRIM"
                );


                try {

                    await channel.send({

                        type:
                            "broadcast",

                        event:
                            "viewer-ice",

                        payload: {

                            roomId:
                                roomId,

                            viewerId:
                                viewerId,

                            candidate:
                                event.candidate
                        }

                    });

                } catch (err) {

                    console.error(
                        "❌ GAGAL KIRIM ICE VIEWER:",
                        err
                    );
                }
            };


        /*
        ================================================
        CONNECTION STATE
        ================================================
        */

        peerConnection.onconnectionstatechange =
            () => {

                const state =
                    peerConnection.connectionState;


                console.log(
                    "🌐 WEBRTC:",
                    state
                );


                if (
                    state === "new"
                ) {

                    status(
                        "🔵 WebRTC siap..."
                    );

                }


                if (
                    state === "connecting"
                ) {

                    status(
                        "🟡 Menghubungkan ke Host..."
                    );

                }


                if (
                    state === "connected"
                ) {

                    success(
                        "LIVE TERHUBUNG 🔥"
                    );

                }


                if (
                    state === "disconnected"
                ) {

                    error(
                        "Koneksi Live terputus."
                    );

                }


                if (
                    state === "failed"
                ) {

                    error(
                        "WEBRTC GAGAL TERHUBUNG"
                    );

                    statusBox.innerHTML +=
                        "<br><small>" +
                        "Kemungkinan jaringan/NAT. " +
                        "Kita perlu cek TURN." +
                        "</small>";

                }


                if (
                    state === "closed"
                ) {

                    error(
                        "Koneksi Live ditutup."
                    );
                }

            };


        /*
        ================================================
        ICE CONNECTION STATE
        ================================================
        */

        peerConnection.oniceconnectionstatechange =
            () => {

                const state =
                    peerConnection.iceConnectionState;


                console.log(
                    "🧊 ICE STATE:",
                    state
                );


                if (
                    state === "checking"
                ) {

                    status(
                        "🟡 Memeriksa koneksi jaringan..."
                    );

                }


                if (
                    state === "connected"
                ) {

                    console.log(
                        "✅ ICE CONNECTED"
                    );

                }


                if (
                    state === "completed"
                ) {

                    console.log(
                        "✅ ICE COMPLETED"
                    );

                }


                if (
                    state === "failed"
                ) {

                    error(
                        "ICE GAGAL — jaringan tidak bisa terhubung."
                    );

                }

            };


        return peerConnection;
    }


    /*
    =====================================================
    HOST OFFER
    =====================================================
    */

    channel.on(
        "broadcast",
        {
            event:
                "host-offer"
        },

        async payload => {

            console.log(
                "📡 HOST OFFER DITERIMA"
            );


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

                console.log(
                    "ℹ️ OFFER UNTUK VIEWER LAIN"
                );

                return;
            }


            if (!data.offer) {

                error(
                    "OFFER HOST KOSONG"
                );

                return;
            }


            try {

                status(
                    "📡 Offer Host diterima..."
                );


                const pc =
                    createPeer();


                await pc.setRemoteDescription(
                    new RTCSessionDescription(
                        data.offer
                    )
                );


                remoteDescriptionReady =
                    true;


                console.log(
                    "✅ REMOTE DESCRIPTION SIAP"
                );


                await flushIce();


                const answer =
                    await pc.createAnswer();


                await pc.setLocalDescription(
                    answer
                );


                console.log(
                    "📡 MENGIRIM ANSWER KE HOST"
                );


                await channel.send({

                    type:
                        "broadcast",

                    event:
                        "viewer-answer",

                    payload: {

                        roomId:
                            roomId,

                        viewerId:
                            viewerId,

                        answer:
                            pc.localDescription
                    }

                });


                success(
                    "Answer terkirim. Menunggu video..."
                );


            } catch (err) {

                console.error(
                    "❌ OFFER ERROR:",
                    err
                );


                error(
                    "Gagal memproses Offer Host."
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
            event:
                "host-ice"
        },

        async payload => {

            console.log(
                "🧊 HOST ICE DITERIMA"
            );


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


            if (
                !data.candidate
            ) {
                return;
            }


            await addIce(
                data.candidate
            );

        }
    );


    /*
    =====================================================
    SUBSCRIBE
    =====================================================
    */

    status(
        "🔄 Menghubungkan ke server..."
    );


    channel.subscribe(
        async state => {

            console.log(
                "📡 CHANNEL:",
                state
            );


            if (
                state === "SUBSCRIBED"
            ) {

                console.log(
                    "✅ CHANNEL SUBSCRIBED"
                );


                status(
                    "🟢 Terhubung ke server<br>" +
                    "⏳ Menunggu Host..."
                );


                try {

                    await channel.send({

                        type:
                            "broadcast",

                        event:
                            "viewer-join",

                        payload: {

                            roomId:
                                roomId,

                            viewerId:
                                viewerId
                        }

                    });


                    console.log(
                        "📡 VIEWER-JOIN TERKIRIM"
                    );


                    status(
                        "🟢 Terhubung ke room<br>" +
                        "⏳ Menunggu Host..."
                    );


                } catch (err) {

                    console.error(
                        "❌ VIEWER-JOIN GAGAL:",
                        err
                    );


                    error(
                        "Gagal mengirim koneksi ke Host."
                    );
                }

            }


            if (
                state === "CHANNEL_ERROR"
            ) {

                error(
                    "SUPABASE CHANNEL ERROR"
                );

            }


            if (
                state === "TIMED_OUT"
            ) {

                error(
                    "Koneksi server TIMEOUT"
                );

            }

        }
    );


    /*
    =====================================================
    TAP VIDEO
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

                        if (
                            peerConnection &&
                            peerConnection.connectionState ===
                            "connected"
                        ) {

                            success(
                                "LIVE TERHUBUNG 🔥"
                            );
                        }

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
                } catch (e) {}

                peerConnection =
                    null;
            }


            try {

                supabaseClient.removeChannel(
                    channel
                );

            } catch (e) {}

        }
    );


    console.log(
        "✅ LIVE WATCH DIAGNOSTIC SIAP"
    );

});
