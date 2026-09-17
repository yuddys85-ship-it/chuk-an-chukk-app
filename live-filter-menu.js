"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const button = document.getElementById("openFilterMenu");

    if (!button) return;

    button.addEventListener("click", () => {

        const panel = document.getElementById("liveFilterPanel");

        if (!panel) {
            console.warn("⚠️ Filter panel tidak ditemukan");
            return;
        }

        panel.classList.add("active");

        console.log("🎨 FILTER MENU DIBUKA");

    });

});
