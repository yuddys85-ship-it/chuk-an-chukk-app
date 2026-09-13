"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE CAMERA
   FRONT ↔ BACK CAMERA
   ROOM — LIVE HOST 2 ↔ 9
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

            if (currentStream) {

                currentStream
                    .getTracks()
                    .forEach(track => track.stop());

                currentStream = null;
            }

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
                    "❌ Fallback kamera
