"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const commentButton =
        document.getElementById("liveCommentButton");

    const panel =
        document.getElementById("liveCommentPanel");

    const closeButton =
        document.getElementById("closeLiveComments");

    const commentsList =
        document.getElementById("liveCommentsList");

    const form =
        document.getElementById("liveCommentForm");

    const input =
        document.getElementById("liveCommentInput");


    if (!commentButton || !panel || !closeButton || !commentsList || !form || !input) {

        console.error("❌ Elemen komentar Live tidak lengkap");

        return;
    }


    /* =====================================================
       DATA KOMENTAR LOKAL
    ===================================================== */

    let comments = [

        {
            name: "ChukOfficial",
            text: "Selamat datang di Live Chuk an Chukk 👋"
        },

        {
            name: "Chuk User",
            text: "Halo semuanya 🔥"
        }

    ];


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(text) {

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    /* =====================================================
       TAMPILKAN KOMENTAR
    ===================================================== */

    function renderComments() {

        commentsList.innerHTML = "";

        comments.forEach(comment => {

            const item =
                document.createElement("div");

            item.className =
                "live-comment-item";

            item.innerHTML = `

                <div class="live-comment-avatar">
                    👤
                </div>

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

        commentsList.scrollTop =
            commentsList.scrollHeight;
    }


    /* =====================================================
       BUKA PANEL
    ===================================================== */

    function openComments() {

        panel.hidden = false;

        /*
         * CSS menggunakan display:flex !important.
         * Karena itu gunakan !important juga dari JS.
         */

        panel.style.setProperty(
            "display",
            "flex",
            "important"
        );

        panel.style.transition =
            "transform 0.22s ease";

        panel.style.transform =
            "translateX(0)";

        renderComments();

        console.log("💬 Komentar Live dibuka");
    }


    /* =====================================================
       TUTUP PANEL
    ===================================================== */

    function closeComments() {

        panel.style.transition =
            "transform 0.22s ease";

        panel.style.transform =
            "translateX(100%)";

        setTimeout(() => {

            panel.hidden = true;

            panel.style.setProperty(
                "display",
                "none",
                "important"
            );

            panel.style.transform =
                "translateX(0)";

        }, 220);

        console.log("💬 Komentar Live ditutup");
    }


    /* =====================================================
       TOMBOL KOMENTAR
    ===================================================== */

    commentButton.addEventListener("click", () => {

        if (panel.hidden) {

            openComments();

        } else {

            closeComments();

        }

    });


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

    form.addEventListener("submit", event => {

        event.preventDefault();

        const text =
            input.value.trim();

        if (!text) {
            return;
        }


        comments.push({

            name: "Anda",

            text: text

        });


        input.value = "";

        renderComments();

        console.log(
            "💬 Komentar dikirim:",
            text
        );

    });


    /* =====================================================
       SWIPE PANEL KE KANAN
       HANYA PANEL KOMENTAR
    ===================================================== */

    let startX = 0;
    let startY = 0;

    let currentX = 0;

    let dragging = false;

    let horizontalSwipe = false;


    panel.addEventListener(
        "touchstart",
        event => {

            if (panel.hidden) {
                return;
            }

            const touch =
                event.touches[0];

            startX =
                touch.clientX;

            startY =
                touch.clientY;

            currentX =
                startX;

            dragging = true;

            horizontalSwipe = false;

            panel.style.transition =
                "none";

        },
        {
            passive: true
        }
    );


    panel.addEventListener(
        "touchmove",
        event => {

            if (!dragging) {
                return;
            }

            const touch =
                event.touches[0];

            currentX =
                touch.clientX;

            const deltaX =
                currentX - startX;

            const deltaY =
                touch.clientY - startY;


            /*
             * Tentukan apakah gerakan horizontal.
             */

            if (!horizontalSwipe) {

                if (
                    Math.abs(deltaX) > 10 &&
                    Math.abs(deltaX) > Math.abs(deltaY)
                ) {

                    horizontalSwipe = true;

                }

            }


            /*
             * Hanya geser ke kanan.
             */

            if (
                horizontalSwipe &&
                deltaX > 0
            ) {

                event.preventDefault();

                panel.style.transform =
                    `translateX(${deltaX}px)`;

            }

        },
        {
            passive: false
        }
    );


    panel.addEventListener(
        "touchend",
        () => {

            if (!dragging) {
                return;
            }

            dragging = false;

            const deltaX =
                currentX - startX;


            /*
             * Jika digeser cukup jauh ke kanan,
             * panel benar-benar ditutup.
             */

            const threshold =
                Math.max(
                    80,
                    panel.offsetWidth * 0.25
                );


            if (
                horizontalSwipe &&
                deltaX >= threshold
            ) {

                closeComments();

                return;
            }


            /*
             * Kalau belum cukup jauh,
             * kembali ke posisi awal.
             */

            panel.style.transition =
                "transform 0.22s ease";

            panel.style.transform =
                "translateX(0)";

        }
    );


    panel.addEventListener(
        "touchcancel",
        () => {

            dragging = false;

            panel.style.transition =
                "transform 0.22s ease";

            panel.style.transform =
                "translateX(0)";

        }
    );


    /* =====================================================
       AWAL
    ===================================================== */

    panel.hidden = true;

    panel.style.setProperty(
        "display",
        "none",
        "important"
    );

    panel.style.transform =
        "translateX(0)";

    renderComments();


    console.log(
        "✅ LIVE COMMENTS AKTIF"
    );

});
