"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const button =
        document.getElementById("publicRoomMenu");

    if (!button) return;

    button.addEventListener("click", () => {

        window.chukLivePrivacy = "public";

        console.log("🌐 ROOM: PUBLIK");

        alert("🌐 Live disetel ke Publik.");

    });

});
