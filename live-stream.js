"use strict";

/*
=========================================================
CHUK AN CHUKK
LIVE STREAM V1
1 HOST -> MANY VIEWERS

WebRTC video
Supabase Realtime signaling

Tidak mengubah live.js
Tidak mengubah kamera utama
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://aoaqvbrxgtfuvyiscpic.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Yjdm78LEqtijgVfB160byA_RHsml_Ga";

    /*
     * Supabase JS harus tersedia.
     */

    if (!window.supabase) {

        console.error(
            "❌ Supabase JS belum dimuat."
        );

        return;
    }


    const client =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    /* =====================================================
       ROOM
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );

    let roomId =
        params.get("live");


    /*
     * Kalau belum ada room:
     * halaman ini dianggap HOST.
     */

    const isNewHost =
        !roomId;


    if (!roomId) {

        roomId =
            "chuk-" +
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 8);

        /*
         * URL yang dibagikan TIDAK mempunyai
         * parameter host.
         */

        const viewerUrl =
            window.location.origin +
            window.location.pathname +
            "?live=" +
            encodeURIComponent(roomId);

        window.history.replaceState(
            {},
            "",
            viewerUrl
        );

    }


    /*
     * Host hanya ditentukan saat halaman
     * pertama kali membuat room.
     */

    const isHost = isNewHost;


    console.log(
        isHost
            ? "🎥 CHUK LIVE HOST"
            : "👀 CHUK LIVE VIEWER"
    );

    console.log(
        "🏠 ROOM:",
        roomId
    );


    /* =====================================================
       VIDEO HOST
    ===================================================== */

    const video =
        document.getElementById("camera");


    if (!video) {

        console.error(
            "❌ #camera tidak ditemukan."
        );

        return;
    }


    /*
     * Penonton tidak boleh membuka kamera.
     */

    if (!isHost) {

        video.srcObject = null;

        video.pause();

        video.style.transform =
            "scaleX(1)";

        video.muted = true;

        /*
         * Kita akan membuat video receiver
         * di atas kamera lokal.
         */

        video.style.display =
            "none";

    }


    /* =====================================================
       ROOM CHANNEL
    ===================================================== */

    const channelName =
        "chuk-live-" + roomId;

    const channel =
        client.channel(
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
       CONNECTIONS HOST
    ===================================================== */

    const peers =
        new Map();


    /* =====================================================
       ID VIEWER
    ===================================================== */

    const viewerId =
        "viewer-" +
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .slice(2, 10);


    /* =====================================================
       HOST CAMERA
    ===================================================== */

    let hostStream = null;


    async function getHostCamera() {

        if (hostStream) {
            return hostStream;
        }


        try {

            hostStream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {
                            ideal: "user"
                        },
                        width: {
                            ideal: 1280
                        },
                        height: {
                            ideal: 720
                        }
                    },
                    audio: true
                });


            /*
             * live.js tetap menangani tampilan
             * kamera lokal.
             *
             * Kita hanya memastikan stream
             * tersedia untuk WebRTC.
             */

            if (
                !video.srcObject
            ) {

                video.srcObject =
                    hostStream;

            }


            console.log(
                "🎥 HOST STREAM SIAP"
            );


            return hostStream;


        } catch (error) {

            console.error(
                "❌ Kamera host gagal:",
                error
            );

            alert(
                "Kamera/mikrofon Live tidak dapat digunakan."
            );

            throw error;
        }

    }


    /* =====================================================
       HOST -> BUAT PEER UNTUK VIEWER
    ===================================================== */

    async function createHostPeer(
        targetViewerId
    ) {

        /*
         * Tutup koneksi lama jika ada.
         */

        if (
            peers.has(targetViewerId)
        ) {

            try {

                peers
                    .get(targetViewerId)
                    .pc
                    .close();

            } catch (e) {}

            peers.delete(
                targetViewerId
            );

        }


        const pc =
            new RTCPeerConnection({
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
            });


        peers.set(
            targetViewerId,
            {
                pc
            }
        );


        const stream =
            await getHostCamera();


        /*
         * Kirim video + audio Host.
         */

        stream
            .getTracks()
            .forEach(track => {

                pc.addTrack(
                    track,
                    stream
                );

            });


        /*
         * ICE candidate Host
         * dikirim ke Viewer tertentu.
         */

        pc.onicecandidate =
            async event => {

                if (!event.candidate) {
                    return;
                }


                await channel.send({

                    type: "broadcast",

                    event: "ice",

                    payload: {

                        from: "host",

                        to: targetViewerId,

                        candidate:
                            event.candidate

                    }

                });

            };


        const offer =
            await pc.createOffer();


        await pc.setLocalDescription(
            offer
        );


        /*
         * Kirim OFFER ke viewer.
         */

        await channel.send({

            type: "broadcast",

            event: "offer",

            payload: {

                from: "host",

                to: targetViewerId,

                offer: pc.localDescription

            }

        });


        console.log(
            "📡 OFFER dikirim ke:",
            targetViewerId
        );

    }


    /* =====================================================
       VIEWER PEER
    ===================================================== */

    let viewerPeer = null;


    function createViewerPeer() {

        if (viewerPeer) {

            try {
                viewerPeer.close();
            } catch (e) {}

        }


        viewerPeer =
            new RTCPeerConnection({
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
            });


        /*
         * Video hasil Host.
         */

        viewerPeer.ontrack =
            event => {

                let remoteVideo =
                    document.getElementById(
                        "chukRemoteLive"
                    );


                if (!remoteVideo) {

                    remoteVideo =
                        document.createElement(
                            "video"
                        );

                    remoteVideo.id =
                        "chukRemoteLive";

                    remoteVideo.autoplay =
                        true;

                    remoteVideo.playsInline =
                        true;

                    remoteVideo.controls =
                        false;

                    remoteVideo.muted =
                        false;


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


                    const app =
                        document.getElementById(
                            "liveApp"
                        );

                    if (app) {
                        app.appendChild(
                            remoteVideo
                        );
                    }

                }


                if (
                    remoteVideo.srcObject !==
                    event.streams[0]
                ) {

                    remoteVideo.srcObject =
                        event.streams[0];

                }


                remoteVideo.play()
                    .catch(() => {});


                console.log(
                    "🎬 VIDEO HOST DITERIMA"
                );

            };


        /*
         * ICE Viewer -> Host
         */

        viewerPeer.onicecandidate =
            async event => {

                if (!event.candidate) {
                    return;
                }


                await channel.send({

                    type: "broadcast",

                    event: "ice",

                    payload: {

                        from: viewerId,

                        to: "host",

                        candidate:
                            event.candidate

                    }

                });

            };


        return viewerPeer;

    }


    /* =====================================================
       TERIMA SIGNAL
    ===================================================== */

    channel.on(
        "broadcast",
        {
            event: "*"
        },
        async message => {

            const event =
                message.payload || {};


            /* =============================================
               HOST MENERIMA JOIN
            ============================================= */

            if (
                isHost &&
                event.from &&
                event.from !== "host" &&
                event.type === "join"
            ) {

                console.log(
                    "👤 VIEWER MASUK:",
                    event.from
                );


                await createHostPeer(
                    event.from
                );


                return;
            }


            /* =============================================
               VIEWER MENERIMA OFFER
            ============================================= */

            if (
                !isHost &&
                event.type === "offer" &&
                event.to === viewerId
            ) {

                console.log(
                    "📥 OFFER HOST DITERIMA"
                );


                const pc =
                    createViewerPeer();


                await pc.setRemoteDescription(
                    event.offer
                );


                const answer =
                    await pc.createAnswer();


                await pc.setLocalDescription(
                    answer
                );


                await channel.send({

                    type: "broadcast",

                    event: "answer",

                    payload: {

                        from: viewerId,

                        to: "host",

                        answer:
                            pc.localDescription

                    }

                });


                return;
            }


            /* =============================================
               HOST MENERIMA ANSWER
            ============================================= */

            if (
                isHost &&
                event.type === "answer" &&
                event.to === "host"
            ) {

                const peer =
                    peers.get(
                        event.from
                    );


                if (!peer) {
                    return;
                }


                await peer.pc.setRemoteDescription(
                    event.answer
                );


                console.log(
                    "✅ ANSWER VIEWER DITERIMA"
                );


                return;
            }


            /* =============================================
               ICE
            ============================================= */

            if (
                event.type === "ice"
            ) {

                /*
                 * Host menerima ICE dari Viewer.
                 */

                if (
                    isHost &&
                    event.to === "host"
                ) {

                    const peer =
                        peers.get(
                            event.from
                        );


                    if (
                        peer &&
                        event.candidate
                    ) {

                        try {

                            await peer.pc
                                .addIceCandidate(
                                    event.candidate
                                );

                        } catch (error) {

                            console.warn(
                                "ICE host error:",
                                error
                            );

                        }

                    }

                }


                /*
                 * Viewer menerima ICE Host.
                 */

                if (
                    !isHost &&
                    event.to === viewerId &&
                    event.candidate
                ) {

                    if (viewerPeer) {

                        try {

                            await viewerPeer
                                .addIceCandidate(
                                    event.candidate
                                );

                        } catch (error) {

                            console.warn(
                                "ICE viewer error:",
                                error
                            );

                        }

                    }

                }

            }

        }
    );


    /* =====================================================
       CONNECT CHANNEL
    ===================================================== */

    channel.subscribe(
        async status => {

            console.log(
                "📡 Supabase Live:",
                status
            );


            if (
                status !== "SUBSCRIBED"
            ) {

                return;
            }


            /* =============================================
               HOST
            ============================================= */

            if (isHost) {

                await getHostCamera();


                console.log(
                    "🎥 HOST LIVE AKTIF"
                );

                console.log(
                    "🔗 ROOM:",
                    roomId
                );


                return;
            }


            /* =============================================
               VIEWER
            ============================================= */

            console.log(
                "👀 VIEWER TERHUBUNG"
            );


            await channel.send({

                type: "broadcast",

                event: "join",

                payload: {

                    type: "join",

                    from: viewerId

                }

            });


            console.log(
                "📨 PERMINTAAN STREAM DIKIRIM"
            );

        }
    );


    /* =====================================================
       GLOBAL INFO
    ===================================================== */

    window.CHUK_LIVE_STREAM = {

        roomId,

        isHost,

        viewerId,

        getViewerUrl() {

            return (
                window.location.origin +
                window.location.pathname +
                "?live=" +
                encodeURIComponent(roomId)
            );

        }

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

                peers.forEach(
                    peer => {

                        try {
                            peer.pc.close();
                        } catch (e) {}

                    }
                );

                if (hostStream) {

                    hostStream
                        .getTracks()
                        .forEach(
                            track => track.stop()
                        );

                }

                client.removeChannel(
                    channel
                );

            } catch (error) {

                console.warn(
                    "Cleanup error:",
                    error
                );

            }

        }
    );


});
