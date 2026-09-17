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


        if (name) {

            name.textContent =
                profile.displayName ||
                profile.piUsername ||
                "CHUK USER";
        }


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


    refreshLiveProfile();


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
       ID ROOM DI LAYAR
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
       NAMA ROOM DI BAWAH ID ROOM
       ===================================================== */

    const liveRoomNameDisplay =
        document.createElement("div");

    liveRoomNameDisplay.id =
        "liveRoomNameDisplay";

    liveRoomNameDisplay.textContent =
        "";

    liveApp.appendChild(
        liveRoomNameDisplay
    );


    /* =====================================================
       STYLE NAMA ROOM
       ===================================================== */

    liveRoomNameDisplay.style.position =
        "fixed";

    liveRoomNameDisplay.style.background =
        "transparent";

    liveRoomNameDisplay.style.border =
        "none";

    liveRoomNameDisplay.style.boxShadow =
        "none";

    liveRoomNameDisplay.style.color =
        "#fff";

    liveRoomNameDisplay.style.fontSize =
        "12px";

    liveRoomNameDisplay.style.fontWeight =
        "600";

    liveRoomNameDisplay.style.lineHeight =
        "18px";

    liveRoomNameDisplay.style.padding =
        "0";

    liveRoomNameDisplay.style.margin =
        "0";

    liveRoomNameDisplay.style.display =
        "none";

    liveRoomNameDisplay.style.textShadow =
        "0 2px 5px rgba(0,0,0,.9)";

    liveRoomNameDisplay.style.zIndex =
        "99999";


    /* =====================================================
       POSISI NAMA ROOM
       ===================================================== */

    function positionRoomName() {

        const roomRect =
            liveRoomDisplay.getBoundingClientRect();

        liveRoomNameDisplay.style.left =
            `${roomRect.left}px`;

        liveRoomNameDisplay.style.top =
            `${roomRect.bottom + 1}px`;
    }


    /* =====================================================
       UPDATE NAMA ROOM
       ===================================================== */

    function updateRoomName() {

        const name =
            window.liveRoom.name.trim();

        liveRoomNameDisplay.textContent =
            name;

        if (name) {

            liveRoomNameDisplay.style.display =
                "block";

            positionRoomName();

        } else {

            liveRoomNameDisplay.style.display =
                "none";
        }
    }


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
       POSISI ULANG SAAT LAYAR BERUBAH
       ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (
                liveRoomNameDisplay.style.display !==
                "none"
            ) {

                positionRoomName();
            }

        }
    );


    window.addEventListener(
        "orientationchange",
        () => {

            setTimeout(
                positionRoomName,
                100
            );

        }
    );


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

/* =====================================================
   CHUK AN CHUKK LIVE
   GESTURE FINAL

   👈 Swipe kiri  = Kembali
   👉 Swipe kanan = Tidak melakukan apa-apa

   💬 Area komentar memiliki gesture sendiri.
===================================================== */

(() => {

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const app = document.getElementById("liveApp");

    if (!app) {
        console.warn("⚠️ liveApp tidak ditemukan");
        return;
    }


    /* =================================================
       MULAI GESER
    ================================================= */

    app.addEventListener("touchstart", (event) => {

        if (event.touches.length !== 1) {
            tracking = false;
            return;
        }

        const target = event.target;


        /* =================================================
           KOMENTAR PUNYA GESTURE SENDIRI
        ================================================= */

        if (
            target.closest("#liveCommentPanel")
        ) {
            tracking = false;
            return;
        }


        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;

        tracking = true;

    }, { passive: true });


    /* =================================================
       SELESAI GESER
    ================================================= */

    app.addEventListener("touchend", (event) => {

        if (!tracking) {
            return;
        }

        tracking = false;


        if (event.changedTouches.length !== 1) {
            return;
        }


        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;

        const deltaX = endX - startX;
        const deltaY = endY - startY;


        /* =================================================
           HANYA SWIPE KIRI YANG MENJADI BACK
        ================================================= */

        const swipeLeft =
            deltaX < -80 &&
            Math.abs(deltaX) > Math.abs(deltaY);


        if (!swipeLeft) {
            return;
        }


        /* =================================================
           INPUT / TEXTAREA TETAP AMAN
        ================================================= */

        const activeElement = document.activeElement;

        if (
            activeElement &&
            (
                activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA"
            )
        ) {
            return;
        }


        /* =================================================
           BACK
        ================================================= */

        console.log("👈 Swipe kiri → BACK");


        if (window.history.length > 1) {

            window.history.back();

        } else {

            window.location.href = "live-hub.html";

        }

    }, { passive: true });


    console.log("✅ CHUK AN CHUKK LIVE SWIPE READY");

})();
