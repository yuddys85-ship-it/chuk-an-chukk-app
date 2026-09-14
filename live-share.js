"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const shareButton =
        document.getElementById("shareLiveButton");

    if (!shareButton) {
        console.error("❌ Tombol Share tidak ditemukan");
        return;
    }

    function getRoomId() {

        if (window.CHUK_LIVE_ROOM) {
            return window.CHUK_LIVE_ROOM;
        }

        if (window.liveRoomId) {
            return window.liveRoomId;
        }

        const params =
            new URLSearchParams(
                window.location.search
            );

        return params.get("room");
    }

    function createViewerUrl(roomId) {

        /*
         * Ambil folder tempat live.html berada.
         * Contoh:
         * https://domain.com/live.html
         *
         * menjadi:
         * https://domain.com/live-watch.html
         */

        const basePath =
            window.location.href
                .split("?")[0]
                .split("#")[0];

        const folder =
            basePath.substring(
                0,
                basePath.lastIndexOf("/") + 1
            );

        return (
            folder +
            "live-watch.html?room=" +
            encodeURIComponent(roomId)
        );
    }

    shareButton.addEventListener(
        "click",
        async () => {

            const roomId =
                getRoomId();

            if (!roomId) {

                alert(
                    "Room Live belum siap."
                );

                console.error(
                    "❌ Room ID tidak ditemukan"
                );

                return;
            }

            const viewerUrl =
                createViewerUrl(roomId);

            console.log(
                "🏠 ROOM:",
                roomId
            );

            console.log(
                "🔗 LINK VIEWER:",
                viewerUrl
            );

            const shareData = {

                title:
                    "CHUK AN CHUKK — Live",

                text:
                    "Ayo nonton Live saya di Chuk an Chukk 🔥",

                url:
                    viewerUrl
            };

            try {

                /*
                =========================================
                SHARE NATIVE
                =========================================
                */

                if (
                    navigator.share
                ) {

                    await navigator.share(
                        shareData
                    );

                    console.log(
                        "✅ LINK VIEWER DIBAGIKAN"
                    );

                    return;
                }

                /*
                =========================================
                COPY LINK
                =========================================
                */

                if (
                    navigator.clipboard &&
                    navigator.clipboard.writeText
                ) {

                    await navigator.clipboard.writeText(
                        viewerUrl
                    );

                    alert(
                        "Link Live berhasil disalin!"
                    );

                    return;
                }

                /*
                =========================================
                FALLBACK
                =========================================
                */

                const textarea =
                    document.createElement(
                        "textarea"
                    );

                textarea.value =
                    viewerUrl;

                textarea.style.position =
                    "fixed";

                textarea.style.left =
                    "-9999px";

                document.body.appendChild(
                    textarea
                );

                textarea.select();

                document.execCommand(
                    "copy"
                );

                textarea.remove();

                alert(
                    "Link Live berhasil disalin!"
                );

            } catch (error) {

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
                    "❌ Share gagal:",
                    error
                );

                alert(
                    "Gagal membagikan Live."
                );
            }

        }
    );

    console.log(
        "✅ LIVE SHARE AKTIF"
    );

});
