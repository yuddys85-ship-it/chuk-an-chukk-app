"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE MENU
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("📋 CHUK AN CHUKK LIVE MENU START");


    /* =====================================================
       ELEMENT
    ===================================================== */

    const menuButton =
        document.getElementById("menuButton");

    const roomPanel =
        document.getElementById("roomPanel");

    const liveApp =
        document.getElementById("liveApp");

    const profile =
        document.getElementById("liveUserDisplay");

    const avatar =
        document.getElementById("liveUserAvatar");

    const username =
        document.getElementById("liveUserName");

    const roomId =
        document.getElementById("liveRoomDisplay");


    /* =====================================================
       CEK ELEMENT
    ===================================================== */

    if (!menuButton) {

        console.error(
            "❌ menuButton tidak ditemukan di live.html"
        );

        return;
    }

    if (!roomPanel) {

        console.error(
            "❌ roomPanel tidak ditemukan di live.html"
        );

        return;
    }

    if (!liveApp) {

        console.error(
            "❌ liveApp tidak ditemukan di live.html"
        );

        return;
    }


    /* =====================================================
       PROFIL
    ===================================================== */

    if (profile) {

        profile.style.display = "flex";
        profile.style.alignItems = "center";
        profile.style.gap = "8px";

    }

    if (avatar) {

        avatar.style.display = "block";
        avatar.style.objectFit = "cover";

    }

    if (username) {

        username.style.display = "block";
        username.style.whiteSpace = "nowrap";

    }


    /* =====================================================
       ROOM ID
    ===================================================== */

    if (roomId) {

        roomId.style.background = "transparent";
        roomId.style.border = "none";
        roomId.style.boxShadow = "none";

    }


    /* =====================================================
       FUNGSI MENU
    ===================================================== */

    function openMenu() {

        roomPanel.hidden = false;

        roomPanel.style.display = "block";

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        console.log("📖 MENU DIBUKA");

    }


    function closeMenu() {

        roomPanel.hidden = true;

        roomPanel.style.display = "none";

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        console.log("📕 MENU DITUTUP");

    }


    function toggleMenu(event) {

        event.preventDefault();
        event.stopPropagation();

        if (
            roomPanel.hidden ||
            roomPanel.style.display === "none"
        ) {

            openMenu();

        } else {

            closeMenu();

        }

    }


    /* =====================================================
       TOMBOL MENU
    ===================================================== */

    menuButton.addEventListener(
        "click",
        toggleMenu
    );


    /* =====================================================
       SENTUH MENU
    ===================================================== */

    menuButton.addEventListener(
        "touchend",
        (event) => {

            event.preventDefault();
            event.stopPropagation();

            if (
                roomPanel.hidden ||
                roomPanel.style.display === "none"
            ) {

                openMenu();

            } else {

                closeMenu();

            }

        },
        {
            passive: false
        }
    );


    /* =====================================================
       KLIK DI LUAR MENU
    ===================================================== */

    document.addEventListener(
        "click",
        (event) => {

            if (roomPanel.hidden) {
                return;
            }

            const insidePanel =
                event.target.closest("#roomPanel");

            const clickedButton =
                event.target.closest("#menuButton");

            if (
                insidePanel ||
                clickedButton
            ) {
                return;
            }

            closeMenu();

        }
    );


    /* =====================================================
       NAMA ROOM
    ===================================================== */

    let roomName =
        document.getElementById(
            "liveRoomNameDisplay"
        );


    if (!roomName) {

        roomName =
            document.createElement("div");

        roomName.id =
            "liveRoomNameDisplay";

        liveApp.appendChild(
            roomName
        );

    }


    /* =====================================================
       STYLE NAMA ROOM
    ===================================================== */

    roomName.style.position =
        "fixed";

    roomName.style.background =
        "transparent";

    roomName.style.border =
        "none";

    roomName.style.boxShadow =
        "none";

    roomName.style.color =
        "#fff";

    roomName.style.fontSize =
        "12px";

    roomName.style.fontWeight =
        "600";

    roomName.style.lineHeight =
        "18px";

    roomName.style.padding =
        "0";

    roomName.style.margin =
        "0";

    roomName.style.textShadow =
        "0 2px 5px rgba(0,0,0,.9)";

    roomName.style.zIndex =
        "99999";


    /* =====================================================
       POSISI NAMA ROOM
    ===================================================== */

    function positionRoomName() {

        if (!roomId || !roomName) {
            return;
        }

        const rect =
            roomId.getBoundingClientRect();

        roomName.style.left =
            `${rect.left}px`;

        roomName.style.top =
            `${rect.bottom + 2}px`;

    }


    /* =====================================================
       UPDATE NAMA ROOM
    ===================================================== */

    function updateRoomName() {

        const name =
            window.liveRoomName ||
            window.CHUK_LIVE_ROOM_NAME ||
            "";

        if (name) {

            roomName.textContent =
                name;

            roomName.style.display =
                "block";

        } else {

            roomName.textContent =
                "";

            roomName.style.display =
                "none";

        }

        positionRoomName();

    }


    /* =====================================================
       EVENT ROOM
    ===================================================== */

    window.addEventListener(
        "chuk-room-created",
        (event) => {

            const data =
                event.detail || {};

            if (data.name) {

                window.liveRoomName =
                    data.name;

                window.CHUK_LIVE_ROOM_NAME =
                    data.name;

            }

            updateRoomName();

        }
    );


    /* =====================================================
       PANTAU ROOM ID
    ===================================================== */

    if (roomId) {

        const observer =
            new MutationObserver(() => {

                updateRoomName();

            });

        observer.observe(
            roomId,
            {
                childList: true,
                characterData: true,
                subtree: true
            }
        );

    }


    /* =====================================================
       RESPONSIVE
    ===================================================== */

    window.addEventListener(
        "resize",
        positionRoomName
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
       START
    ===================================================== */

    closeMenu();

    updateRoomName();


    console.log(
        "✅ CHUK AN CHUKK LIVE MENU READY"
    );

});
