"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE MENU — FIX BUTTON
   ========================================================= */

(function () {

    function initLiveMenu() {

        const liveApp = document.getElementById("liveApp");
        const menuButton = document.getElementById("menuButton");

        if (!liveApp || !menuButton) {
            console.error("❌ Live Menu: elemen tidak ditemukan");
            return;
        }

        console.log("✅ Live Menu aktif");

        /* Pastikan tombol bisa ditekan */
        menuButton.type = "button";
        menuButton.style.pointerEvents = "auto";

        menuButton.onclick = function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log("☰ MENU DITEKAN");

            /* =============================================
               JIKA PANEL SUDAH ADA → TUTUP
               ============================================= */

            const oldPanel =
                document.getElementById("roomPanel");

            if (oldPanel) {
                oldPanel.remove();

                console.log("❌ Room Menu ditutup");

                return;
            }

            /* =============================================
               BUAT PANEL
               ============================================= */

            const roomPanel =
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
                        type="button"
                        class="room-option"
                        data-room="2"
                    >2</button>

                    <button
                        type="button"
                        class="room-option"
                        data-room="3"
                    >3</button>

                    <button
                        type="button"
                        class="room-option"
                        data-room="4"
                    >4</button>

                    <button
                        type="button"
                        class="room-option"
                        data-room="5"
                    >5</button>

                    <button
                        type="button"
                        class="room-option"
                        data-room="6"
                    >6</button>

                    <button
                        type="button"
                        class="room-option"
                        data-room="7"
                    >7</button>

                    <button
                        type="button"
                        class="room-option"
                        data-room="8"
                    >8</button>

                    <button
                        type="button"
                        class="room-option"
                        data-room="9"
                    >9</button>

                </div>

            `;

            liveApp.appendChild(roomPanel);

            console.log("✅ Room Menu dibuka");

            /* =============================================
               INPUT NAMA ROOM
               ============================================= */

            const nameInput =
                document.getElementById("roomNameInput");

            if (nameInput) {

                nameInput.addEventListener(
                    "input",
                    function () {

                        const name =
                            this.value.trim();

                        window.liveRoomName = name;

                        console.log(
                            "🏠 Nama Room:",
                            name
                        );
                    }
                );
            }

            /* =============================================
               PILIH JUMLAH ROOM
               ============================================= */

            const roomButtons =
                roomPanel.querySelectorAll(".room-option");

            roomButtons.forEach(function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();
                        event.stopPropagation();

                        roomButtons.forEach(function (btn) {
                            btn.classList.remove("selected");
                        });

                        this.classList.add("selected");

                        const screens =
                            Number(this.dataset.room);

                        const name =
                            nameInput
                                ? nameInput.value.trim()
                                : "";

                        window.liveRoom = {
                            name: name,
                            screens: screens
                        };

                        console.log(
                            "🎥 Room:",
                            screens
                        );

                        console.log(
                            "🏠 Nama:",
                            name || "Tanpa nama"
                        );

                    }
                );

            });

        };

    }

    /* =====================================================
       JALANKAN
       ===================================================== */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initLiveMenu
        );

    } else {

        initLiveMenu();

    }

})();
