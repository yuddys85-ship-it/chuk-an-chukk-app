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

        let roomPanel = document.getElementById("roomPanel");

        /* =================================================
           TUTUP MENU
           ================================================= */

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

            <!-- PILIHAN ROOM -->

            <div class="room-options">

                <button
                    class="room-option"
                    data-room="2"
                    type="button"
                >2</button>

                <button
                    class="room-option"
                    data-room="3"
                    type="button"
                >3</button>

                <button
                    class="room-option"
                    data-room="4"
                    type="button"
                >4</button>

                <button
                    class="room-option"
                    data-room="5"
                    type="button"
                >5</button>

                <button
                    class="room-option"
                    data-room="6"
                    type="button"
                >6</button>

                <button
                    class="room-option"
                    data-room="7"
                    type="button"
                >7</button>

                <button
                    class="room-option"
                    data-room="8"
                    type="button"
                >8</button>

                <button
                    class="room-option"
                    data-room="9"
                    type="button"
                >9</button>

            </div>
        `;

        liveApp.appendChild(roomPanel);

        /* =================================================
           INPUT NAMA ROOM
           ================================================= */

        const roomNameInput =
            document.getElementById("roomNameInput");

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
           PILIH ROOM
           ================================================= */

        const roomButtons =
            roomPanel.querySelectorAll(".room-option");

        roomButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    roomButtons.forEach(btn => {
                        btn.classList.remove("selected");
                    });

                    button.classList.add("selected");

                    const roomNumber =
                        button.dataset.room;

                    const roomName =
                        roomNameInput
                            ? roomNameInput.value.trim()
                            : "";

                    console.log(
                        "🎥 ROOM:",
                        roomNumber
                    );

                    console.log(
                        "🏠 NAMA ROOM:",
                        roomName || "Tanpa nama"
                    );
                }
            );
        });

    });

});
