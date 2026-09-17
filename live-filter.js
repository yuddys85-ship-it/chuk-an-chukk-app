"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const video = document.getElementById("camera");
    const filterPanel = document.getElementById("liveFilterPanel");

    if (!video || !filterPanel) {
        console.warn("⚠️ Sistem filter kamera tidak ditemukan");
        return;
    }

    /* =========================================
       DAFTAR FILTER
    ========================================= */

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


    /* =========================================
       FILTER BUTTON
    ========================================= */

    const buttons =
        filterPanel.querySelectorAll(".filter-option");


    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const filterName =
                button.dataset.filter;

            const filter =
                filters[filterName] || "none";


            /* =====================================
               TERAPKAN FILTER KE KAMERA

               Filter TIDAK dihapus ketika
               panel ditutup.
            ===================================== */

            video.style.filter = filter;


            /* =====================================
               SIMPAN FILTER AKTIF
            ===================================== */

            window.chukActiveLiveFilter =
                filterName;


            /* =====================================
               UPDATE TOMBOL AKTIF
            ===================================== */

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


    /* =========================================
       FILTER DEFAULT
    ========================================= */

    video.style.filter = "none";

    window.chukActiveLiveFilter = "none";


    console.log(
        "✅ CHUK AN CHUKK LIVE FILTER READY"
    );

});
