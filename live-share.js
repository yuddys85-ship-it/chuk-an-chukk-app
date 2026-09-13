"use strict";

/* =========================================================
   CHUK AN CHUKK
   LIVE SHARE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const shareButton =
        document.getElementById("shareLiveButton");

    if (!shareButton) {
        console.error("❌ Tombol Bagikan Live tidak ditemukan");
        return;
    }

    shareButton.addEventListener("click", async () => {

        const liveUrl = window.location.href;

        const shareData = {
            title: "CHUK AN CHUKK — Live",
            text: "Ayo lihat Live saya di Chuk an Chukk!",
            url: liveUrl
        };

        try {

            /* SHARE NATIF HP */
            if (navigator.share) {

                await navigator.share(shareData);

                console.log("✅ Live berhasil dibagikan");

                return;
            }

            /* FALLBACK COPY LINK */
            if (navigator.clipboard) {

                await navigator.clipboard.writeText(liveUrl);

                alert("Link Live berhasil disalin!");

                return;
            }

            /* FALLBACK LAMA */
            const textArea =
                document.createElement("textarea");

            textArea.value = liveUrl;

            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";

            document.body.appendChild(textArea);

            textArea.select();

            document.execCommand("copy");

            textArea.remove();

            alert("Link Live berhasil disalin!");

        } catch (error) {

            if (error.name === "AbortError") {
                console.log("ℹ️ Share dibatalkan");
                return;
            }

            console.error(
                "❌ Gagal membagikan Live:",
                error
            );
        }

    });

});
