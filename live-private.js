"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const button =
        document.getElementById("privateRoomMenu");

    if (!button) return;

    button.addEventListener("click", () => {

        window.chukLivePrivacy = "private";

        console.log("🔒 ROOM: PRIVAT");

        alert("🔒 Live disetel ke Privat.");

    });

});
