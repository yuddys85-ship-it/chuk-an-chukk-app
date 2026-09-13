"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE
   KAMERA STABIL + PROFILE USER + ROOM MENU
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const video =
        document.getElementById("camera");

    const flipButton =
        document.getElementById("flipCameraButton");

    const menuButton =
        document.getElementById("menuButton");

    const liveApp =
        document.getElementById("liveApp");


    if (!video || !liveApp) {

        console.error(
            "❌ Elemen Live tidak ditemukan"
        );

        return;
    }


    /* =====================================================
       PROFILE USER
       ===================================================== */

    function getUserProfile() {

        try {

            const saved =
                localStorage.getItem(
                    "chukUserProfile"
                );

            if (saved) {

                const profile =
                    JSON.parse(saved);

                return {

                    piUsername:
                        profile.piUsername || "",

                    displayName:
                        profile.displayName ||
                        profile.piUsername ||
                        "CHUK USER",

                    avatar:
                        profile.avatar ||
                        "assets/logo.png"
                };
            }

        } catch (error) {

            console.warn(
                "⚠️ Profil tidak bisa dibaca:",
                error
            );
        }


        return {

            piUsername: "",

            displayName: "CHUK USER",

            avatar: "assets/logo.png"
        };
    }


    /* =====================================================
       USER PROFILE DI LIVE
       ===================================================== */

    const userDisplay =
        document.createElement("div");

    userDisplay.id =
        "liveUserDisplay";


    userDisplay.innerHTML = `

        <img
            id="liveUserAvatar"
            src="assets/logo.png"
            alt="Foto Profil"
        >

        <span id="liveUserName">
            CHUK USER
        </span>

    `;


    liveApp.appendChild(
        userDisplay
    );


    /* =====================================================
       UPDATE PROFILE
       ===================================================== */

    function refreshLiveProfile() {

        const profile =
            getUserProfile();


        const avatar =
            document.getElementById(
                "liveUserAvatar"
            );


        const name =
            document.getElementById(
                "liveUserName"
            );


        /* ================================================
           NAMA
           ================================================ */

        if (name) {

            name.textContent =
                profile.displayName ||
                profile.piUsername ||
                "CHUK USER";
        }


        /* ================================================
           FOTO
           ================================================ */

        if (avatar) {

            avatar.src =
                profile.avatar ||
                "assets/logo.png";


            avatar.onerror = () => {

                avatar.src =
                    "assets/logo.png";
            };
        }


        console.log(
            "👤 PROFILE LIVE:",
            profile.displayName
        );

        console.log(
            "📷 FOTO PROFILE:",
            profile.avatar
        );
    }


    /* =====================================================
       JALANKAN SETELAH ELEMEN SUDAH DIBUAT
       ===================================================== */

    refreshLiveProfile();


    /* =====================================================
       CEK KEMBALI SAAT KEMBALI KE LIVE
       ===================================================== */

    window.addEventListener(
        "focus",
        () => {

            refreshLiveProfile();

        }
    );


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


    liveRoomDisplay.id =
        "liveRoomDisplay";


    liveRoomDisplay.textContent =
        "";


    liveApp.appendChild(
        liveRoomDisplay
    );


    /* =====================================================
       KAMERA
       ===================================================== */

    let currentStream = null;

    let facingMode = "user";

    let switching = false;


    video.autoplay = true;

    video.muted = true;

    video.playsInline = true;


    video.setAttribute(
        "autoplay",
        ""
    );

    video.setAttribute(
        "muted",
        ""
    );

    video.setAttribute(
        "playsinline",
        ""
    );


    /* =====================================================
       MIRROR
       ===================================================== */

    function updateMirror() {

        if (
            facingMode === "user"
        ) {

            video.style.transform =
                "scaleX(-1)";

        } else {

            video.style.transform =
                "scaleX(1)";
        }
    }


    /* =====================================================
       STOP CAMERA
       ===================================================== */

    function stopCamera() {

        if (currentStream) {

            currentStream
                .getTracks()
                .forEach(track => {

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
                "📷 Membuka kamera:",
                facingMode
            );


            stopCamera();


            const stream =
                await navigator
                    .mediaDevices
                    .getUserMedia({

                        video: {

                            facingMode: {

                                ideal:
                                    facingMode
                            },

                            width: {

                                ideal: 1280
                            },

                            height: {

                                ideal: 720
                            }

                        },

                        audio: false
                    });


            currentStream =
                stream;


            video.srcObject =
                stream;


            updateMirror();


            /* =============================================
               PLAY VIDEO
               ============================================= */

            try {

                await video.play();

            } catch (playError) {

                console.warn(
                    "⚠️ Autoplay ditolak:",
                    playError
                );


                const resumeVideo =
                    async () => {

                        try {

                            await video.play();

                        } catch (e) {

                            console.warn(e);
                        }
                    };


                document.addEventListener(
                    "click",
                    resumeVideo,
                    {
                        once: true
                    }
                );
            }


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
                "❌ KAMERA GAGAL:",
                error.name,
                error.message
            );


            if (
                error.name ===
                "NotAllowedError"
            ) {

                alert(
                    "Izin kamera belum diberikan. Izinkan akses kamera untuk CHUK AN CHUKK."
                );

            } else if (
                error.name ===
                "NotFoundError"
            ) {

                alert(
                    "Kamera tidak ditemukan di perangkat."
                );

            } else {

                alert(
                    "Kamera tidak dapat dibuka. Coba muat ulang halaman."
                );
            }

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

                console.log(
                    "☰ MENU DITEKAN"
                );


                let roomPanel =
                    document.getElementById(
                        "roomPanel"
                    );


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
                    document.createElement(
                        "div"
                    );


                roomPanel.id =
                    "roomPanel";


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


                liveApp.appendChild(
                    roomPanel
                );


                /* =========================================
                   NAMA ROOM
                   ========================================= */

                const input =
                    roomPanel.querySelector(
                        "#roomNameInput"
                    );


                if (input) {

                    input.value =
                        window.liveRoom.name;


                    input.addEventListener(
                        "input",
                        () => {

                            const name =
                                input.value
                                    .trim();


                            window.liveRoom.name =
                                name;


                            liveRoomDisplay
                                .textContent =
                                name;

                        }
                    );
                }


                /* =========================================
                   ROOM 2 - 9
                   ========================================= */

                const buttons =
                    roomPanel.querySelectorAll(
                        ".room-option"
                    );


                buttons.forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                buttons.forEach(
                                    b => {

                                        b.classList
                                            .remove(
                                                "selected"
                                            );
                                    }
                                );


                                button.classList
                                    .add(
                                        "selected"
                                    );


                                window.liveRoom
                                    .screens =
                                    Number(
                                        button
                                            .dataset
                                            .room
                                    );


                                console.log(
                                    "🎥 Jumlah layar:",
                                    window.liveRoom.screens
                                );

                            }
                        );
                    }
                );


                /* =========================================
                   DEFAULT ROOM
                   ========================================= */

                const defaultButton =
                    roomPanel.querySelector(
                        '[data-room="2"]'
                    );


                if (defaultButton) {

                    defaultButton.classList
                        .add(
                            "selected"
                        );
                }

            }
        );
    }


    /* =====================================================
       CEK CAMERA
       ===================================================== */

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        alert(
            "Browser tidak mendukung akses kamera."
        );

        return;
    }


    /* =====================================================
       START CAMERA
       ===================================================== */

    startCamera();


    /* =====================================================
       CLEANUP
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        stopCamera
    );

});
