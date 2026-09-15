"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const panel = document.getElementById("liveCommentPanel");
    const commentsList = document.getElementById("liveCommentsList");
    const form = document.getElementById("liveCommentForm");
    const input = document.getElementById("liveCommentInput");

    if (!panel || !commentsList || !form || !input) {
        console.error("❌ Sistem pesan LIVE tidak lengkap");
        return;
    }

    /* =====================================================
       PANEL SELALU AKTIF
    ===================================================== */

    panel.hidden = false;

    panel.classList.add("live-message-active");


    /* =====================================================
       DATA PESAN
    ===================================================== */

    const comments = [];


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    /* =====================================================
       RENDER PESAN
    ===================================================== */

    function renderComments() {

        commentsList.innerHTML = "";

        comments.forEach(comment => {

            const item = document.createElement("div");

            item.className = "live-comment-item";

            item.innerHTML = `
                <div class="live-comment-content">

                    <div class="live-comment-name">
                        ${escapeHTML(comment.name)}
                    </div>

                    <div class="live-comment-text">
                        ${escapeHTML(comment.text)}
                    </div>

                </div>
            `;

            commentsList.appendChild(item);

        });

    }


    /* =====================================================
       KIRIM PESAN
    ===================================================== */

    form.addEventListener("submit", event => {

        event.preventDefault();

        const text = input.value.trim();

        if (!text) {
            return;
        }

        comments.push({
            name: "Anda",
            text: text
        });

        input.value = "";

        input.style.height = "44px";

        renderComments();

        /*
         * Setelah kirim, komentar otomatis terlihat
         */
        commentsList.classList.remove(
            "live-comments-hidden"
        );

        input.focus();

    });


    /* =====================================================
       ENTER = KIRIM
       SHIFT + ENTER = BARIS BARU
    ===================================================== */

    input.addEventListener("keydown", event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            form.requestSubmit();

        }

    });


    /* =====================================================
       AUTO HEIGHT TEXTAREA
    ===================================================== */

    input.addEventListener("input", () => {

        input.style.height = "44px";

        input.style.height =
            Math.min(
                input.scrollHeight,
                90
            ) + "px";

    });


    /* =====================================================
       SWIPE LAYAR LIVE
       
       Geser ke kanan:
       → komentar sembunyi

       Geser kembali ke kiri:
       ← komentar muncul lagi
    ===================================================== */

    let startX = 0;
    let startY = 0;
    let isSwiping = false;


    panel.addEventListener(
        "touchstart",
        event => {

            const touch = event.touches[0];

            startX = touch.clientX;
            startY = touch.clientY;

            isSwiping = true;

        },
        {
            passive: true
        }
    );


    panel.addEventListener(
        "touchend",
        event => {

            if (!isSwiping) {
                return;
            }

            isSwiping = false;

            const touch = event.changedTouches[0];

            const deltaX =
                touch.clientX - startX;

            const deltaY =
                touch.clientY - startY;


            /*
             * Abaikan kalau gerakannya
             * lebih banyak vertikal
             */

            if (
                Math.abs(deltaX) < 60 ||
                Math.abs(deltaX) < Math.abs(deltaY)
            ) {
                return;
            }


            /* =============================================
               GESER KE KANAN
            ============================================= */

            if (deltaX > 0) {

                commentsList.classList.add(
                    "live-comments-hidden"
                );

                console.log(
                    "➡️ Komentar disembunyikan"
                );

            }


            /* =============================================
               GESER KE KIRI
            ============================================= */

            else {

                commentsList.classList.remove(
                    "live-comments-hidden"
                );

                console.log(
                    "⬅️ Komentar ditampilkan kembali"
                );

            }

        },
        {
            passive: true
        }
    );


    /* =====================================================
       PESAN AWAL
    ===================================================== */

    renderComments();


    console.log(
        "🚀 CHUK AN CHUKK LIVE MESSAGE READY"
    );

});
