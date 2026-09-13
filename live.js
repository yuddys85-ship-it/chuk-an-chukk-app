"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE CAMERA + ROOM MENU
   NAMA ROOM TAMPIL DI ATAS KIRI
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    const video = document.getElementById("camera");
    const flipButton = document.getElementById("flipCameraButton");
    const menuButton = document.getElementById("menuButton");
    const liveApp = document.getElementById("liveApp");

    if (!video || !liveApp) {
        console.error("❌ Elemen Live tidak ditemukan");
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
       NAMA ROOM DI LAYAR
       ===================================================== */

    const liveRoomDisplay =
        document.createElement("div");

    liveRoomDisplay.id = "liveRoomDisplay";

    liveRoomDisplay.textContent = "";

    liveApp.appendChild(liveRoomDisplay);

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
       STOP CAMERA
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
       START CAMERA
       ===================================================== */

    async function startCamera() {

        if (switching) return;

        switching = true;

        try {

            console.log(
                "📷 Membuka:",
                facingMode
            );

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
       MENU
       ===================================================== */

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                console.log("☰ MENU DITEKAN");

                let roomPanel =
                    document.getElementById("roomPanel");

                /* =========================================
                   TUTUP MENU
                   ========================================= */

                if (roomPanel) {

                    roomPanel.remove();

                    return;
                }

                /* =========================================
                   BUAT PANEL
                   ========================================= */

                roomPanel =
                    document.createElement("div");

                roomPanel.id = "roomPanel";

                roomPanel.innerHTML = `

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

                /* =========================================
                   INPUT NAMA ROOM
                   ========================================= */

                const roomNameInput =
                    roomPanel.querySelector(
                        "#roomNameInput"
                    );

                if (roomNameInput) {

                    roomNameInput.value =
                        window.liveRoom.name || "";

                    roomNameInput.addEventListener(
                        "input",
                        () => {

                            const name =
                                roomNameInput.value.trim();

                            window.liveRoom.name =
                                name;

                            /* Tampilkan di layar */

                            liveRoomDisplay.textContent =
                                name;

                            console.log(
                                "🏠 Nama Room:",
                                name
                            );
                        }
                    );
                }

                /* =========================================
                   TOMBOL ROOM 2–9
                   ========================================= */

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

                            window.liveRoom.screens =
                                screens;

                            console.log(
                                "🎥 Jumlah layar:",
                                screens
                            );

                            console.log(
                                "🏠 Nama Room:",
                                window.liveRoom.name ||
                                "Tanpa nama"
                            );
                        }
                    );

                });

                /* =========================================
                   ROOM DEFAULT 2
                   ========================================= */

                const defaultRoom =
                    roomPanel.querySelector(
                        '[data-room="2"]'
                    );

                if (defaultRoom) {
                    defaultRoom.classList.add(
                        "selected"
                    );
                }

            }
        );
    }

    /* =====================================================
       CAMERA SUPPORT
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
       START
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

/* =========================================================
   USER PROFILE DI LIVE
   ========================================================= */

#liveUserDisplay {

    position: fixed !important;

    top: 18px !important;
    left: 18px !important;

    display: flex !important;

    align-items: center !important;

    gap: 9px !important;

    max-width: 60vw !important;

    padding: 4px 10px 4px 4px !important;

    border-radius: 28px !important;

    background: rgba(0,0,0,0.45) !important;

    color: #fff !important;

    z-index: 99998 !important;

    pointer-events: none !important;

    backdrop-filter: blur(8px) !important;

    -webkit-backdrop-filter: blur(8px) !important;
}


/* =========================================================
   FOTO USER
   ========================================================= */

#liveUserAvatar {

    width: 42px !important;
    height: 42px !important;

    border-radius: 50% !important;

    object-fit: cover !important;

    display: block !important;

    background: #222 !important;

    border: 2px solid rgba(255,255,255,0.9) !important;

    flex-shrink: 0 !important;
}


/* =========================================================
   NAMA USER
   ========================================================= */

#liveUserName {

    max-width: 40vw !important;

    overflow: hidden !important;

    white-space: nowrap !important;

    text-overflow: ellipsis !important;

    font-size: 15px !important;

    font-weight: 700 !important;

    color: #fff !important;
}


/* =========================================================
   JARAK DENGAN TOMBOL ATAS
   ========================================================= */

.menu-button,
.flip-camera-button {

    z-index: 99999 !important;
}


/* =========================================================
   HP KECIL
   ========================================================= */

@media (max-width: 380px) {

    #liveUserDisplay {

        left: 10px !important;

        top: 14px !important;
    }

    #liveUserAvatar {

        width: 38px !important;
        height: 38px !important;
    }

    #liveUserName {

        font-size: 14px !important;
    }
}
