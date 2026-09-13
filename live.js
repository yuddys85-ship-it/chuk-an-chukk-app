"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE CAMERA
   FRONT ↔ BACK CAMERA
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const video = document.getElementById("camera");
    const flipButton = document.getElementById("flipCameraButton");
    const menuButton = document.getElementById("menuButton");

    if (!video) {
        console.error("❌ Kamera #camera tidak ditemukan");
        return;
    }

    let currentStream = null;
    let facingMode = "user";
    let switching = false;

    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    /* =====================================================
       ATUR MIRROR
       ===================================================== */

    function updateMirror() {

        if (facingMode === "user") {
            video.style.setProperty(
                "transform",
                "scaleX(-1)",
                "important"
            );

            video.style.setProperty(
                "-webkit-transform",
                "scaleX(-1)",
                "important"
            );

        } else {

            video.style.setProperty(
                "transform",
                "none",
                "important"
            );

            video.style.setProperty(
                "-webkit-transform",
                "none",
                "important"
            );
        }
    }

    /* =====================================================
       BUKA KAMERA
       ===================================================== */

    async function startCamera() {

        if (switching) return;

        switching = true;

        try {

            console.log("📷 Membuka kamera:", facingMode);

            /* Matikan kamera sebelumnya */
            if (currentStream) {

                currentStream.getTracks().forEach(track => {
                    track.stop();
                });

                currentStream = null;
            }

            /* Buka kamera sesuai mode */
            const stream =
                await navigator.mediaDevices.getUserMedia({

                    video: {
                        facingMode: {
                            exact: facingMode
                        },

                        width: {
                            ideal: 1280
                        },

                        height: {
                            ideal: 720
                        },

                        frameRate: {
                            ideal: 30,
                            max: 30
                        }
                    },

                    audio: false
                });

            currentStream = stream;

            video.srcObject = stream;

            updateMirror();

            await video.play();

            console.log(
                "✅ Kamera aktif:",
                facingMode
            );

            console.log(
                "📐 Resolusi:",
                video.videoWidth,
                "x",
                video.videoHeight
            );

        } catch (error) {

            console.error(
                "❌ Kamera gagal:",
                error
            );

            /*
             Jika kamera exact tidak tersedia,
             coba kamera biasa.
            */

            try {

                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false
                    });

                currentStream = stream;

                video.srcObject = stream;

                updateMirror();

                await video.play();

                console.log(
                    "✅ Kamera fallback aktif"
                );

            } catch (fallbackError) {

                console.error(
                    "❌ Fallback kamera gagal:",
                    fallbackError
                );
            }

        } finally {

            switching = false;
        }
    }

    /* =====================================================
       TOMBOL PINDAH KAMERA
       ===================================================== */

    if (flipButton) {

        flipButton.addEventListener(
            "click",
            async () => {

                if (switching) return;

                if (facingMode === "user") {

                    facingMode = "environment";

                } else {

                    facingMode = "user";
                }

                console.log(
                    "🔄 Pindah kamera:",
                    facingMode
                );

                await startCamera();
            }
        );

    } else {

        console.warn(
            "⚠️ #flipCameraButton tidak ditemukan"
        );
    }

    /* =====================================================
       TOMBOL MENU
       ===================================================== */

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                console.log("☰ Menu ditekan");

                /*
                 Menu akan kita aktifkan
                 pada tahap berikutnya.
                */

            }
        );
    }

    /* =====================================================
       CEK SUPPORT KAMERA
       ===================================================== */

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        console.error(
            "❌ Browser tidak mendukung kamera"
        );

        return;
    }

    /* =====================================================
       MULAI KAMERA DEPAN
       ===================================================== */

    await startCamera();

    /* =====================================================
       MATIKAN KAMERA SAAT KELUAR
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            if (currentStream) {

                currentStream
                    .getTracks()
                    .forEach(track => track.stop());
            }
        }
    );

});

if (menuButton) {

    menuButton.addEventListener("click", () => {

        let roomMenu = document.getElementById("roomMenu");

        if (!roomMenu) {

            roomMenu = document.createElement("div");

            roomMenu.id = "roomMenu";
            roomMenu.textContent = "Room";

            roomMenu.style.position = "fixed";
            roomMenu.style.top = "75px";
            roomMenu.style.left = "18px";
            roomMenu.style.zIndex = "10000";

            roomMenu.style.padding = "12px 20px";

            roomMenu.style.background = "rgba(0, 0, 0, 0.75)";
            roomMenu.style.color = "#ffffff";

            roomMenu.style.borderRadius = "12px";

            roomMenu.style.fontSize = "16px";
            roomMenu.style.fontWeight = "600";

            document.getElementById("liveApp").appendChild(roomMenu);

        } else {

            roomMenu.remove();

        }

    });

}
