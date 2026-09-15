"use strict";

/* =========================================================
   CHUK AN CHUKK — LIVE WATCH
   VIEWER ONLY
   NO CAMERA
   ROOM = CHUK-XXXXXX
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    console.log("🚀 CHUK AN CHUKK — LIVE WATCH");

    const SUPABASE_URL =
        "https://aoaqvbrxgtfuvyiscpic.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Yjdm78LEqtijgVfB160byA_RHsml_Ga";

    /* -----------------------------------------------------
       ELEMENT
       ----------------------------------------------------- */

    const video =
        document.getElementById("chukRemoteLive");

    if (!video) {
        console.error("❌ #chukRemoteLive tidak ditemukan");
        return;
    }

    /* -----------------------------------------------------
       ROOM DARI URL
       ----------------------------------------------------- */

    const params =
        new URLSearchParams(window.location.search);

    const roomId =
        params.get("room");

    if (!roomId) {

        console.error("❌ Room tidak ditemukan");

        showMessage(
            "❌ Room LIVE tidak ditemukan"
        );

        return;
    }

    console.log(
        "📺 Menonton room:",
        roomId
    );

    /* -----------------------------------------------------
       SUPABASE
       ----------------------------------------------------- */

    if (!window.supabase) {

        console.error(
            "❌ Supabase SDK tidak tersedia"
        );

        showMessage(
            "❌ Supabase tidak tersedia"
        );

        return;
    }

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    /* -----------------------------------------------------
       WEBRTC
       ----------------------------------------------------- */

    let peerConnection = null;

    let hostId = null;

    let remoteStream =
        new MediaStream();

    video.srcObject =
        remoteStream;

    video.autoplay = true;
    video.playsInline = true;
    video.muted = false;

    /* -----------------------------------------------------
       ROOM CHANNEL
       ----------------------------------------------------- */

    const channelName =
        "chuk-live-" + roomId;

    console.log(
        "📡 Channel:",
        channelName
    );

    const channel =
        supabaseClient.channel(
            channelName
        );

    /* -----------------------------------------------------
       CREATE VIEWER PEER
       ----------------------------------------------------- */

    function createPeer() {

        if (peerConnection) {

            try {
                peerConnection.close();
            } catch (e) {}

            peerConnection = null;
        }

        remoteStream =
            new MediaStream();

        video.srcObject =
            remoteStream;

        peerConnection =
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

        /* -------------------------------------------------
           TERIMA VIDEO HOST
           ------------------------------------------------- */

        peerConnection.ontrack =
            (event) => {

                console.log(
                    "🎥 Track diterima:",
                    event.track.kind
                );

                event.streams.forEach(
                    (stream) => {

                        stream
                            .getTracks()
                            .forEach(
                                (track) => {

                                    const exists =
                                        remoteStream
                                            .getTracks()
                                            .some(
                                                t =>
                                                    t.id ===
                                                    track.id
                                            );

                                    if (!exists) {

                                        remoteStream
                                            .addTrack(
                                                track
                                            );
                                    }

                                }
                            );
                    }
                );

                video.srcObject =
                    remoteStream;

                video.play()
                    .catch(() => {
                        console.log(
                            "ℹ️ Video menunggu interaksi user"
                        );
                    });

            };

        /* -------------------------------------------------
           ICE VIEWER → HOST
           ------------------------------------------------- */

        peerConnection.onicecandidate =
            async (event) => {

                if (
                    !event.candidate ||
                    !hostId
                ) {
                    return;
                }

                await channel.send({

                    type: "broadcast",

                   
