"use strict";

/* =====================================================
   CHUK AN CHUKK
   LIVE CONTROL
   MULAI LIVE / STOP LIVE
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const startButton =
        document.getElementById("startLiveButton");

    const stopButton =
        document.getElementById("stopLiveButton");

    if (!startButton || !stopButton) {

        console.warn(
            "⚠️ Tombol Mulai/Stop Live tidak ditemukan"
        );

        return;
    }


    /* =====================================================
       STATE LIVE
    ===================================================== */

    let isLive = false;


    /* =====================================================
       MULAI LIVE
    ===================================================== */

    startButton.addEventListener("click", async () => {

        if (isLive) {
            return;
        }

        try {

            console.log("🔴 MEMULAI LIVE...");

            /*
             * Di sini nanti bisa dihubungkan
             * ke sistem live streaming / backend.
             */

            isLive = true;

            startButton.hidden = true;
            stopButton.hidden = false;

            document.body.classList.add("is-live");

            window.chukLiveStatus = "live";

            window.dispatchEvent(
                new CustomEvent("chuk-live-started")
            );

            console.log("🔴 CHUK AN CHUKK LIVE AKTIF");

        } catch (error) {

            console.error(
                "❌ Gagal memulai Live:",
                error
            );

            alert(
                "Gagal memulai Live."
            );

        }

    });


    /* =====================================================
       STOP LIVE
    ===================================================== */

    stopButton.addEventListener("click", () => {

        if (!isLive) {
            return;
        }

        const confirmStop =
            confirm(
                "⏹️ Hentikan Live sekarang?"
            );

        if (!confirmStop) {
            return;
        }

        console.log("⏹️ MENGHENTIKAN LIVE...");

        isLive = false;

        stopButton.hidden = true;
        startButton.hidden = false;

        document.body.classList.remove("is-live");

        window.chukLiveStatus = "ended";

        window.dispatchEvent(
            new CustomEvent("chuk-live-stopped")
        );

        console.log(
            "⏹️ CHUK AN CHUKK LIVE BERHENTI"
        );

    });


    /* =====================================================
       STATUS AWAL
    ===================================================== */

    startButton.hidden = false;
    stopButton.hidden = true;

    window.chukLiveStatus = "idle";


    console.log(
        "✅ CHUK AN CHUKK LIVE CONTROL READY"
    );

});
