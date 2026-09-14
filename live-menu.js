"use strict";

/*
=========================================================
 CHUK AN CHUKK
 LIVE MENU
=========================================================

 Fungsi:
 - Menata tampilan profil
 - Nama user sejajar dengan foto
 - ID room di bawah nama user
 - Nama room di bawah ID room
 - Tidak membuat kamera
 - Tidak membuat room baru
 - Tidak mengganggu WebRTC / Supabase
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    console.log("📋 CHUK AN CHUKK LIVE MENU START");

    /*
    =====================================================
    ELEMENT
    =====================================================
    */

    const profile =
        document.getElementById("liveUserDisplay");

    const avatar =
        document.getElementById("liveUserAvatar");

    const username =
        document.getElementById("liveUserName");

    const roomId =
        document.getElementById("liveRoomDisplay");

    /*
    =====================================================
    PROFIL
    =====================================================
    */

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

    /*
    =====================================================
    ROOM ID
    =====================================================
    */

    if (roomId) {

        roomId.style.background = "transparent";
        roomId.style.border = "none";
        roomId.style.boxShadow = "none";

    }

    /*
    =====================================================
    BUAT TEMPAT NAMA ROOM
    =====================================================
    */

    let roomName =
        document.getElementById(
            "liveRoomNameDisplay"
        );

    if (!roomName) {

        roomName =
            document.createElement("div");

        roomName.id =
            "liveRoomNameDisplay";

        roomName.textContent = "";

        document.body.appendChild(
            roomName
        );
    }

    /*
    =====================================================
    STYLE NAMA ROOM
    =====================================================
    */

    roomName.style.position = "fixed";
    roomName.style.background = "transparent";
    roomName.style.border = "none";
    roomName.style.boxShadow = "none";

    roomName.style.color = "#fff";
    roomName.style.fontSize = "12px";
    roomName.style.fontWeight = "600";

    roomName.style.lineHeight = "18px";
    roomName.style.padding = "0";
    roomName.style.margin = "0";

    roomName.style.textShadow =
        "0 2px 5px rgba(0,0,0,.9)";

    roomName.style.zIndex = "99999";

    /*
    =====================================================
    POSISI NAMA ROOM
    DI BAWAH ID ROOM
    =====================================================
    */

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

    /*
    =====================================================
    AMBIL NAMA ROOM
    =====================================================
    */

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

            roomName.textContent = "";

            roomName.style.display =
                "none";

        }

        positionRoomName();
    }

    /*
    =====================================================
    UPDATE ROOM
    =====================================================
    */

    window.addEventListener(
        "chuk-room-created",
        event => {

            const data =
                event.detail || {};

            if (data.name) {

                window.liveRoomName =
                    data.name;

            }

            updateRoomName();

        }
    );

    /*
    =====================================================
    PANTAU PERUBAHAN ROOM
    =====================================================
    */

    const observer =
        new MutationObserver(() => {

            updateRoomName();

        });

    if (roomId) {

        observer.observe(
            roomId,
            {
                childList: true,
                characterData: true,
                subtree: true
            }
        );

    }

    /*
    =====================================================
    RESPONSIVE
    =====================================================
    */

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

    /*
    =====================================================
    START
    =====================================================
    */

    updateRoomName();

    console.log(
        "✅ LIVE MENU SIAP"
    );

});
