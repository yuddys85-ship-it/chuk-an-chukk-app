  "use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE COMMENTS
   TIKTOK STYLE
   SWIPE KIRI / KANAN
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

        panel.classList.add(
            "comments-visible"
        );

    }


    /* =====================================================
       TUTUP KOMENTAR
       ===================================================== */

    function closeComments() {

        panel.classList.remove(
            "comments-visible"
        );

        panel.hidden = true;

        input.blur();

    }


    /* =====================================================
       TOMBOL KOMENTAR
       ===================================================== */

    commentButton.addEventListener(
        "click",
        () => {

            if (panel.hidden) {

                openComments();

            } else {

                closeComments();

            }

        }
    );


    /* =====================================================
       TOMBOL X
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
       SWIPE
       ===================================================== */

    let startX = 0;
    let startY = 0;

    let trackingSwipe = false;


    document.addEventListener(
        "touchstart",
        (event) => {

            /* Jangan ganggu input */

            if (
                event.target.closest(
                    "input, textarea, button"
                )
            ) {

                trackingSwipe = false;

                return;
            }


            if (
                event.touches.length !== 1
            ) {

                trackingSwipe = false;

                return;
            }


            startX =
                event.touches[0].clientX;

            startY =
                event.touches[0].clientY;


            trackingSwipe = true;

        },
        {
            passive: true
        }
    );


    document.addEventListener(
        "touchend",
        (event) => {

            if (!trackingSwipe) {
                return;
            }


            trackingSwipe = false;


            if (
                event.changedTouches.length !== 1
            ) {
                return;
            }


            const endX =
                event.changedTouches[0].clientX;

            const endY =
                event.changedTouches[0].clientY;


            const deltaX =
                endX - startX;

            const deltaY =
                endY - startY;


            /* =================================================
               HANYA SWIPE HORIZONTAL
               ================================================= */

            if (
                Math.abs(deltaX) <
                Math.abs(deltaY)
            ) {

                return;
            }


            /* =================================================
               MINIMAL JARAK SWIPE
               ================================================= */

            const MIN_SWIPE = 80;


            if (
                Math.abs(deltaX) <
                MIN_SWIPE
            ) {

                return;
            }


            /* =================================================
               SWIPE KIRI
               BUKA KOMENTAR
               ================================================= */

            if (
                deltaX < 0
            ) {

                openComments();

                console.log(
                    "👈 Swipe kiri → komentar muncul"
                );

                return;
            }


            /* =================================================
               SWIPE KANAN
               TUTUP KOMENTAR
               ================================================= */

            if (
                deltaX > 0
            ) {

                closeComments();

                console.log(
                    "👉 Swipe kanan → komentar hilang"
                );

            }

        },
        {
            passive: true
        }
    );


    /* =====================================================
       KOMENTAR AWAL
       ================================================= */

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
       ================================================= */

    function escapeHTML(text) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent =
            text;

        return div.innerHTML;

    }

});          
