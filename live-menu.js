"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE MENU — STABLE VERSION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("📋 CHUK AN CHUKK LIVE MENU START");

    const menuButton =
        document.getElementById("menuButton");

    const roomPanel =
        document.getElementById("roomPanel");

    const liveApp =
        document.getElementById("liveApp");

    const roomId =
        document.getElementById("liveRoomDisplay");


    /* =====================================================
       CEK
    ===================================================== */

    if (!menuButton) {
        console.error("❌ menuButton tidak ditemukan");
        return;
    }

    if (!roomPanel) {
        console.error("❌ roomPanel tidak ditemukan");
        return;
    }

    if (!liveApp) {
        console.error("❌ liveApp tidak ditemukan");
        return;
    }


    /* =====================================================
       MENU STATE
    ===================================================== */

    let menuOpen = false;


    /* =====================================================
       BUKA MENU
    ===================================================== */

    function openMenu() {

        menuOpen = true;

        roomPanel.hidden = false;

        roomPanel.style.setProperty(
            "display",
            "block",
            "important"
        );

        roomPanel.style.setProperty(
            "visibility",
            "visible",
            "important"
        );

        roomPanel.style.setProperty(
            "opacity",
            "1",
            "important"
        );

        roomPanel.style.setProperty(
            "pointer-events",
            "auto",
            "important"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        console.log("📖 MENU DIBUKA");
    }


    /* =====================================================
       TUTUP MENU
    ===================================================== */

    function closeMenu() {

        menuOpen = false;

        roomPanel.hidden = true;

        roomPanel.style.setProperty(
            "display",
            "none",
            "important"
        );

        roomPanel.style.setProperty(
            "visibility",
            "hidden",
            "important"
        );

        roomPanel.style.setProperty(
            "opacity",
            "0",
            "important"
        );

        roomPanel.style.setProperty(
            "pointer-events",
            "none",
            "important"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        console.log("📕 MENU DITUTUP");
    }


    /* =====================================================
       TOGGLE
    ===================================================== */

    function toggleMenu(event) {

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (menuOpen) {
            closeMenu();
        } else {
            openMenu();
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
       KLIK DI LUAR
    ===================================================== */

    document.addEventListener(
        "click",
        (event) => {

            if (!menuOpen) {
                return;
            }

            if (
                event.target.closest("#roomPanel") ||
                event.target.closest("#menuButton")
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

        liveApp.appendChild(roomName);
    }


    /* =====================================================
       STYLE NAMA ROOM
    ===================================================== */

    roomName.style.position = "fixed";
    roomName.style.background = "transparent";
    roomName.style.border = "none";
    roomName.style.boxShadow = "none";
    roomName.style.color = "#fff";
    roomName.style.fontSize = "13px";
    roomName.style.fontWeight = "700";
    roomName.style.lineHeight = "18px";
    roomName.style.padding = "0";
    roomName.style.margin = "0";
    roomName.style.textShadow =
        "0 2px 6px rgba(0,0,0,.95)";
    roomName.style.zIndex = "99999";


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
