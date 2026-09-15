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
 - Mendaftarkan LIVE ke tabel live_rooms
 - Mengirim video Host melalui WebRTC
 - Supabase Realtime sebagai signaling
=========================================================
*/

document.addEventListener("DOMContentLoaded", async () => {

    console.log("🎥 CHUK AN CHUKK LIVE STREAM HOST START");

    const camera =
        document.getElementById("camera");

    if (!camera) {
        console.error("❌ Elemen #camera tidak ditemukan");
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
        console.error("❌ Supabase SDK belum tersedia");
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

    const params =
        new URLSearchParams(
            window.location.search
        );

    const urlRoom =
        params.get("room");

    if (urlRoom) {
        roomId = urlRoom;
    }

    if (!roomId) {

        roomId = createRoomId();

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
    TAMPILKAN ROOM
    =====================================================
    */

    const roomDisplay =
        document.getElementById(
            "liveRoomDisplay"
        );

    if (roomDisplay && roomId) {

        roomDisplay.textContent =
            roomId;

        roomDisplay.classList.add(
            "room-active"
        );

        console.log(
            "🏷️ ROOM DITAMPILKAN:",
            roomId
        );
    }

    /*
    =====================================================
    PROFIL HOST
    =====================================================
    */

    function getHostProfile() {

        let profile = {};

        try {

            profile =
                JSON.parse(
                    localStorage.getItem(
                        "chukUserProfile"
                    )
                ) || {};

        } catch (error) {

            console.warn(
                "⚠️ Profil tidak dapat dibaca"
            );

        }

        return {

            username:
                profile.piUsername ||
                profile.username ||
                "",

            display_name:
                profile.displayName ||
                profile.display_name ||
                profile.piUsername ||
                profile.username ||
                "CHUK USER",

            avatar:
                profile.avatar ||
                profile.avatar_url ||
                "assets/logo.png"

        };
    }

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
    DAFTARKAN HOST KE LIVE_ROOMS
    =====================================================
    */

    async function registerLiveRoom() {

        const profile =
            getHostProfile();

        const roomData = {

            room_id:
                roomId,

            username:
                profile.username,

            display_name:
                profile.display_name,

            avatar:
                profile.avatar,

            room_name:
                window.liveRoom?.name ||
                window.liveRoomName ||
                window.CHUK_LIVE_ROOM_NAME ||
                "",

            is_live:
                true,

            updated_at:
                new Date().toISOString()

        };

        console.log(
            "📡 Mendaftarkan LIVE:",
            roomData
        );

        const { data, error } =
            await supabaseClient
                .from("live_rooms")
                .upsert(
                    roomData,
                    {
                        onConflict: "room_id"
                    }
                )
                .select()
                .single();

        if (error) {

            console.error(
                "❌ Gagal mendaftarkan LIVE:",
                error
            );

            console.error(
                "ℹ️ Jika muncul 'permission denied', RLS INSERT perlu diperiksa."
            );

            return false;
        }

        console.log(
            "✅ LIVE TERDAFTAR:",
            data
        );

        return true;
    }

    /*
    =====================================================
    UPDATE ROOM NAME
    =====================================================
    */

    async function updateLiveRoomName() {

        const roomName =
            window.liveRoom?.name ||
            window.liveRoomName ||
            window.CHUK_LIVE_ROOM_NAME ||
            "";

        const { error } =
            await supabaseClient
                .from("live_rooms")
                .update({
                    room_name:
                        roomName,
                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "room_id",
                    roomId
                );

        if (error) {

            console.warn(
                "⚠️ Gagal update nama room:",
                error
            );

        }

    }

    /*
    =====================================================
    MATIKAN LIVE
    =====================================================
    */

    async function stopLiveRoom() {

        try {

            const { error } =
                await supabaseClient
                    .from("live_rooms")
                    .update({
                        is_live: false,
                        updated_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "room_id",
                        roomId
                    );

            if (error) {

                console.warn(
                    "⚠️ Gagal menutup LIVE:",
                    error
                );

            } else {

                console.log(
                    "🔴 LIVE SELESAI:",
                    roomId
                );

            }

        } catch (error) {

            console.warn(
                "⚠️ Cleanup LIVE gagal:",
                error
            );

        }
    }

    /*
    =====================================================
    ROOM NAME BERUBAH
    =====================================================
    */

    window.addEventListener(
        "chuk-room-created",
        () => {

            if (roomId) {
                updateLiveRoomName();
            }

        }
    );

    /*
    =====================================================
    BUAT PEER VIEWER
    =====================================================
    */

    async function createViewerPeer(
        viewerId
    ) {

        console.log(
            "👀 Viewer masuk:",
            viewerId
        );

        hostStream =
            getHostStream();

        if (!hostStream) {

            console.warn(
                "⚠️ Kamera Host belum siap"
            );

            return;
        }

        const pc =
            new RTCPeerConnection(
                rtcConfig
            );

        peers.set(
            viewerId,
            pc
        );

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
        OFFER
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
    ANSWER VIEWER
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
    ICE VIEWER
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

                const roomDisplay =
                    document.getElementById(
                        "liveRoomDisplay"
                    );

                if (roomDisplay) {

                    roomDisplay.textContent =
                        roomId;

                    roomDisplay.classList.add(
                        "room-active"
                    );

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
    TUNGGU KAMERA
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
    DAFTARKAN LIVE
    =====================================================
    */

    await registerLiveRoom();

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
        "🏠 ROOM LIVE AKTIF:",
        roomId
    );

    console.log(
        "🔗 Viewer:",
        window.CHUK_LIVE_VIEWER_URL
    );

    console.log(
        "🚀 LIVE STREAM HOST SIAP"
    );

    /*
    =====================================================
    CLEANUP
    =====================================================
    */

    window.addEventListener(
        "beforeunload",
        () => {

            stopLiveRoom();

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
