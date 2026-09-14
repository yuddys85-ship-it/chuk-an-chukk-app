"use strict";

/*
=========================================================
 CHUK AN CHUKK
 LIVE STREAM V1
 1 HOST -> MANY VIEWERS

 WebRTC = video/audio
 Supabase Realtime = signaling

 PENTING:
 - Tidak membuka kamera kedua
 - Memakai stream dari live.js
 - Host = halaman tanpa ?live=
 - Viewer = halaman dengan ?live=ROOM_ID
=========================================================
*/

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       ELEMENT
    ===================================================== */

    const video =
        document.getElementById("camera");

    const remoteVideo =
        document.getElementById("chukRemoteLive");

    if (!video) {

        console.error(
            "❌ #camera tidak ditemukan."
        );

        return;
    }


    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://aoaqvbrxgtfuvyiscpic.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Yjdm78LEqtijgVfB160byA_RHsml_Ga";

    if (!window.supabase) {

        console.error(
            "❌ Supabase JS belum dimuat."
        );

        return;
    }

    const supabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    /* =====================================================
       ROLE
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const roomFromUrl =
        params.get("live");

    /*
     * Host:
     * live.html
     *
     * Viewer:
     * live.html?live=ROOM_ID
     */

    const isViewer =
        Boolean(roomFromUrl);

    const isHost =
        !isViewer;


    /* =====================================================
       ROOM
    ===================================================== */

    let roomId =
        roomFromUrl;


    if (isHost) {

        roomId =
            "chuk-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 10);

        /*
         * Simpan URL viewer.
         *
         * Role Host tetap disimpan
         * di variable isHost.
         */

        const viewerUrl =
            window.location.origin +
            window.location.pathname +
            "?live=" +
            encodeURIComponent(roomId);

        window.CHUK_LIVE_VIEWER_URL =
            viewerUrl;

        window.CHUK_LIVE_ROOM =
            roomId;

        /*
         * URL browser menjadi link room.
         */

        window.history.replaceState(
            {},
            "",
            "?live=" +
            encodeURIComponent(roomId)
        );

        console.log(
            "🎥 HOST MEMBUAT ROOM:"
        );

        console.log(
            viewerUrl
        );

    } else {

        window.CHUK_LIVE_ROOM =
            roomId;

        console.log(
            "👀 VIEWER MASUK ROOM:",
            roomId
        );

    }


    /* =====================================================
       CLIENT ID
    ===================================================== */

    const clientId =
        crypto.randomUUID();


    /* =====================================================
       SUPABASE CHANNEL
    ===================================================== */

    const channelName =
        "chuk-live-" +
        roomId;

    const channel =
        supabase.channel(
            channelName,
            {
                config: {
                    broadcast: {
                        self: false
                    }
                }
            }
        );


    /* =====================================================
       WEBRTC CONFIG
    ===================================================== */

    const RTC_CONFIG = {

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


    /* =====================================================
       HOST PEERS
       viewerId -> RTCPeerConnection
    ===================================================== */

    const hostPeers =
        new Map();


    /* =====================================================
       VIEWER PEER
    ===================================================== */

    let viewerPeer =
        null;


    /* =====================================================
       GET HOST STREAM
    ===================================================== */

    function getHostStream() {

        /*
         * live.js sudah melakukan:
         *
         * video.srcObject = stream
         *
         * Kita hanya mengambilnya.
         */

        const stream =
            video.srcObject;

        if (
            stream &&
            stream instanceof MediaStream
        ) {

            return stream;

        }

        return null;
    }


    /* =====================================================
       MENUNGGU KAMERA HOST
    ===================================================== */

    async function waitForHostStream() {

        for (
            let attempt = 0;
            attempt < 100;
            attempt++
        ) {

            const stream =
                getHostStream();

            if (stream) {

                console.log(
                    "✅ STREAM DARI LIVE.JS DITEMUKAN"
                );

                return stream;

            }

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        200
                    )
            );
        }

        console.error(
            "❌ Stream Host tidak ditemukan."
        );

        return null;
    }


    /* =====================================================
       HOST:
       BUAT PEER UNTUK VIEWER
    ===================================================== */

    async function createHostPeer(
        viewerId
    ) {

        /*
         * Jika viewer sudah mempunyai
         * koneksi lama, tutup dulu.
         */

        if (
            hostPeers.has(viewerId)
        ) {

            try {

                hostPeers
                    .get(viewerId)
                    .close();

            } catch (error) {}

            hostPeers.delete(
                viewerId
            );
        }


        const peer =
            new RTCPeerConnection(
                RTC_CONFIG
            );


        hostPeers.set(
            viewerId,
            peer
        );


        /*
         * Ambil kamera yang sudah
         * dibuka oleh live.js.
         */

        const stream =
            await waitForHostStream();


        if (!stream) {

            peer.close();

            hostPeers.delete(
                viewerId
            );

            return;

        }


        /*
         * Kirim semua track:
         *
         * video
         * audio jika tersedia
         */

        stream
            .getTracks()
            .forEach(
                track => {

                    peer.addTrack(
                        track,
                        stream
                    );

                }
            );


        /* =================================================
           ICE HOST -> VIEWER
        ================================================= */

        peer.onicecandidate =
            event => {

                if (
                    !event.candidate
                ) {
                    return;
                }


                channel.send({

                    type: "broadcast",

                    event: "signal",

                    payload: {

                        action: "ice",

                        from: clientId,

                        to: viewerId,

                        candidate:
                            event.candidate

                    }

                });

            };


        /* =================================================
           CONNECTION STATE
        ================================================= */

        peer.onconnectionstatechange =
            () => {

                console.log(
                    "🔗 HOST ->",
                    viewerId,
                    ":",
                    peer.connectionState
                );


                if (
                    peer.connectionState ===
                    "failed"
                ) {

                    peer.close();

                    hostPeers.delete(
                        viewerId
                    );

                }

            };


        /* =================================================
           CREATE OFFER
        ================================================= */

        const offer =
            await peer.createOffer();


        await peer.setLocalDescription(
            offer
        );


        /* =================================================
           SEND OFFER
        ================================================= */

        await channel.send({

            type: "broadcast",

            event: "signal",

            payload: {

                action: "offer",

                from: clientId,

                to: viewerId,

                offer:
                    peer.localDescription

            }

        });


        console.log(
            "📡 OFFER dikirim ke Viewer:",
            viewerId
        );

    }


    /* =====================================================
       VIEWER:
       BUAT PEER
    ===================================================== */

    function createViewerPeer(
        hostId
    ) {

        if (viewerPeer) {

            try {
                viewerPeer.close();
            } catch (error) {}

        }


        viewerPeer =
            new RTCPeerConnection(
                RTC_CONFIG
            );


        /* =================================================
           REMOTE TRACK
        ================================================= */

        viewerPeer.ontrack =
            event => {

                const stream =
                    event.streams &&
                    event.streams[0];


                if (!stream) {
                    return;
                }


                if (!remoteVideo) {

                    console.error(
                        "❌ #chukRemoteLive tidak ditemukan."
                    );

                    return;

                }


                remoteVideo.srcObject =
                    stream;


                remoteVideo.autoplay =
                    true;

                remoteVideo.playsInline =
                    true;

                remoteVideo.muted =
                    false;


                remoteVideo.play()
                    .catch(
                        error => {

                            console.warn(
                                "⚠️ Remote video menunggu interaksi:",
                                error
                            );

                        }
                    );


                console.log(
                    "🎬 VIDEO HOST DITERIMA"
                );

            };


        /* =================================================
           ICE VIEWER -> HOST
        ================================================= */

        viewerPeer.onicecandidate =
            event => {

                if (
                    !event.candidate
                ) {
                    return;
                }


                channel.send({

                    type: "broadcast",

                    event: "signal",

                    payload: {

                        action: "ice",

                        from: clientId,

                        to: hostId,

                        candidate:
                            event.candidate

                    }

                });

            };


        viewerPeer.onconnectionstatechange =
            () => {

                console.log(
                    "🔗 VIEWER CONNECTION:",
                    viewerPeer.connectionState
                );

            };


        return viewerPeer;

    }


    /* =====================================================
       SIGNALING
    ===================================================== */

    channel.on(
        "broadcast",
        {
            event: "signal"
        },
        async message => {

            const payload =
                message.payload;


            if (!payload) {
                return;
            }


            /*
             * Pesan bukan untuk kita.
             */

            if (
                payload.to &&
                payload.to !== clientId
            ) {

                return;

            }


            /* =================================================
               HOST:
               VIEWER JOIN
            ================================================= */

            if (
                isHost &&
                payload.action ===
                "join"
            ) {

                const viewerId =
                    payload.from;


                if (!viewerId) {
                    return;
                }


                console.log(
                    "👤 VIEWER MASUK:",
                    viewerId
                );


                await createHostPeer(
                    viewerId
                );


                return;

            }


            /* =================================================
               VIEWER:
               OFFER HOST
            ================================================= */

            if (
                isViewer &&
                payload.action ===
                "offer"
            ) {

                const hostId =
                    payload.from;


                console.log(
                    "📥 OFFER HOST DITERIMA"
                );


                const peer =
                    createViewerPeer(
                        hostId
                    );


                await peer.setRemoteDescription(
                    payload.offer
                );


                const answer =
                    await peer.createAnswer();


                await peer.setLocalDescription(
                    answer
                );


                await channel.send({

                    type: "broadcast",

                    event: "signal",

                    payload: {

                        action: "answer",

                        from: clientId,

                        to: hostId,

                        answer:
                            peer.localDescription

                    }

                });


                console.log(
                    "📡 ANSWER DIKIRIM KE HOST"
                );


                return;

            }


            /* =================================================
               HOST:
               ANSWER VIEWER
            ================================================= */

            if (
                isHost &&
                payload.action ===
                "answer"
            ) {

                const viewerId =
                    payload.from;


                const peer =
                    hostPeers.get(
                        viewerId
                    );


                if (!peer) {
                    return;
                }


                await peer.setRemoteDescription(
                    payload.answer
                );


                console.log(
                    "✅ ANSWER VIEWER DITERIMA:",
                    viewerId
                );


                return;

            }


            /* =================================================
               ICE
            ================================================= */

            if (
                payload.action ===
                "ice"
            ) {

                /*
                 * HOST menerima ICE Viewer.
                 */

                if (
                    isHost &&
                    payload.to === clientId
                ) {

                    const peer =
                        hostPeers.get(
                            payload.from
                        );


                    if (
                        peer &&
                        payload.candidate
                    ) {

                        try {

                            await peer.addIceCandidate(
                                payload.candidate
                            );

                        } catch (error) {

                            console.warn(
                                "⚠️ ICE Host:",
                                error
                            );

                        }

                    }

                }


                /*
                 * VIEWER menerima ICE Host.
                 */

                if (
                    isViewer &&
                    payload.to === clientId
                ) {

                    if (
                        viewerPeer &&
                        payload.candidate
                    ) {

                        try {

                            await viewerPeer.addIceCandidate(
                                payload.candidate
                            );

                        } catch (error) {

                            console.warn(
                                "⚠️ ICE Viewer:",
                                error
                            );

                        }

                    }

                }

            }

        }
    );


    /* =====================================================
       SUBSCRIBE
    ===================================================== */

    await channel.subscribe(
        async status => {

            console.log(
                "📡 SUPABASE LIVE:",
                status
            );


            if (
                status !== "SUBSCRIBED"
            ) {

                return;

            }


            /* =================================================
               HOST
            ================================================= */

            if (isHost) {

                const stream =
                    await waitForHostStream();


                if (!stream) {

                    console.error(
                        "❌ HOST STREAM BELUM SIAP"
                    );

                    return;

                }


                console.log(
                    "🎥 HOST LIVE AKTIF"
                );


                console.log(
                    "🔗 LINK VIEWER:"
                );


                console.log(
                    window.CHUK_LIVE_VIEWER_URL
                );


                return;

            }


            /* =================================================
               VIEWER
            ================================================= */

            console.log(
                "👀 VIEWER SIAP"
            );


            await channel.send({

                type: "broadcast",

                event: "signal",

                payload: {

                    action: "join",

                    from: clientId,

                    to: null

                }

            });


            console.log(
                "📨 PERMINTAAN LIVE DIKIRIM"
            );

        }
    );


    /* =====================================================
       VIEWER UI
    ===================================================== */

    if (isViewer) {

        /*
         * Kamera lokal disembunyikan.
         */

        video.style.display =
            "none";


        const flipButton =
            document.getElementById(
                "flipCameraButton"
            );


        if (flipButton) {

            flipButton.style.display =
                "none";

        }


        if (remoteVideo) {

            remoteVideo.style.display =
                "block";

            remoteVideo.style.position =
                "absolute";

            remoteVideo.style.inset =
                "0";

            remoteVideo.style.width =
                "100%";

            remoteVideo.style.height =
                "100%";

            remoteVideo.style.objectFit =
                "contain";

            remoteVideo.style.objectPosition =
                "center center";

            remoteVideo.style.background =
                "#000";

            remoteVideo.style.zIndex =
                "2";

        }

    } else {

        /*
         * Host tidak menampilkan
         * remote video.
         */

        if (remoteVideo) {

            remoteVideo.style.display =
                "none";

        }

    }


    /* =====================================================
       GLOBAL
    ===================================================== */

    window.CHUK_LIVE_STREAM = {

        roomId,

        isHost,

        isViewer,

        clientId,

        viewerUrl:
            window.CHUK_LIVE_VIEWER_URL ||
            (
                window.location.origin +
                window.location.pathname +
                "?live=" +
                encodeURIComponent(roomId)
            )

    };


    /* =====================================================
       CLEANUP
    ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            try {

                if (viewerPeer) {
                    viewerPeer.close();
                }


                hostPeers.forEach(
                    peer => {

                        try {
                            peer.close();
                        } catch (error) {}

                    }
                );


                hostPeers.clear();


                supabase.removeChannel(
                    channel
                );

            } catch (error) {

                console.warn(
                    "⚠️ Cleanup:",
                    error
                );

            }

        }
    );


    console.log(
        "🚀 CHUK AN CHUKK LIVE STREAM V1 AKTIF"
    );

});
