"use strict";

document.addEventListener("DOMContentLoaded", () => {

    const button =
        document.getElementById("openRoomNameMenu");

    if (!button) return;

    button.addEventListener("click", () => {

        const name = prompt(
            "✏️ Masukkan Nama Room",
            window.liveRoomName || ""
        );

        if (name === null) return;

        const cleanName = name.trim();

        if (!cleanName) {
            alert("Nama room tidak boleh kosong.");
            return;
        }

        window.liveRoomName = cleanName;
        window.CHUK_LIVE_ROOM_NAME = cleanName;

        window.dispatchEvent(
            new CustomEvent("chuk-room-created", {
                detail: {
                    name: cleanName
                }
            })
        );

        console.log("✏️ Nama Room:", cleanName);

    });

});
