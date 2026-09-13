/* =========================================================
   CHUK AN CHUKK
   LIVE.JS — NATIVE CAMERA CLEAN
   V1
   ========================================================= */

"use strict";

console.log("📷 CHUK LIVE — NATIVE CAMERA START");


document.addEventListener("DOMContentLoaded", async () => {

    const video = document.getElementById("camera");

    if (!video) {
        console.error("❌ Element #camera tidak ditemukan");
        return;
    }

    /* =====================================================
       VIDEO SETTINGS
       ===================================================== */

    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");


    /* =====================================================
       CAMERA STATE
       ===================================================== */

    let currentStream = null;

    let facingMode = "user";


    /* =====================================================
       START CAMERA
       ===================================================== */

    async function startCamera() {

        try {

            console.log(
                "📷 Membuka kamera:",
                facingMode
            );


            /* Hentikan kamera sebelumnya */

            if (currentStream) {

                currentStream
                    .getTracks()
                    .forEach(track => track.stop());

                currentStream = null;
            }


            /* Request camera */

            const stream =
                await navigator.mediaDevices.getUserMedia({

                    video: {
                        facingMode: facingMode,

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


            /* Pasang stream langsung ke video */

            video.srcObject = stream;


            await video.play();


            console.log(
                "✅ KAMERA AKTIF"
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
             * Fallback untuk browser/device
             * yang tidak menerima facingMode.
             */

            try {

                const stream =
                    await navigator.mediaDevices.getUserMedia({

                        video: true,

                        audio: false

                    });


                currentStream = stream;

                video.srcObject = stream;

                await video.play();


                console.log(
                    "✅ KAMERA AKTIF — FALLBACK"
                );


            } catch (fallbackError) {

                console.error(
                    "❌ Fallback kamera juga gagal:",
                    fallbackError
                );

            }

        }

    }


    /* =====================================================
       CAMERA FLIP
       Dipasang sebagai fungsi global untuk penggunaan nanti
       ===================================================== */

    window.chukFlipCamera = async function () {

        facingMode =
            facingMode === "user"
                ? "environment"
                : "user";


        console.log(
            "🔄 Ganti kamera:",
            facingMode
        );


        await startCamera();

    };


    /* =====================================================
       START
       ===================================================== */

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        console.error(
            "❌ Browser tidak mendukung getUserMedia"
        );

        return;
    }


    await startCamera();


    /* =====================================================
       CLEANUP
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
