(function () {

    "use strict";

    const video = document.getElementById("camera");
    const canvas = document.getElementById("filterCanvas");
    const status = document.getElementById("cameraStatus");

    let stream = null;
    let facingMode = "user";

    function showStatus(text) {
        if (status) {
            status.textContent = text;
            status.classList.remove("hidden");
        }
    }

    function hideStatus() {
        if (status) {
            status.classList.add("hidden");
        }
    }

    async function startCamera() {

        console.log("================================");
        console.log("CHUK AN CHUKK CAMERA TEST");
        console.log("================================");

        showStatus("📷 Membuka kamera...");

        /*
         * MATIKAN CANVAS FILTER DULU
         * Supaya tidak menutupi kamera.
         */
        if (canvas) {
            canvas.style.display = "none";
        }

        if (!navigator.mediaDevices) {

            showStatus(
                "❌ navigator.mediaDevices tidak tersedia"
            );

            console.error(
                "navigator.mediaDevices tidak tersedia"
            );

            return;
        }

        if (!navigator.mediaDevices.getUserMedia) {

            showStatus(
                "❌ getUserMedia tidak tersedia"
            );

            console.error(
                "getUserMedia tidak tersedia"
            );

            return;
        }

        /*
         * Hentikan kamera lama.
         */
        if (stream) {

            stream.getTracks().forEach(
                function (track) {
                    track.stop();
                }
            );

            stream = null;
        }

        try {

            console.log(
                "Request camera:",
                facingMode
            );

            /*
             * Gunakan constraint sederhana
             * supaya kompatibilitas Pi Browser
             * lebih tinggi.
             */
            stream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {
                            facingMode: facingMode
                        },

                        audio: true

                    });


            console.log(
                "✅ CAMERA ACCESS GRANTED"
            );


            const videoTracks =
                stream.getVideoTracks();


            if (videoTracks.length) {

                console.log(
                    "Camera:",
                    videoTracks[0].label
                );

                console.log(
                    "Camera settings:",
                    videoTracks[0].getSettings()
                );

            }


            /*
             * Pasang stream ke video.
             */
            video.srcObject = stream;

            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;

            /*
             * NON-MIRROR.
             *
             * Gerak kanan asli =
             * gerak kanan di layar.
             */
            video.style.transform =
                "none";


            /*
             * Paksa play.
             */
            try {

                await video.play();

                console.log(
                    "✅ VIDEO PLAYING"
                );

            } catch (playError) {

                console.warn(
                    "Video play error:",
                    playError
                );

                showStatus(
                    "📷 Tekan layar untuk mengaktifkan kamera"
                );

            }


            video.onloadedmetadata =
                function () {

                    console.log(
                        "Video width:",
                        video.videoWidth
                    );

                    console.log(
                        "Video height:",
                        video.videoHeight
                    );

                    console.log(
                        "Video readyState:",
                        video.readyState
                    );

                    hideStatus();

                };


            video.onplaying =
                function () {

                    console.log(
                        "🎥 VIDEO BENAR-BENAR BERJALAN"
                    );

                    hideStatus();

                };


            video.onerror =
                function (error) {

                    console.error(
                        "❌ VIDEO ERROR:",
                        error
                    );

                    showStatus(
                        "❌ Video error"
                    );

                };


        } catch (error) {

            console.error(
                "❌ GET USER MEDIA ERROR"
            );

            console.error(
                "Name:",
                error.name
            );

            console.error(
                "Message:",
                error.message
            );

            let message =
                "❌ Kamera gagal dibuka";


            if (
                error.name ===
                "NotAllowedError"
            ) {

                message =
                    "❌ Izin kamera ditolak";

            }

            else if (
                error.name ===
                "NotFoundError"
            ) {

                message =
                    "❌ Kamera tidak ditemukan";

            }

            else if (
                error.name ===
                "NotReadableError"
            ) {

                message =
                    "❌ Kamera sedang digunakan aplikasi lain";

            }

            else if (
                error.name ===
                "SecurityError"
            ) {

                message =
                    "❌ Kamera membutuhkan HTTPS";

            }

            else if (
                error.name ===
                "OverconstrainedError"
            ) {

                message =
                    "❌ Kamera tidak mendukung mode ini";

            }


            showStatus(message);

        }

    }


    /*
     * FLIP CAMERA
     */
    async function flipCamera() {

        facingMode =
            facingMode === "user"
                ? "environment"
                : "user";

        console.log(
            "🔄 FLIP:",
            facingMode
        );

        await startCamera();

    }


    /*
     * CAMERA ON/OFF
     */
    function toggleCamera() {

        if (!stream) {

            startCamera();

            return;
        }


        const tracks =
            stream.getVideoTracks();


        tracks.forEach(
            function (track) {

                track.enabled =
                    !track.enabled;

            }
        );


        const enabled =
            tracks.length
                ? tracks[0].enabled
                : false;


        console.log(
            "Camera enabled:",
            enabled
        );


        if (enabled) {

            hideStatus();

        } else {

            showStatus(
                "📷 Kamera OFF"
            );

        }

    }


    /*
     * MICROPHONE
     */
    function toggleMic() {

        if (!stream) {
            return;
        }


        const tracks =
            stream.getAudioTracks();


        tracks.forEach(
            function (track) {

                track.enabled =
                    !track.enabled;

            }
        );


        console.log(
            "Mic enabled:",
            tracks.length
                ? tracks[0].enabled
                : false
        );

    }


    /*
     * TOMBOL
     */

    const flipButton =
        document.getElementById("flipButton");

    if (flipButton) {

        flipButton.onclick =
            flipCamera;

    }


    const cameraButton =
        document.getElementById("cameraButton");

    if (cameraButton) {

        cameraButton.onclick =
            toggleCamera;

    }


    const micButton =
        document.getElementById("micButton");

    if (micButton) {

        micButton.onclick =
            toggleMic;

    }


    /*
     * Tutup halaman.
     */
    const closeButton =
        document.getElementById("closeLive");

    if (closeButton) {

        closeButton.onclick =
            function () {

                if (stream) {

                    stream
                        .getTracks()
                        .forEach(
                            function (track) {
                                track.stop();
                            }
                        );

                }

                window.location.href =
                    "index.html";

            };

    }


    /*
     * Mulai kamera setelah halaman siap.
     */
    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startCamera
        );

    } else {

        startCamera();

    }


    /*
     * Bersihkan kamera.
     */
    window.addEventListener(
        "beforeunload",
        function () {

            if (stream) {

                stream
                    .getTracks()
                    .forEach(
                        function (track) {
                            track.stop();
                        }
                    );

            }

        }
    );


})();
