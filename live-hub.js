"use strict";

/*
=========================================================
 CHUK AN CHUKK
 LIVE HUB
 HALAMAN 1 = LIVE FEED
 HALAMAN 2 = LIVE VIEWER
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    const hub = document.getElementById("liveHub");
    const feed = document.getElementById("liveFeed");

    const viewerContainer =
        document.getElementById("viewerContainer");

    const viewerTitle =
        document.getElementById("viewerTitle");

    const viewerRoom =
        document.getElementById("viewerRoom");

    const openViewerButton =
        document.getElementById("openViewerButton");

    const backButton =
        document.getElementById("backToFeedButton");

    const startLiveButton =
        document.getElementById("startLiveButton");

    if (!hub || !feed) {
        console.error("❌ Live Hub tidak ditemukan");
        return;
    }

    /* =====================================================
       SUPABASE
    ===================================================== */

    const SUPABASE_URL =
        "https://aoaqvbrxgtfuvyiscpic.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Yjdm78LEqtijgVfB160byA_RHsml_Ga";

    let supabaseClient = null;

    if (window.supabase) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        console.log("✅ Supabase Live Hub siap");

    } else {

        console.warn(
            "⚠️ Supabase library belum tersedia"
        );

        showEmpty(
            "LIVE belum dapat dimuat"
        );
    }


    /* =====================================================
       STATE
    ===================================================== */

    let selectedRoom = "";
    let selectedName = "";

    let touchStartX = 0;
    let touchStartY = 0;

    let touchEndX = 0;
    let touchEndY = 0;

    let isDragging = false;


    /* =====================================================
       BUKA HALAMAN VIEWER
    ===================================================== */

    function showViewer(roomId, name) {

        if (!roomId) return;

        selectedRoom = roomId;
        selectedName = name || "LIVE";

        if (viewerTitle) {
            viewerTitle.textContent =
                selectedName;
        }

        if (viewerRoom) {
            viewerRoom.textContent =
                roomId;
        }

        hub.classList.add("viewer-active");

        /*
        -----------------------------------------------------
        Jangan langsung membuat iframe ketika halaman
        pertama dibuka.

        iframe hanya dibuat setelah user memilih LIVE.
        -----------------------------------------------------
        */

        createViewer();

        console.log(
            "▶️ Membuka LIVE:",
            roomId
        );
    }


    /* =====================================================
       BUAT VIEWER
    ===================================================== */

    function createViewer() {

        if (!viewerContainer || !selectedRoom) {
            return;
        }

        /*
        Hapus placeholder
        */

        const placeholder =
            viewerContainer.querySelector(
                ".viewer-placeholder"
            );

        if (placeholder) {
            placeholder.remove();
        }

        /*
        Jangan membuat iframe dua kali
        */

        const oldFrame =
            viewerContainer.querySelector(
                "#chukLiveViewerFrame"
            );

        if (oldFrame) {
            oldFrame.remove();
        }

        /*
        -----------------------------------------------------
        LIVE WATCH
        -----------------------------------------------------
        */

        const iframe =
            document.createElement("iframe");

        iframe.id =
            "chukLiveViewerFrame";

        iframe.src =
            "live-watch.html?room=" +
            encodeURIComponent(selectedRoom);

        iframe.allow =
            "camera; microphone; autoplay; fullscreen; display-capture";

        iframe.allowFullscreen = true;

        iframe.setAttribute(
            "allow",
            "autoplay; fullscreen; picture-in-picture"
        );

        iframe.setAttribute(
            "title",
            "Chuk an Chukk Live"
        );

        viewerContainer.appendChild(iframe);
    }


    /* =====================================================
       KEMBALI KE FEED
    ===================================================== */

    function showFeed() {

        hub.classList.remove(
            "viewer-active"
        );

        /*
        Hapus iframe agar koneksi viewer
        tidak tetap berjalan di belakang.
        */

        const iframe =
            viewerContainer?.querySelector(
                "#chukLiveViewerFrame"
            );

        if (iframe) {
            iframe.src = "about:blank";

            setTimeout(() => {
                iframe.remove();
            }, 100);
        }

        selectedRoom = "";
        selectedName = "";

        console.log(
            "◀️ Kembali ke LIVE Feed"
        );
    }


    /* =====================================================
       EVENT KARTU LIVE
    ===================================================== */

    function attachCardEvents() {

        const cards =
            feed.querySelectorAll(
                ".live-card"
            );

        cards.forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const room =
                        card.dataset.room;

                    const name =
                        card.dataset.name ||
                        "LIVE";

                    showViewer(
                        room,
                        name
                    );
                }
            );
        });
    }


    /* =====================================================
       TAMPILKAN LIVE KOSONG
    ===================================================== */

    function showEmpty(message) {

        feed.innerHTML = `
            <div class="live-status">
                ${escapeHTML(message)}
            </div>
        `;
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       RENDER LIVE CARD
    ===================================================== */

    function renderLiveCard(room) {

        const roomId =
            room.room_id ||
            room.room ||
            room.id;

        if (!roomId) {
            return "";
        }

        const name =
            room.room_name ||
            room.name ||
            room.username ||
            room.display_name ||
            "CHUK LIVE";

        const avatar =
            room.avatar
