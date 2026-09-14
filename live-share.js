"use strict";

/*
=========================================================
 CHUK AN CHUKK
 LIVE SHARE
=========================================================

 Host:
 live.html?room=CHUK-XXXXXX

 Viewer:
 live-watch.html?room=CHUK-XXXXXX
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    const shareButton =
        document.getElementById("shareLiveButton");

    if (!shareButton) {

        console.error(
            "❌ Tombol Bagikan Live tidak ditemukan"
        );

        return;
    }

    /*
    =====================================================
    AMBIL ROOM ID
    =====================================================
    */

    function getRoomId() {

        /*
        -----------------------------------------------
        Prioritas 1:
        window.CHUK_LIVE_ROOM
        -----------------------------------------------
        */

        if (
            window.CHUK_LIVE_ROOM
        ) {

            return window.CHUK_LIVE_ROOM;

        }

        /*
        -----------------------------------------------
        Prioritas 2:
        window.liveRoomId
        -----------------------------------------------
        */

        if (
            window.liveRoomId
        ) {

            return window.liveRoomId;

        }

        /*
        -----------------------------------------------
        Prioritas 3:
        URL ?room=
        -----------------------------------------------
        */

        const params =
            new URLSearchParams(
                window.location.search
            );

        return params.get("room");

    }

    /*
    =====================================================
    BUAT LINK VIEWER
    =====================================================
    */

    function getViewerUrl() {

        const roomId =
            getRoomId();

        if (!roomId) {

            return null;

        }

        return (
            `${window.location.origin}` +
            `${window.location.pathname
                .replace(
                    /[^/]+$/,
                    ""
                )}` +
            `live-watch.html?room=` +
            encodeURIComponent(roomId)
        );

    }

    /*
    =====================================================
    SHARE
    =====================================================
    */

    shareButton.addEventListener(
        "click",
        async () => {

            const roomId =
                getRoomId();

            if (!roomId) {

                alert(
                    "Room Live belum tersedia. Tunggu sampai Live siap."
                );

                console.warn(
                    "❌ ROOM ID tidak ditemukan"
                );

                return;
            }

            const liveUrl =
                getViewerUrl();

            if (!liveUrl) {

                alert(
                    "Link Live tidak dapat dibuat."
                );

                return;
            }

            console.log(
                "🏠 ROOM:",
                roomId
            );

            console.log(
                "🔗 LINK VIEWER:",
                liveUrl
            );

            const shareData = {

                title:
                    "CHUK AN CHUKK — Live",

                text:
                    "Ayo lihat Live saya di Chuk an Chukk! 🔥",

                url:
                    liveUrl

            };

            /*
            =================================================
            NATIVE SHARE
            =================================================
            */

            try {

                if (
                    navigator.share
                ) {

                    await navigator.share(
                        shareData
                    );

                    console.log(
                        "✅ Link Viewer berhasil dibagikan"
                    );

                    return;
                }

                /*
                =============================================
                CLIPBOARD
                =============================================
                */

                if (
                    navigator.clipboard &&
                    navigator.clipboard.writeText
                ) {

                    await navigator.clipboard.writeText(
                        liveUrl
                    );

                    alert(
                        "Link Live berhasil disalin!"
                    );

                    console.log(
                        "📋 LINK DISALIN:",
                        liveUrl
                    );

                    return;
                }

                /*
                =============================================
                FALLBACK
                =============================================
                */

                const textArea =
                    document.createElement(
                        "textarea"
                    );

                textArea.value =
                    liveUrl;

                textArea.style.position =
                    "fixed";

                textArea.style.left =
                    "-9999px";

                textArea.style.top =
                    "0";

                document.body.appendChild(
                    textArea
                );

                textArea.focus();
                textArea.select();

                document.execCommand(
                    "copy"
                );

                textArea.remove();

                alert(
                    "Link Live berhasil disalin!"
                );

            } catch (error) {

                /*
                ---------------------------------------------
                User membatalkan Share
                ---------------------------------------------
                */

                if (
                    error &&
                    error.name ===
                    "AbortError"
                ) {

                    console.log(
                        "ℹ️ Share dibatalkan"
                    );

                    return;
                }

                console.error(
                    "❌ Gagal membagikan Live:",
                    error
                );

                /*
                ---------------------------------------------
                Coba tampilkan link jika Share gagal
                ---------------------------------------------
                */

                try {

                    await navigator.clipboard.writeText(
                        liveUrl
                    );

                    alert(
                        "Share gagal, tetapi link Live berhasil disalin!"
                    );

                } catch (clipboardError) {

                    alert(
                        "Gagal membagikan Live."
                    );

                }

            }

        }
    );

    console.log(
        "✅ LIVE SHARE AKTIF"
    );

});
