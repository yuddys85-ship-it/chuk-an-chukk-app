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
