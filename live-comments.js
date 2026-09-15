"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const panel = document.getElementById("liveCommentPanel");
    const commentsList = document.getElementById("liveCommentsList");
    const form = document.getElementById("liveCommentForm");
    const input = document.getElementById("liveCommentInput");

    if (!panel || !commentsList || !form || !input) {
        console.error("❌ Sistem pesan Live tidak lengkap");
        return;
    }

    /* =====================================================
       PANEL PESAN SELALU AKTIF
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

        const div = document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    /* =====================================================
       RENDER PESAN
    ===================================================== */

    function renderComments() {

        commentsList.innerHTML = "";

        comments.forEach((comment, index) => {

            const item = document.createElement("div");

            item.className = "live-comment-item";

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

                const touch = event.touches[0];

                startX = touch.clientX;
                startY = touch.clientY;

                currentX = 0;
                dragging = true;

                item.style.transition = "none";

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

                const touch = event.touches[0];

                const deltaX =
                    touch.clientX - startX;

                const deltaY =
                    touch.clientY - startY;


                /* Hanya gerakan horizontal ke kanan */

                if (
                    deltaX > 0 &&
                    Math.abs(deltaX) > Math.abs(deltaY)
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


                /* =========================================
                   SWIPE CUKUP JAUH → HAPUS PESAN
                ========================================= */

                if (currentX >= 70) {

                    item.style.transition =
                        "transform .20s ease, opacity .20s ease";

                    item.style.transform =
                        "translateX(120%)";

                    item.style.opacity = "0";


                    setTimeout(() => {

                        const currentIndex =
                            comments.indexOf(
                                comments[index]
                            );

                        if (currentIndex !== -1) {
                            comments.splice(currentIndex, 1);
                        }

                        renderComments();

                    }, 200);

                }

                /* =========================================
                   SWIPE SEDIKIT → KEMBALI
                ========================================= */

                else {

                    item.style.transition =
                        "transform .18s ease";

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


            /* Tetap fokus ke kolom pesan */

            input.focus();


            console.log(
                "💬 Pesan dikirim:",
                text
            );

        }
    );


    /* =====================================================
       ENTER = KIRIM
       SHIFT + ENTER = BARIS BARU
    ===================================================== */

    input.addEventListener(
        "keydown",
        event => {

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
       TEXTAREA OTOMATIS MEMBESAR
    ===================================================== */

    input.addEventListener(
        "input",
        () => {

            input.style.height = "44px";

            input.style.height =
                Math.min(
                    input.scrollHeight,
                    90
                ) + "px";

        }
    );


    /* =====================================================
       PESAN AWAL
    ===================================================== */

    renderComments();


    console.log(
        "💬 CHUK AN CHUKK LIVE MESSAGE READY"
    );

});
