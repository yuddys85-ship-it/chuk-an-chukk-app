"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE MENU
   NAMA ROOM PALING ATAS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const liveApp = document.getElementById("liveApp");
    const menuButton = document.getElementById("menuButton");

    if (!liveApp || !menuButton) {
        console.error("❌ Live Menu: elemen tidak ditemukan");
        return;
    }

    menuButton.addEventListener("click", () => {

        /* =================================================
           CEK PANEL SUDAH ADA
           ================================================= */

        let roomPanel =
            document.getElementById("roomPanel");

        /* =================================================
           TUTUP PANEL
           ================================================= */

        if (roomPanel) {
            roomPanel.remove();
            return;
        }

        /* =================================================
           BUAT PANEL
           ================================================= */

        roomPanel = document.createElement("div");

        roomPanel.id = "roomPanel";

        roomPanel.innerHTML = `

            <!-- =========================================
                 NAMA ROOM — PALING ATAS
                 ========================================= -->

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

            <!-- =========================================
                 ROOM
                 ========================================= -->

            <div class="room-title">
                Room
            </div>

            <div class="room-live">
                Live Host
            </div>

            <div class="room-subtitle">
                Pilih jumlah layar berbagi
            </div>

            <!-- =========================================
                 PILIHAN ROOM 2 — 9
                 ========================================= -->

            <div class="room-options">

                <button
                    class="room-option"
                    type="button"
                    data-room="2"
                >
                    2
                </button>

                <button
                    class="room-option"
                    type="button"
                    data-room="3"
                >
                    3
                </button>

                <button
                    class="room-option"
                    type="button"
                    data-room="4"
                >
                    4
                </button>

                <button
                    class="room-option"
                    type="button"
                    data-room="5"
                >
                    5
                </button>

                <button
                    class="room-option"
                    type="button"
                    data-room="6"
                >
                    6
                </button>

                <button
                    class="room-option"
                    type="button"
                    data-room="7"
                >
                    7
                </button>

                <button
                    class="room-option"
                    type="button"
                    data-room="8"
                >
                    8
                </button>

                <button
                    class="room-option"
                    type="button"
                    data-room="9"
                >
                    9
                </button>

            </div>

        `;

        liveApp.appendChild(roomPanel);

        /* =================================================
           INPUT NAMA ROOM
           ================================================= */

        const roomNameInput =
            roomPanel.querySelector("#roomNameInput");

        if (roomNameInput) {

            roomNameInput.focus();

            roomNameInput.addEventListener(
                "input",
                () => {

                    const roomName =
                        roomNameInput.value.trim();

                    console.log(
                        "🏠 Nama Room:",
                        roomName
                    );

                }
            );
        }

        /* =================================================
           TOMBOL ROOM
           ================================================= */

        const roomButtons =
            roomPanel.querySelectorAll(".room-option");

        roomButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    /* Hapus pilihan sebelumnya */

                    roomButtons.forEach(btn => {
                        btn.classList.remove("selected");
                    });

                    /* Pilih room */

                    button.classList.add("selected");

                    const roomNumber =
                        Number(button.dataset.room);

                    const roomName =
                        roomNameInput
                            ? roomNameInput.value.trim()
                            : "";

                    console.log(
                        "🎥 Jumlah layar:",
                        roomNumber
                    );

                    console.log(
                        "🏠 Nama Room:",
                        roomName || "Tanpa nama"
                    );

                    /* Simpan sementara */

                    window.liveRoom = {
                        name: roomName,
                        screens: roomNumber
                    };

                }
            );

        });

    });

});
