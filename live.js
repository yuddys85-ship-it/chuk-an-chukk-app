"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE CAMERA — STABLE ANDROID
   FRONT ↔ BACK
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const video = document.getElementById("camera");
    const flipButton = document.getElementById("flipCameraButton");
    const menuButton = document.getElementById("menuButton");

    if (!video) {
        console.error("❌ #camera tidak ditemukan");
        return;
    }

    let currentStream = null;
    let facingMode = "user";
    let switching = false;

    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    /* =====================================================
       MIRROR
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
       STOP KAMERA
       ===================================================== */

    function stopCamera() {

        if (currentStream) {

            currentStream.getTracks().forEach(track => {
                track.stop();
            });

            currentStream = null;
        }

        video.srcObject = null;
    }

    /* =====================================================
       BUKA KAMERA
       ===================================================== */

    async function startCamera() {

        if (switching) return;

        switching = true;

        try {

            console.log("📷 Membuka:", facingMode);

            stopCamera();

            let stream = null;

            /* ---------------------------------------------
               COBA KAMERA SESUAI ARAH
               --------------------------------------------- */

            try {

                stream =
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
                                ideal: 30
                            }
                        },
                        audio: false
                    });

            } catch (error) {

                console.warn(
                    "⚠️ Mode kamera gagal, mencoba kamera default"
                );

                /* -----------------------------------------
                   FALLBACK
                   ----------------------------------------- */

                stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false
                    });
            }

            currentStream = stream;

            video.srcObject = stream;

            updateMirror();

            /* Tunggu video siap */
            await new Promise(resolve => {

                if (video.readyState >= 2) {
                    resolve();
                    return;
                }

                video.onloadedmetadata = () => {
                    resolve();
                };

            });

            await video.play();

            console.log("✅ KAMERA AKTIF");

            console.log(
                "📐 Resolusi:",
                video.videoWidth,
                "x",
                video.videoHeight
            );

        } catch (error) {

            console.error(
                "❌ KAMERA TIDAK BISA DIBUKA:",
                error.name,
                error.message
            );

        } finally {

            switching = false;
        }
    }

    /* =====================================================
       PINDAH KAMERA
       ===================================================== */

    if (flipButton) {

        flipButton.addEventListener(
            "click",
            async () => {

                if (switching) return;

                facingMode =
                    facingMode === "user"
                        ? "environment"
                        : "user";

                console.log(
                    "🔄 Pindah:",
                    facingMode
                );

                await startCamera();
            }
        );

    }

    /* =====================================================
       MENU
       ===================================================== */

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                let roomPanel =
                    document.getElementById("roomPanel");

                if (roomPanel) {

                    roomPanel.remove();
                    return;
                }

                roomPanel =
                    document.createElement("div");

                roomPanel.id = "roomPanel";

                roomPanel.innerHTML = `
                    <div class="room-title">
                        Room
                    </div>

                    <div class="room-live">
                        Live Host
                    </div>

                    <div class="room-subtitle">
                        Pilih jumlah layar berbagi
                    </div>

                    <div class="room-options">

                        <button class="room-option" data-room="2">2</button>
                        <button class="room-option" data-room="3">3</button>
                        <button class="room-option" data-room="4">4</button>
                        <button class="room-option" data-room="5">5</button>
                        <button class="room-option" data-room="6">6</button>
                        <button class="room-option" data-room="7">7</button>
                        <button class="room-option" data-room="8">8</button>
                        <button class="room-option" data-room="9">9</button>

                    </div>
                `;

                document
                    .getElementById("liveApp")
                    .appendChild(roomPanel);

                roomPanel
                    .querySelectorAll(".room-option")
                    .forEach(button => {

                        button.addEventListener(
                            "click",
                            () => {

                                roomPanel
                                    .querySelectorAll(
                                        ".room-option"
                                    )
                                    .forEach(btn => {
                                        btn.classList.remove(
                                            "selected"
                                        );
                                    });

                                button.classList.add(
                                    "selected"
                                );

                                console.log(
                                    "🎥 Room:",
                                    button.dataset.room
                                );
                            }
                        );

                    });

            }
        );
    }

    /* =====================================================
       CEK SUPPORT
       ===================================================== */

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        console.error(
            "❌ getUserMedia tidak didukung browser"
        );

        return;
    }

    /* =====================================================
       MULAI KAMERA
       ===================================================== */

    await startCamera();

    /* =====================================================
       CLEANUP
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {
            stopCamera();
        }
    );

});
