"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE COMMENTS
   TIKTOK STYLE + SWIPE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const commentButton =
        document.getElementById("liveCommentButton");

    const panel =
        document.getElementById("liveCommentPanel");

    const closeButton =
        document.getElementById("closeLiveComments");

    const form =
        document.getElementById("liveCommentForm");

    const input =
        document.getElementById("liveCommentInput");

    const list =
        document.getElementById("liveCommentsList");


    if (
        !commentButton ||
        !panel ||
        !closeButton ||
        !form ||
        !input ||
        !list
    ) {

        console.error(
            "❌ Sistem komentar Live tidak lengkap"
        );

        return;
    }


    /* =====================================================
       BUKA KOMENTAR
       ===================================================== */

    function openComments() {

        panel.hidden = false;

        setTimeout(() => {

            input.focus();

        }, 150);

    }


    /* =====================================================
       TUTUP KOMENTAR
       ===================================================== */

    function closeComments() {

        panel.hidden = true;

        input.blur();

    }


    /* =====================================================
       TOMBOL KOMENTAR
       ===================================================== */

    commentButton.addEventListener(
        "click",
        openComments
    );


    /* =====================================================
       TOMBOL TUTUP
       ===================================================== */

    closeButton.addEventListener(
        "click",
        closeComments
    );


    /* =====================================================
       KIRIM KOMENTAR
       ===================================================== */

    form.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            const text =
                input.value.trim();


            if (!text) return;


            addComment(
                "CHUK USER",
                text
            );


            input.value = "";

        }
    );


    /* =====================================================
       TAMBAH KOMENTAR
       ===================================================== */

    function addComment(
        username,
        text
    ) {

        const comment =
            document.createElement("div");


        comment.className =
            "live-comment-item";


        comment.innerHTML = `

            <div class="live-comment-avatar">
                👤
            </div>

            <div class="live-comment-content">

                <div class="live-comment-name">
                    ${escapeHTML(username)}
                </div>

                <div class="live-comment-text">
                    ${escapeHTML(text)}
                </div>

            </div>

        `;


        list.appendChild(
            comment
        );


        list.scrollTop =
            list.scrollHeight;

    }


    /* =====================================================
       SWIPE LAYAR
       ===================================================== */

    let touchStartX = 0;
    let touchStartY = 0;

    let touchEndX = 0;
    let touchEndY = 0;


    document.addEventListener(
        "touchstart",
        (event) => {

            if (
                event.touches.length !== 1
            ) {
                return;
            }


            touchStartX =
                event.touches[0].clientX;

            touchStartY =
                event.touches[0].clientY;

        },
        {
            passive: true
        }
    );


    document.addEventListener(
        "touchend",
        (event) => {

            if (
                event.changedTouches.length !== 1
            ) {
                return;
            }


            touchEndX =
                event.changedTouches[0].clientX;

            touchEndY =
                event.changedTouches[0].clientY;


            const deltaX =
                touchEndX -
                touchStartX;


            const deltaY =
                touchEndY -
                touchStartY;


            /* Abaikan jika gerakan lebih banyak vertikal */

            if (
                Math.abs(deltaY) >
                Math.abs(deltaX)
            ) {
                return;
            }


            /* Minimal jarak swipe */

            const SWIPE_DISTANCE = 70;


            /* =============================================
               GESER KE KIRI
               ============================================= */

            if (
                deltaX < -SWIPE_DISTANCE
            ) {

                openComments();

                return;
            }


            /* =============================================
               GESER KE KANAN
               ============================================= */

            if (
                deltaX > SWIPE_DISTANCE
            ) {

                closeComments();

            }

        },
        {
            passive: true
        }
    );


    /* =====================================================
       KOMENTAR CONTOH
       ===================================================== */

    addComment(
        "ChukOfficial",
        "Selamat datang di Live CHUK AN CHUKK 👋"
    );


    addComment(
        "CHUK USER",
        "Halo semuanya 🔥"
    );


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent =
            text;

        return div.innerHTML;

    }

});
