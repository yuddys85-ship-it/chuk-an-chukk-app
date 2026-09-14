"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    console.log("🚀 CHUK AN CHUKK — SUPABASE DIAGNOSTIC");

    const video = document.getElementById("chukRemoteLive");

    /* =====================================================
       STATUS
    ===================================================== */

    const box = document.createElement("div");

    box.id = "supabaseDebug";

    Object.assign(box.style, {
        position: "fixed",
        left: "10px",
        right: "10px",
        bottom: "15px",
        zIndex: "999999",
        padding: "16px",
        borderRadius: "14px",
        background: "rgba(0,0,0,.92)",
        color: "#fff",
        fontFamily: "Arial,sans-serif",
        fontSize: "14px",
        lineHeight: "1.55",
        textAlign: "center",
        wordBreak: "break-word"
    });

    document.body.appendChild(box);

    function show(message) {

        console.log("📺", message);

        box.innerHTML = message;
    }


    /* =====================================================
       VIDEO CHECK
    ===================================================== */

    if (!video) {

        show(
            "🔴 VIDEO ERROR<br><br>" +
            "#chukRemoteLive tidak ditemukan."
        );

        return;
    }


    /* =====================================================
       ROOM CHECK
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const roomId =
        params.get("room");


    if (!roomId) {

        show(
            "🔴 ROOM ERROR<br><br>" +
            "Room tidak ditemukan di URL."
        );

        return;
    }


    show(
        "🏠 ROOM<br>" +
        "<b>" + roomId + "</b><br><br>" +
        "⏳ Memeriksa Supabase..."
    );


    /* =====================================================
       SUPABASE CONFIG
    ===================================================== */

    const SUPABASE_URL =
        "https://aoaqvbrxgtfuvyiscpic.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Yjdm78LEqtijgVfB160byA_RHsml_Ga";


    /* =====================================================
       SUPABASE SDK
    ===================================================== */

    if (
        !window.supabase ||
        !window.supabase.createClient
    ) {

        show(
            "🔴 SUPABASE SDK ERROR<br><br>" +
            "Supabase JS belum tersedia."
        );

        return;
    }


    let client;


    try {

        client =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        console.log(
            "✅ Supabase client dibuat"
        );

    } catch (err) {

        console.error(err);

        show(
            "🔴 SUPABASE CLIENT ERROR<br><br>" +
            "<small>" +
            String(
                err.message || err
            ) +
            "</small>"
        );

        return;
    }


    /* =====================================================
       VIEWER ID
    ===================================================== */

    const viewerId =
        "viewer-" +
        Math.random()
            .toString(36)
            .substring(2, 10);


    console.log(
        "👀 VIEWER:",
        viewerId
    );


    /* =====================================================
       CHANNEL NAME
    ===================================================== */

    const channelName =
        "chuk-live-" + roomId;


    console.log(
        "📡 CHANNEL:",
        channelName
    );


    show(
        "🟢 SUPABASE CLIENT OK<br><br>" +
        "📡 Channel:<br>" +
        "<b>" +
        channelName +
        "</b><br><br>" +
        "⏳ Menghubungkan Realtime..."
    );


    /* =====================================================
       CHANNEL
    ===================================================== */

    let channel;

    try {

        channel =
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

    } catch (err) {

        console.error(
            "CHANNEL CREATE ERROR:",
            err
        );

        show(
            "🔴 CHANNEL CREATE ERROR<br><br>" +
            "<small>" +
            String(
                err.message || err
            ) +
            "</small>"
        );

        return;
    }


    /* =====================================================
       LISTEN HOST OFFER
    ===================================================== */

    channel.on(
        "broadcast",
        {
            event: "host-offer"
        },
        payload => {

            console.log(
                "📡 HOST OFFER:",
                payload
            );

            show(
                "🟢 SUPABASE TERHUBUNG 🔥<br><br>" +
                "📡 Host Offer diterima.<br>" +
                "WebRTC siap dilanjutkan."
            );
        }
    );


    /* =====================================================
       LISTEN HOST ICE
    ===================================================== */

    channel.on(
        "broadcast",
        {
            event: "host-ice"
        },
        payload => {

            console.log(
                "🧊 HOST ICE:",
                payload
            );
        }
    );


    /* =====================================================
       SUBSCRIBE
    ===================================================== */

    try {

        channel.subscribe(
            async status => {

                console.log(
                    "📡 SUPABASE STATUS:",
                    status
                );


                /* =========================================
                   BERHASIL
                ========================================= */

                if (
                    status === "SUBSCRIBED"
                ) {

                    show(
                        "🟢 SUPABASE REALTIME OK 🔥<br><br>" +
                        "Room: <b>" +
                        roomId +
                        "</b><br><br>" +
                        "⏳ Mengirim Viewer Join..."
                    );


                    try {

                        const result =
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
                            "📡 VIEWER JOIN RESULT:",
                            result
                        );


                        show(
                            "🟢 VIEWER TERHUBUNG KE SUPABASE 🔥<br><br>" +
                            "Room: <b>" +
                            roomId +
                            "</b><br><br>" +
                            "⏳ Menunggu Host..."
                        );


                    } catch (sendError) {

                        console.error(
                            "❌ SEND ERROR:",
                            sendError
                        );


                        show(
                            "🔴 SUPABASE SEND ERROR<br><br>" +
                            "<small>" +
                            formatError(
                                sendError
                            ) +
                            "</small>"
                        );
                    }

                }


                /* =========================================
                   CHANNEL ERROR
                ========================================= */

                else if (
                    status === "CHANNEL_ERROR"
                ) {

                    show(
                        "🔴 SUPABASE CHANNEL ERROR<br><br>" +
                        "Channel:<br>" +
                        "<b>" +
                        channelName +
                        "</b><br><br>" +
                        "⚠️ Realtime Broadcast gagal.<br><br>" +
                        "Cek detail Console browser."
                    );
                }


                /* =========================================
                   TIMEOUT
                ========================================= */

                else if (
                    status === "TIMED_OUT"
                ) {

                    show(
                        "🔴 SUPABASE TIMEOUT<br><br>" +
                        "Realtime tidak merespons.<br><br>" +
                        "Periksa koneksi internet."
                    );
                }


                /* =========================================
                   CLOSED
                ========================================= */

                else if (
                    status === "CLOSED"
                ) {

                    show(
                        "🟡 SUPABASE CHANNEL DITUTUP"
                    );
                }

            }
        );

    } catch (err) {

        console.error(
            "❌ SUBSCRIBE ERROR:",
            err
        );

        show(
            "🔴 SUPABASE SUBSCRIBE ERROR<br><br>" +
            "<small>" +
            formatError(err) +
            "</small>"
        );

        return;
    }


    /* =====================================================
       FORMAT ERROR
    ===================================================== */

    function formatError(err) {

        if (!err) {
            return "Unknown error";
        }

        try {

            return JSON.stringify(
                err,
                Object.getOwnPropertyNames(err),
                2
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /\n/g,
                "<br>"
            );

        } catch (e) {

            return String(
                err.message ||
                err
            );
        }
    }


    /* =====================================================
       GLOBAL ERROR
    ===================================================== */

    window.addEventListener(
        "error",
        event => {

            console.error(
                "GLOBAL ERROR:",
                event.error
            );

            if (
                event.error
            ) {

                show(
                    "🔴 JAVASCRIPT ERROR<br><br>" +
                    "<small>" +
                    formatError(
                        event.error
                    ) +
                    "</small>"
                );
            }
        }
    );


    /* =====================================================
       UNLOAD
    ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            try {

                client.removeChannel(
                    channel
                );

            } catch (e) {}

        }
    );

});
