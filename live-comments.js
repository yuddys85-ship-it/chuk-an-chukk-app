"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const panel =
        document.getElementById("liveCommentPanel");

    const commentsList =
        document.getElementById("liveCommentsList");

    const form =
        document.getElementById("liveCommentForm");

    const input =
        document.getElementById("liveCommentInput");

    if (!panel || !commentsList || !form || !input) {
        console.error("❌ Sistem pesan Live tidak lengkap");
        return;
    }

    /* =====================================================
       PANEL SELALU AKTIF
    ===================================================== */

    panel.hidden = false;

    panel.style.setProperty(
        "display",
        "flex",
        "important"
    );

    panel.style.transform = "none";


    /* =====================================================
       DATA PESAN
    ===================================================== */

    let comments = [];


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    /* =====================================================
       TAMPILKAN PESAN
    ===================================================== */

    function renderComments() {

        commentsList.innerHTML = "";

        comments.forEach((comment, index) => {

            const item =
                document.createElement("div");

            item.className =
                "live-comment-item";

            item.dataset.index = index;

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

            enableSwipeToRemove(item, index);
        });

    }


    /* =====================================================
       SWIPE PESAN KE KANAN
    ===================================================== */

    function enableSwipeToRemove(item, index) {

        let startX = 0;
        let startY = 0;

        let currentX = 0;

        let dragging = false;

        item.addEventListener(
            "touchstart",
            event => {

                const touch =
                    event.touches[0];

                startX =
                    touch.clientX;

                startY =
                    touch.clientY;

                currentX = 0;

                dragging = true;

                item.style.transition =
                    "none";

            },
            {
                passive: true
            }
        );


        item.addEventListener(
            "touchmove",
            event => {

                if (!dragging) {
                    return;
                }

                const touch =
                    event.touches[0];

                const deltaX =
                    touch.clientX - startX;

                const deltaY =
                    touch.clientY - startY;


                /*
                 * Hanya swipe ke kanan
                 */

                if (
                    deltaX > 0 &&
                    Math.abs(deltaX) >
                    Math.abs(deltaY)
                ) {

                    currentX = deltaX;

                    item.style.transform =
                        `translateX(${currentX}px)`;

                }

            },
            {
                passive: true
            }
        );


        item.addEventListener(
            "touchend",
            () => {

                if (!dragging) {
                    return;
                }

                dragging = false;

                /*
                 * Kalau digeser cukup jauh
                 * pesan langsung hilang
                 */

                if (currentX > 80) {

                    item.style.transition =
                        "transform .22s ease, opacity .22s ease";

                    item.style.transform =
                        "translateX(120%)";

                    item.style.opacity =
                        "0";


                    setTimeout(() => {

                        comments.splice(index, 1);

                        renderComments();

                    }, 220);

                } else {

                    /*
                     * Kalau gesernya sedikit,
                     * kembali ke posisi awal
                     */

                    item.style.transition =
                        "transform .2s ease";

                    item.style.transform =
                        "translateX(0)";

                }

            }
        );

    }


    /* =====================================================
       KIRIM PESAN
    ===================================================== */

    form.addEventListener(
        "submit",
        event => {

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


            /*
             * Kembalikan fokus ke kolom
             */

            input.focus();


            console.log(
                "💬 Pesan dikirim:",
                text
            );

        }
    );


    /* =====================================================
       ENTER UNTUK KIRIM
    ===================================================== */

    input.addEventListener(
        "keydown",
        event => {

            /*
             * Enter = kirim
             * Shift + Enter = baris baru
             */

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                form.requestSubmit();

            }

        }
    );


    /* =====================================================
       INPUT OTOMATIS MEMBESAR
    ===================================================== */

    input.addEventListener(
        "input",
        () => {

            input.style.height =
                "36px";

            input.style.height =
                Math.min(
                    input.scrollHeight,
                    90
                ) + "px";

        }
    );


    /* =====================================================
       TIDAK ADA LAGI:
       - OPEN PANEL
       - CLOSE PANEL
       - TOMBOL KOMENTAR
       - TOMBOL X
       - SWIPE PANEL
    ===================================================== */


    console.log(
        "💬 CHUK AN CHUKK LIVE MESSAGE READY"
    );

});
