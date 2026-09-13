"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE CAMERA — FRONT / BACK SWITCH
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const video = document.getElementById("camera");
    const flipButton = document.getElementById("flipCameraButton");

    if (!video) {
        console.error("❌ #camera tidak ditemukan");
        return;
    }

    let currentStream = null;
    let facingMode = "user";

    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    async function startCamera() {

        try {
            console.log("📷 Membuka kamera:", facingMode);

            /* Matikan kamera sebelumnya */
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                currentStream = null;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: {
                        ideal: facingMode
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

            /* Kamera depan tidak mirror.
               Kamera belakang normal. */
            if (facingMode === "user") {
                video.style.transform = "scaleX(-1)";
                video.style.webkitTransform = "scaleX(-1)";
            } else {
                video.style.transform = "none";
                video.style.webkitTransform = "none";
            }

            await video.play();

            console.log("✅ Kamera aktif:", facingMode);

        } catch (error) {

            console.error("❌ Kamera gagal:", error);

            /* Coba kamera biasa sebagai fallback */
            try {

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });

                currentStream = stream;
                video.srcObject = stream;

                video.style.transform = "none";
                video.style.webkitTransform = "none";

                await video.play();

                console.log("✅ Kamera fallback aktif");

            } catch (fallbackError) {

                console.error(
                    "❌ Kamera fallback juga gagal:",
                    fallbackError
                );
            }
        }
    }

    /* =====================================================
       TOMBOL PINDAH KAMERA
       ===================================================== */

    if (flipButton) {

        flipButton.addEventListener("click", async () => {

            if (facingMode === "user") {
                facingMode = "environment";
            } else {
                facingMode = "user";
            }

            console.log("🔄 Pindah kamera ke:", facingMode);

            await startCamera();
        });

    } else {

        console.warn("⚠️ Tombol #flipCameraButton tidak ditemukan");

    }

    /* =====================================================
       CEK SUPPORT KAMERA
       ===================================================== */

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {
        console.error("❌ Browser tidak mendukung kamera");
        return;
    }

    /* Mulai kamera depan */
    await startCamera();

    /* Matikan kamera saat keluar */
    window.addEventListener("beforeunload", () => {

        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

    });

});
