"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE MENU
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const liveApp = document.getElementById("liveApp");
    const menuButton = document.getElementById("menuButton");

    if (!liveApp || !menuButton) {
        console.error("❌ Live Menu: elemen tidak ditemukan");
        return;
    }

    /* =====================================================
       BUKA / TUTUP MENU
       ===================================================== */

    menuButton.addEventListener("click", () => {

        let roomPanel = document.getElementById("roomPanel");

        /* Jika sudah ada → tutup */
        if (roomPanel) {
            roomPanel.remove();
            return;
        }

        /* =================================================
           PANEL ROOM
           ================================================= */

        roomPanel = document.createElement("div");

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

                <button class="room-option" data-room="2">
                    2
                </button>

                <button class="room-option" data-room="3">
                    3
                </button>

                <button class="room-option" data-room="4">
                    4
                </button>

                <button class="room-option" data-room="5">
                    5
                </button>

                <button class="room-option" data-room="6">
                    6
                </button>

                <button class="room-option" data-room="7">
                    7
                </button>

                <button class="room-option" data-room="8">
                    8
                </button>

                <button class="room-option" data-room="9">
                    9
                </button>

            </div>
        `;

        liveApp.appendChild(roomPanel);

        /* =================================================
           PILIH ROOM
           ================================================= */

        const roomButtons =
            roomPanel.querySelectorAll(".room-option");

        roomButtons.forEach(button => {

            button.addEventListener("click", () => {

                /* Hapus pilihan sebelumnya */
                roomButtons.forEach(btn => {
                    btn.classList.remove("selected");
                });

                /* Pilih room */
                button.classList.add("selected");

                const roomNumber =
                    button.dataset.room;

                console.log(
                    "🎥 Room dipilih:",
                    roomNumber
                );

                /*
                 * Untuk sekarang hanya memilih jumlah layar.
                 *
                 * WebRTC / multi-host akan kita pasang
                 * setelah kamera dasar sudah stabil.
                 */

            });

        });

    });

});
