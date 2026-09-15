"use strict";

/* =========================================================
   CHUK AN CHUKK — LIVE HUB
   PAGE 1 = LIVE FEED
   PAGE 2 = LIVE VIEWER
   NO CAMERA
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 CHUK AN CHUKK — LIVE HUB");

    const SUPABASE_URL =
        "https://aoaqvbrxgtfuvyiscpic.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_Yjdm78LEqtijgVfB160byA_RHsml_Ga";

    /* -----------------------------------------------------
       SUPABASE
       ----------------------------------------------------- */

    let supabaseClient = null;

    if (window.supabase) {
        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );
    }

    /* -----------------------------------------------------
       ELEMENT
       ----------------------------------------------------- */

    const liveHub = document.getElementById("liveHub");
    const liveFeed = document.getElementById("liveFeed");

    const startLiveButton =
        document.getElementById("startLiveButton");

    const backToFeedButton =
        document.getElementById("backToFeedButton");

    const viewerTitle =
        document.getElementById("viewerTitle");

    const viewerRoom =
        document.getElementById("viewerRoom");

    const openViewerButton =
        document.getElementById("openViewerButton");

    /* -----------------------------------------------------
       STATE
       ----------------------------------------------------- */

    let liveRooms = [];
    let selectedRoom = "";

    /* -----------------------------------------------------
       OPEN VIEWER
       ----------------------------------------------------- */

    function openViewer(roomId, title = "CHUK LIVE") {

        if (!roomId) {
            console.warn("⚠️ Room ID kosong");
            return;
        }

        selectedRoom = roomId;

        if (viewerTitle) {
            viewerTitle.textContent = title || "CHUK LIVE";
        }

        if (viewerRoom) {
            viewerRoom.textContent = roomId;
        }

        if (openViewerButton) {
            openViewerButton.style.display = "block";
        }

        liveHub.classList.add("viewer-active");

        console.log("▶️ Viewer:", roomId);
    }

    /* -----------------------------------------------------
       OPEN WATCH PAGE
       ----------------------------------------------------- */

    function openWatchPage() {

        if (!selectedRoom) {
            console.warn("⚠️ Tidak ada room dipilih");
            return;
        }

        const url =
            "live-watch.html?room=" +
            encodeURIComponent(selectedRoom);

        console.log("📺 Membuka:", url);

        window.location.href = url;
    }

    /* -----------------------------------------------------
       BACK TO FEED
       ----------------------------------------------------- */

    function backToFeed() {

        liveHub.classList.remove("viewer-active");

        selectedRoom = "";

        console.log("◀️ Kembali ke LIVE feed");
    }

    /* -----------------------------------------------------
       RENDER EMPTY
       ----------------------------------------------------- */

    function renderEmpty() {

        liveFeed.innerHTML = `
            <div class="live-status">
                <div style="font-size:42px;margin-bottom:12px;">
                    📺
                </div>

                <div>
                    Belum ada yang LIVE
                </div>

                <small>
                    Jadilah yang pertama untuk LIVE
                </small>
            </div>
        `;
    }

    /* -----------------------------------------------------
       RENDER LIVE CARDS
       ----------------------------------------------------- */

    function renderLiveRooms() {

        if (!liveFeed) return;

        if (!liveRooms.length) {
            renderEmpty();
            return;
        }

        liveFeed.innerHTML = "";

        liveRooms.forEach((room) => {

            const roomId =
                room.room_id || "";

            if (!roomId) return;

            const username =
                room.username ||
                room.display_name ||
                "CHUK USER";

            const displayName =
                room.display_name ||
                username;

            const avatar =
                room.avatar ||
                "assets/logo.png";

            const roomName =
                room.room_name ||
                "LIVE CHUK AN CHUKK";

            const card =
                document.createElement("article");

            card.className = "live-card";

            card.innerHTML = `
                <div class="live-card-media">

                    <img
                        src="${escapeHTML(avatar)}"
                        alt="${escapeHTML(displayName)}"
                        loading="lazy"
                        onerror="this.src='assets/logo.png'"
                    >

                    <div class="live-badge">
                        LIVE
                    </div>

                    <div class="live-card-gradient"></div>

                    <div class="live-card-info">

                        <div class="live-room-name">
                            ${escapeHTML(roomName)}
                        </div>

                        <div class="live-user-name">
                            @${escapeHTML(username)}
                        </div>

                    </div>

                </div>
            `;

            card.addEventListener("click", () => {

                openViewer(
                    roomId,
                    roomName
                );

            });

            liveFeed.appendChild(card);
        });
    }

    /* -----------------------------------------------------
       ESCAPE HTML
       ----------------------------------------------------- */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* -----------------------------------------------------
       LOAD LIVE ROOMS
       ----------------------------------------------------- */

    async function loadLiveRooms() {

        if (!supabaseClient) {

            console.error(
                "❌ Supabase tidak tersedia"
            );

            if (liveFeed) {
                liveFeed.innerHTML = `
                    <div class="live-status">
                        ❌ Supabase tidak terhubung.
                    </div>
                `;
            }

            return;
        }

        if (liveFeed) {

            liveFeed.innerHTML = `
                <div id="liveLoading" class="live-status">
                    🔄 Memuat LIVE...
                </div>
            `;
        }

        try {

            const { data, error } =
                await supabaseClient
                    .from("live_rooms")
                    .select(
                        "id,room_id,username,display_name,avatar,room_name,is_live"
                    )
                    .eq("is_live", true);

            if (error) {

                console.error(
                    "❌ Gagal mengambil LIVE:",
                    error
                );

                if (liveFeed) {
                    liveFeed.innerHTML = `
                        <div class="live-status">
                            ❌ Gagal memuat LIVE
                            <small>
                                ${escapeHTML(error.message)}
                            </small>
                        </div>
                    `;
                }

                return;
            }

            liveRooms = Array.isArray(data)
                ? data
                : [];

            console.log(
                "📡 LIVE aktif:",
                liveRooms.length
            );

            renderLiveRooms();

        } catch (error) {

            console.error(
                "❌ LIVE HUB ERROR:",
                error
            );

            if (liveFeed) {
                liveFeed.innerHTML = `
                    <div class="live-status">
                        ❌ Terjadi kesalahan
                    </div>
                `;
            }
        }
    }

    /* -----------------------------------------------------
       REALTIME UPDATE
       ----------------------------------------------------- */

    function subscribeLiveRooms() {

        if (!supabaseClient) return;

        const channel =
            supabaseClient.channel(
                "chuk-live-rooms-feed"
            );

        channel
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "live_rooms"
                },
                (payload) => {

                    console.log(
                        "🔄 LIVE ROOMS UPDATE",
                        payload
                    );

                    loadLiveRooms();
                }
            )
            .subscribe((status) => {

                console.log(
                    "📡 LIVE FEED:",
                    status
                );
            });
    }

    /* -----------------------------------------------------
       START LIVE
       ----------------------------------------------------- */

    if (startLiveButton) {

        startLiveButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "live.html";

            }
        );
    }

    /* -----------------------------------------------------
       OPEN SELECTED LIVE
       ----------------------------------------------------- */

    if (openViewerButton) {

        openViewerButton.addEventListener(
            "click",
            openWatchPage
        );
    }

    /* -----------------------------------------------------
       BACK
       ----------------------------------------------------- */

    if (backToFeedButton) {

        backToFeedButton.addEventListener(
            "click",
            backToFeed
        );
    }

    /* -----------------------------------------------------
       SWIPE
       ----------------------------------------------------- */

    let touchStartX = 0;
    let touchStartY = 0;

    liveHub.addEventListener(
        "touchstart",
        (event) => {

            const touch =
                event.touches[0];

            touchStartX =
                touch.clientX;

            touchStartY =
                touch.clientY;
        },
        { passive: true }
    );

    liveHub.addEventListener(
        "touchend",
        (event) => {

            const touch =
                event.changedTouches[0];

            const endX =
                touch.clientX;

            const endY =
                touch.clientY;

            const diffX =
                endX - touchStartX;

            const diffY =
                endY - touchStartY;

            /* Abaikan swipe vertikal */

            if (
                Math.abs(diffX) < 70 ||
                Math.abs(diffX) < Math.abs(diffY)
            ) {
                return;
            }

            /* Geser kiri */

            if (diffX < 0) {

                if (
                    !liveHub.classList.contains(
                        "viewer-active"
                    )
                ) {

                    if (liveRooms.length) {

                        const firstRoom =
                            liveRooms[0];

                        openViewer(
                            firstRoom.room_id,
                            firstRoom.room_name ||
                            firstRoom.display_name ||
                            "CHUK LIVE"
                        );

                    } else {

                        console.log(
                            "⚠️ Belum ada LIVE"
                        );
                    }
                }
            }

            /* Geser kanan */

            if (diffX > 0) {

                if (
                    liveHub.classList.contains(
                        "viewer-active"
                    )
                ) {

                    backToFeed();
                }
            }

        },
        { passive: true }
    );

    /* -----------------------------------------------------
       START
       ----------------------------------------------------- */

    loadLiveRooms();

    subscribeLiveRooms();

});
