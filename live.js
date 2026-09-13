"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE CAMERA + ROOM MENU
   FRONT ↔ BACK
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const video = document.getElementById("camera");
    const flipButton = document.getElementById("flipCameraButton");
    const menuButton = document.getElementById("menuButton");
    const liveApp = document.getElementById("liveApp");

    if (!video) {
        console.error("❌ #camera tidak ditemukan");
        return;
    }

    if (!liveApp) {
        console.error("❌ #liveApp tidak ditemukan");
        return;
    }

    let currentStream = null;
    let facingMode = "user";
    let switching = false;

    /* =====================================================
       DATA ROOM
       ===================================================== */

    window.liveRoom = {
        name: "",
        screens: 2
    };

    /* =====================================================
       VIDEO
       ===================================================== */

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

                stream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: false
                    });
            }

            currentStream = stream;

            video.srcObject = stream;

            updateMirror();

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
       MENU ROOM
       ===================================================== */

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                console.log("☰ MENU DITEKAN");

                let roomPanel =
                    document.getElementById("roomPanel");

                /* -----------------------------------------
                   TUTUP MENU
                   ----------------------------------------- */

                if (roomPanel) {

                    roomPanel.remove();

                    return;
                }

                /* -----------------------------------------
                   BUAT MENU
                   ----------------------------------------- */

                roomPanel =
                    document.createElement("div");

                roomPanel.id = "roomPanel";

                roomPanel.innerHTML = `

                    <!-- NAMA ROOM PALING ATAS -->

                    <div class="room-name-label">
                        Nama Room
                    </div>

                    <input
                        id="roomNameInput"
                        class="room-name-input"
                        type="text"
                        maxlength="40"
                        placeholder="Masukkan nama room"
                        autocomplete="off"
                    >

                    <!-- ROOM -->

                    <div class="room-title">
                        Room
                    </div>

                    <div class="room-live">
                        Live Host
                    </div>

                    <div class="room-subtitle">
                        Pilih jumlah layar berbagi
                    </div>

                    <!-- ROOM 2 - 9 -->

                    <div class="room-options">

                        <button
                            class="room-option"
                            type="button"
                            data-room="2"
                        >2</button>

                        <button
                            class="room-option"
                            type="button"
                            data-room="3"
                        >3</button>

                        <button
                            class="room-option"
                            type="button"
                            data-room="4"
                        >4</button>

                        <button
                            class="room-option"
                            type="button"
                            data-room="5"
                        >5</button>

                        <button
                            class="room-option"
                            type="button"
                            data-room="6"
                        >6</button>

                        <button
                            class="room-option"
                            type="button"
                            data-room="7"
                        >7</button>

                        <button
                            class="room-option"
                            type="button"
                            data-room="8"
                        >8</button>

                        <button
                            class="room-option"
                            type="button"
                            data-room="9"
                        >9</button>

                    </div>

                `;

                liveApp.appendChild(roomPanel);

                /* -----------------------------------------
                   INPUT NAMA ROOM
                   ----------------------------------------- */

                const roomNameInput =
                    roomPanel.querySelector(
                        "#roomNameInput"
                    );

                if (roomNameInput) {

                    roomNameInput.value =
                        window.liveRoom.name || "";

                    roomNameInput.focus();

                    roomNameInput.addEventListener(
                        "input",
                        () => {

                            window.liveRoom.name =
                                roomNameInput.value.trim();

                            console.log(
                                "🏠 Nama Room:",
                                window.liveRoom.name
                            );

                        }
                    );
                }

                /* -----------------------------------------
                   TOMBOL ROOM
                   ----------------------------------------- */

                const roomButtons =
                    roomPanel.querySelectorAll(
                        ".room-option"
                    );

                roomButtons.forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            roomButtons.forEach(btn => {

                                btn.classList.remove(
                                    "selected"
                                );

                            });

                            button.classList.add(
                                "selected"
                            );

                            const screens =
                                Number(
                                    button.dataset.room
                                );

                            const roomName =
                                roomNameInput
                                    ? roomNameInput.value.trim()
                                    : "";

                            window.liveRoom = {
                                name: roomName,
                                screens: screens
                            };

                            console.log(
                                "🏠 Nama Room:",
                                roomName || "Tanpa nama"
                            );

                            console.log(
                                "🎥 Jumlah layar:",
                                screens
                            );

                            console.log(
                                "🏠 DATA ROOM:",
                                window.liveRoom
                            );

                        }
                    );

                });

                /* -----------------------------------------
                   DEFAULT ROOM 2
                   ----------------------------------------- */

                const defaultRoom =
                    roomPanel.querySelector(
                        '[data-room="2"]'
                    );

                if (defaultRoom) {
                    defaultRoom.classList.add("selected");
                }

                console.log(
                    "✅ Room Menu dibuka"
                );

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
