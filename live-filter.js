"use strict";

/* =====================================================
   CHUK AN CHUKK
   LIVE CAMERA FILTER
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const video = document.getElementById("camera");
    const filterPanel = document.getElementById("liveFilterPanel");

    if (!video || !filterPanel) {
        console.warn("⚠️ Sistem filter kamera tidak ditemukan");
        return;
    }


    const filters = {
        none: "none",

        warm:
            "sepia(0.18) saturate(1.15) brightness(1.04)",

        cool:
            "saturate(0.85) hue-rotate(8deg) brightness(1.03)",

        gray:
            "grayscale(1)",

        bright:
            "brightness(1.15) contrast(1.04)",

        soft:
            "brightness(1.05) saturate(0.85) contrast(0.92)"
    };


    /* =================================================
       PILIH FILTER
    ================================================= */

    const buttons =
        filterPanel.querySelectorAll(".filter-option");


    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const filterName =
                button.dataset.filter;

            const filter =
                filters[filterName] || "none";


            /* Terapkan filter */

            video.style.filter = filter;


            /* Tandai filter aktif */

            buttons.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");


            console.log(
                "🎨 Filter LIVE:",
                filterName
            );

        });

    });


    console.log(
        "✅ CHUK AN CHUKK LIVE FILTER READY"
    );

});
