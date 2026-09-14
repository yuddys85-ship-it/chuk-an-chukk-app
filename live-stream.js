"use strict";

/*
=========================================================
 CHUK AN CHUKK
 LIVE STREAM — HOST
=========================================================

 Fungsi:
 - Khusus HOST
 - Tidak membuka kamera kedua
 - Mengambil stream dari #camera
 - Membuat ROOM
 - Mengirim video Host melalui WebRTC
 - Supabase Realtime sebagai signaling

 Viewer:
 live-watch.html?room=ROOM_ID
=========================================================
*/

document.addEventListener("DOMContentLoaded", async () => {

    console.log("🎥 CHUK AN CHUKK LIVE STREAM HOST START");

    const camera =
        document.getElementById("camera");

    if (!camera) {
        console.error(
            "❌ Elemen #camera tidak ditemukan"
        );
        return;
    }

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
        typeof window.supabase === "undefined" ||
        !window.supabase.createClient
    ) {

        console.error(
            "❌ Supabase SDK belum tersedia"
        );

        return;
    }

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

    /*
    =====================================================
    BUAT ROOM ID
    =====================================================
    */

    function createRoomId() {

        const random =
            Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();

        return "CHUK-" + random;
    }

    let roomId =
        window.liveRoomId || null;

    /*
    -----------------------------------------------------
    Jika URL sudah punya room
    -----------------------------------------------------
    */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const urlRoom =
        params.get("room");

    if (urlRoom) {
        roomId = urlRoom;
    }

    /*
    -----------------------------------------------------
    Jika belum ada room → buat
    -----------------------------------------------------
    */

    if (!roomId) {

        roomId =
            createRoomId();

        const newUrl =
            `${window.location.pathname}?room=${roomId}`;

        window.history.replaceState(
            {},
            "",
            newUrl
        );

        console.log(
            "🆕 ROOM HOST:",
            roomId
        );
    }

    window.liveRoomId =
        roomId;

    /*
    =====================================================
    ROOM CHANNEL
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
    WEBRTC
    =====================================================
    */

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

    /*
    =====================================================
    HOST STREAM
    =====================================================
    */

    let hostStream = null;

    function getHostStream() {

        if (
            camera.srcObject &&
            camera.srcObject instanceof MediaStream
        ) {

            return camera.srcObject;

        }

        return null;
    }

    /*
    =====================================================
    PEER LIST
    =====================================================
    */

    const peers =
        new Map();

    /*
    =====================================================
    BUAT PEER UNTUK VIEWER
    =====================================================
    */

    async function createViewerPeer(
        viewerId
    ) {

        console.log(
            "👀 Viewer masuk:",
            viewerId
        );

        /*
        -------------------------------------------------
        STREAM HOST
        -------------------------------------------------
        */

        hostStream =
            getHostStream();

        if (!hostStream) {

            console.warn(
                "⚠️ Kamera Host belum siap"
            );

            return;
        }

        /*
        -------------------------------------------------
        PEER CONNECTION
        -------------------------------------------------
        */

        const pc =
            new RTCPeerConnection(
                rtcConfig
            );

        peers.set(
            viewerId,
            pc
        );

        /*
        -------------------------------------------------
        TAMBAHKAN TRACK HOST
        -------------------------------------------------
        */

        hostStream
            .getTracks()
            .forEach(track => {

                try {

                    pc.addTrack(
                        track,
                        hostStream
                    );

                } catch (error) {

                    console.error(
                        "❌ Gagal tambah track:",
                        error
                    );

                }

            });

        /*
        -------------------------------------------------
        ICE HOST
        -------------------------------------------------
        */

        pc.onicecandidate =
            async event => {

                if (!event.candidate) {
                    return;
                }

                try {

                    await channel.send({

                        type: "broadcast",

                        event: "host-ice",

                        payload: {

                            roomId:
                                roomId,

                            viewerId:
                                viewerId,

                            candidate:
                                event.candidate

                        }

                    });

                } catch (error) {

                    console.error(
                        "❌ Gagal kirim Host ICE:",
                        error
                    );

                }

            };

        /*
        -------------------------------------------------
        CONNECTION STATE
        -------------------------------------------------
        */

        pc.onconnectionstatechange =
            () => {

                console.log(
                    "🌐 Viewer",
                    viewerId,
                    "→",
                    pc.connectionState
                );

                if (
                    pc.connectionState ===
                    "connected"
                ) {

                    console.log(
                        "✅ Viewer terhubung:",
                        viewerId
                    );
                }

                if (
                    pc.connectionState ===
                    "failed" ||
                    pc.connectionState ===
                    "disconnected" ||
                    pc.connectionState ===
                    "closed"
                ) {

                    try {
                        pc.close();
                    } catch (error) {}

                    peers.delete(
                        viewerId
                    );

                    console.log(
                        "👋 Viewer keluar:",
                        viewerId
                    );

                }

            };

        /*
        -------------------------------------------------
        BUAT OFFER
        -------------------------------------------------
        */

        try {

            const offer =
                await pc.createOffer();

            await pc.setLocalDescription(
                offer
            );

            await channel.send({

                type: "broadcast",

                event: "host-offer",

                payload: {

                    roomId:
                        roomId,

                    viewerId:
                        viewerId,

                    offer:
                        pc.localDescription

                }

            });

            console.log(
                "📡 OFFER dikirim:",
                viewerId
            );

        } catch (error) {

            console.error(
                "❌ Gagal membuat Offer:",
                error
            );

        }

    }

    /*
    =====================================================
    VIEWER ID
    =====================================================
    */

    function createViewerId() {

        return (
            "viewer-" +
            Math.random()
                .toString(36)
                .substring(2, 10)
        );

    }

    /*
    =====================================================
    VIEWER MASUK
    =====================================================
    */

    channel.on(
        "broadcast",
        {
            event: "viewer-join"
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

            const viewerId =
                data.viewerId ||
                createViewerId();

            await createViewerPeer(
                viewerId
            );

        }
    );

    /*
    =====================================================
    TERIMA ANSWER VIEWER
    =====================================================
    */

    channel.on(
        "broadcast",
        {
            event: "viewer-answer"
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

            const viewerId =
                data.viewerId;

            const answer =
                data.answer;

            if (
                !viewerId ||
                !answer
            ) {

                console.warn(
                    "⚠️ Answer Viewer tidak lengkap"
                );

                return;
            }

            const pc =
                peers.get(
                    viewerId
                );

            if (!pc) {

                console.warn(
                    "⚠️ Peer Viewer tidak ditemukan:",
                    viewerId
                );

                return;
            }

            try {

                await pc.setRemoteDescription(
                    new RTCSessionDescription(
                        answer
                    )
                );

                console.log(
                    "📡 ANSWER VIEWER DITERIMA:",
                    viewerId
                );

            } catch (error) {

                console.error(
                    "❌ Gagal set Answer:",
                    error
                );

            }

        }
    );

    /*
    =====================================================
    TERIMA ICE VIEWER
    =====================================================
    */

    channel.on(
        "broadcast",
        {
            event: "viewer-ice"
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

            const viewerId =
                data.viewerId;

            const candidate =
                data.candidate;

            if (
                !viewerId ||
                !candidate
            ) {
                return;
            }

            const pc =
                peers.get(
                    viewerId
                );

            if (!pc) {
                return;
            }

            try {

                await pc.addIceCandidate(
                    new RTCIceCandidate(
                        candidate
                    )
                );

                console.log(
                    "🧊 ICE Viewer diterima:",
                    viewerId
                );

            } catch (error) {

                console.warn(
                    "⚠️ Gagal tambah ICE Viewer:",
                    error
                );

            }

        }
    );

    /*
    =====================================================
    SUPABASE CONNECT
    =====================================================
    */

    channel.subscribe(
        status => {

            console.log(
                "📡 HOST CHANNEL:",
                status
            );

            if (
                status === "SUBSCRIBED"
            ) {

                console.log(
                    "✅ HOST TERHUBUNG KE ROOM:",
                    roomId
                );

                /*
                -------------------------------------------------
                TAMPILKAN ROOM
                -------------------------------------------------
                */

                const roomDisplay =
                    document.getElementById(
                        "liveRoomDisplay"
                    );

                if (roomDisplay) {

                    roomDisplay.textContent =
                        roomId;

                }

            }

            if (
                status === "CHANNEL_ERROR"
            ) {

                console.error(
                    "❌ Supabase Channel Error"
                );

            }

            if (
                status === "TIMED_OUT"
            ) {

                console.error(
                    "❌ Supabase Channel Timeout"
                );

            }

        }
    );

    /*
    =====================================================
    TUNGGU KAMERA DARI live.js
    =====================================================
    */

    async function waitForCamera() {

        for (
            let attempt = 0;
            attempt < 50;
            attempt++
        ) {

            const stream =
                getHostStream();

            if (stream) {

                console.log(
                    "📷 STREAM HOST SIAP"
                );

                hostStream =
                    stream;

                return true;
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
            "❌ Stream kamera Host tidak ditemukan"
        );

        return false;
    }

    const cameraReady =
        await waitForCamera();

    if (!cameraReady) {
        return;
    }

    /*
    =====================================================
    ID VIEWER UNTUK HOST
    =====================================================
    */

    console.log(
        "🏠 ROOM LIVE AKTIF:",
        roomId
    );

    console.log(
        "🔗 Viewer:",
        `${window.location.origin}/live-watch.html?room=${encodeURIComponent(roomId)}`
    );

    /*
    =====================================================
    GLOBAL DATA
    =====================================================
    */

    window.CHUK_LIVE_ROOM =
        roomId;

    window.CHUK_LIVE_VIEWER_URL =
        `${window.location.origin}/live-watch.html?room=${encodeURIComponent(roomId)}`;

    window.CHUK_LIVE_CHANNEL =
        channel;

    console.log(
        "🚀 LIVE STREAM HOST SIAP"
    );

    console.log(
        "👀 URL PENONTON:",
        window.CHUK_LIVE_VIEWER_URL
    );

    /*
    =====================================================
    CLEANUP
    =====================================================
    */

    window.addEventListener(
        "beforeunload",
        () => {

            peers.forEach(
                pc => {

                    try {
                        pc.close();
                    } catch (error) {}

                }
            );

            peers.clear();

            try {

                supabaseClient.removeChannel(
                    channel
                );

            } catch (error) {}

        }
    );

});
