"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const button =
        document.getElementById("openFilterMenu");

    const panel =
        document.getElementById("liveFilterPanel");

    if (!button || !panel) {
        console.warn("⚠️ Filter menu tidak ditemukan");
        return;
    }

    /* Pastikan filter tersembunyi saat LIVE dibuka */
    panel.classList.remove("active");

    button.addEventListener("click", (event) => {

        event.preventDefault();
        event.stopPropagation();

        /* Tutup menu utama */
        const roomPanel =
            document.getElementById("roomPanel");

        if (roomPanel) {
            roomPanel.hidden = true;
        }

        /* Tampilkan filter */
        panel.classList.add("active");

        console.log("🎨 FILTER DIBUKA");

    });

});
