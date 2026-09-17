"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const button =
        document.getElementById("openFilterMenu");

    const panel =
        document.getElementById("liveFilterPanel");

    const roomPanel =
        document.getElementById("roomPanel");


    if (!button || !panel) {

        console.warn(
            "⚠️ Filter menu tidak ditemukan"
        );

        return;
    }


    /* =========================================
       TUTUP FILTER
       
       PENTING:
       Jangan mengubah video.style.filter
       supaya efek tetap aktif.
    ========================================= */

    function closeFilter() {

        panel.classList.remove("active");

        console.log(
            "🎨 PANEL FILTER DITUTUP"
        );
    }


    /* =========================================
       BUKA / TUTUP FILTER
    ========================================= */

    button.addEventListener(
        "click",
        (event) => {

            event.preventDefault();
            event.stopPropagation();


            /* Jika sedang terbuka → tutup */

            if (
                panel.classList.contains("active")
            ) {

                closeFilter();

                return;
            }


            /* Tutup menu utama */

            if (roomPanel) {

                roomPanel.hidden = true;

                roomPanel.style.setProperty(
                    "display",
                    "none",
                    "important"
                );
            }


            /* Buka panel filter */

            panel.classList.add("active");


            console.log(
                "🎨 PANEL FILTER DIBUKA"
            );

        }
    );


    /* =========================================
       KLIK DI LUAR PANEL
    ========================================= */

    document.addEventListener(
        "click",
        (event) => {

            if (
                !panel.classList.contains("active")
            ) {
                return;
            }


            if (
                event.target.closest(
                    "#liveFilterPanel"
                ) ||
                event.target.closest(
                    "#openFilterMenu"
                )
            ) {

                return;
            }


            closeFilter();

        }
    );


    /* =========================================
       AWAL LIVE
       
       Panel tersembunyi.
       Filter kamera tetap Normal.
    ========================================= */

    panel.classList.remove("active");


    console.log(
        "✅ CHUK AN CHUKK FILTER MENU READY"
    );

});

const filters = {

    none:
        "none",

    warm:
        "sepia(0.32) saturate(1.38) contrast(1.08) brightness(1.06)",

    cool:
        "saturate(0.78) hue-rotate(14deg) contrast(1.14) brightness(1.05)",

    gray:
        "grayscale(1) contrast(1.28) brightness(1.04)",

    bright:
        "brightness(1.24) contrast(1.12) saturate(1.14)",

    soft:
        "brightness(1.08) saturate(0.88) contrast(0.82)",

    beauty:
        "brightness(1.10) saturate(1.05) contrast(0.88) blur(0.25px)",

    smooth:
        "brightness(1.08) saturate(0.96) contrast(0.84) blur(0.45px)",

    youthful:
        "brightness(1.14) saturate(1.08) contrast(0.86) sepia(0.04) blur(0.30px)"
};
