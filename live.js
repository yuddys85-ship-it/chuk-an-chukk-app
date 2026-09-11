/* =========================================================
   CHUK AN CHUKK
   LIVE.JS
   FULL SCREEN LIVE CAMERA
   NON-MIRROR CAMERA
   ========================================================= */

(function () {

    "use strict";

    /* =====================================================
       DOM
       ===================================================== */

    const video =
        document.getElementById("camera");

    const canvas =
        document.getElementById("filterCanvas");

    const cameraStatus =
        document.getElementById("cameraStatus");

    const lightStatus =
        document.getElementById("lightStatus");

    const viewerCount =
        document.getElementById("viewerCount");

    const liveTime =
        document.getElementById("liveTime");

    const likeButton =
        document.getElementById("likeButton");

    const likeCount =
        document.getElementById("likeCount");

    const cameraButton =
        document.getElementById("cameraButton");

    const micButton =
        document.getElementById("micButton");

    const startLiveButton =
        document.getElementById("startLiveButton");

    const flipButton =
        document.getElementById("flipButton");

    const filterButton =
        document.getElementById("filterButton");

    const closeLive =
        document.getElementById("closeLive");

    const filterPanel =
        document.getElementById("filterPanel");

    const resetFilter =
        document.getElementById("resetFilter");

    const dreamLikeButton =
        document.getElementById("dreamLikeButton");

    const plasticRange =
        document.getElementById("plasticRange");

    const glowRange =
        document.getElementById("glowRange");

    const brightnessRange =
        document.getElementById("brightnessRange");

    const softFocusRange =
        document.getElementById("softFocusRange");

    const detailRange =
        document.getElementById("detailRange");

    const plasticValue =
        document.getElementById("plasticValue");

    const glowValue =
        document.getElementById("glowValue");

    const brightnessValue =
        document.getElementById("brightnessValue");

    const softFocusValue =
        document.getElementById("softFocusValue");

    const detailValue =
        document.getElementById("detailValue");

    const autoLightButton =
        document.getElementById("autoLightButton");

    const autoLightText =
        document.getElementById("autoLightText");


    /* =====================================================
       STATE
       ===================================================== */

    let stream = null;

    let currentFacingMode = "user";

    let cameraEnabled = true;

    let micEnabled = true;

    let liveStarted = false;

    let liveSeconds = 0;

    let liveTimer = null;

    let likes = 0;

    let viewers = 0;

    let viewerTimer = null;

    let autoLight = true;

    let dreamFilter = null;


    /* =====================================================
       DEFAULT FILTER
       ===================================================== */

    const DEFAULT_FILTER = {

        plastic: 90,

        glow: 65,

        brightness: 35,

        softFocus: 55,

        detail: 25,

        strength: 90
    };


    /* =====================================================
       INIT
       ===================================================== */

    function init() {

        console.log(
            "🎥 CHUK AN CHUKK LIVE initializing..."
        );

        setupFilter();

        setupEvents();

        updateButtons();

        updateFilterLabels();

        resizeFilter();

        startCamera();
    }


    /* =====================================================
       FILTER INIT
       ===================================================== */

    function setupFilter() {

        if (
            window.DreamLikePlastic &&
            video &&
            canvas
        ) {

            dreamFilter =
                new window.DreamLikePlastic(
                    video,
                    canvas
                );

            dreamFilter.setSettings(
                DEFAULT_FILTER
            );

            dreamFilter.setAutoLight(
                true
            );

            dreamFilter.enabled = true;

            console.log(
                "✨ Dream Like Filter Ready"
            );

        } else {

            console.warn(
                "⚠️ DreamLikePlastic belum tersedia"
            );
        }
    }


    /* =====================================================
       EVENTS
       ===================================================== */

    function setupEvents() {

        if (cameraButton) {

            cameraButton.addEventListener(
                "click",
                toggleCamera
            );
        }

        if (micButton) {

            micButton.addEventListener(
                "click",
                toggleMic
            );
        }

        if (flipButton) {

            flipButton.addEventListener(
                "click",
                flipCamera
            );
        }

        if (startLiveButton) {

            startLiveButton.addEventListener(
                "click",
                toggleLive
            );
        }

        if (filterButton) {

            filterButton.addEventListener(
                "click",
                toggleFilterPanel
            );
        }

        if (resetFilter) {

            resetFilter.addEventListener(
                "click",
                resetDreamFilter
            );
        }

        if (dreamLikeButton) {

            dreamLikeButton.addEventListener(
                "click",
                toggleDreamFilter
            );
        }

        if (likeButton) {

            likeButton.addEventListener(
                "click",
                addLike
            );
        }

        if (autoLightButton) {

            autoLightButton.addEventListener(
                "click",
                toggleAutoLight
            );
        }


        /* -----------------------------------------------
           FILTER SLIDERS
           ----------------------------------------------- */

        if (plasticRange) {

            plasticRange.addEventListener(
                "input",
                function () {

                    updateFilter(
                        "plastic",
                        this.value
                    );
                }
            );
        }

        if (glowRange) {

            glowRange.addEventListener(
                "input",
                function () {

                    updateFilter(
                        "glow",
                        this.value
                    );
                }
            );
        }

        if (brightnessRange) {

            brightnessRange.addEventListener(
                "input",
                function () {

                    updateFilter(
                        "brightness",
                        this.value
                    );
                }
            );
        }

        if (softFocusRange) {

            softFocusRange.addEventListener(
                "input",
                function () {

                    updateFilter(
                        "softFocus",
                        this.value
                    );
                }
            );
        }

        if (detailRange) {

            detailRange.addEventListener(
                "input",
                function () {

                    updateFilter(
                        "detail",
                        this.value
                    );
                }
            );
        }


        /* -----------------------------------------------
           CLOSE LIVE
           ----------------------------------------------- */

        if (closeLive) {

            closeLive.addEventListener(
                "click",
                function () {

                    stopEverything();

                    window.location.href =
                        "index.html";
                }
            );
        }


        /* -----------------------------------------------
           CAMERA / CANVAS TAP
           ----------------------------------------------- */

        if (video) {

            video.addEventListener(
                "click",
                closeFilterPanel
            );
        }

        if (canvas) {

            canvas.addEventListener(
                "click",
                closeFilterPanel
            );
        }


        /* -----------------------------------------------
           RESIZE
           ----------------------------------------------- */

        window.addEventListener(
            "resize",
            resizeFilter
        );

        window.addEventListener(
            "orientationchange",
            function () {

                setTimeout(
                    resizeFilter,
                    300
                );
            }
        );


        /* -----------------------------------------------
           ESC
           ----------------------------------------------- */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    closeFilterPanel();
                }
            }
        );
    }


    /* =====================================================
       START CAMERA
       ===================================================== */

    async function startCamera() {

        if (!navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia) {

            showCameraStatus(
                "❌ Kamera tidak didukung browser ini"
            );

            return;
        }

        try {

            showCameraStatus(
                "📷 Menyiapkan kamera..."
            );

            /*
             * Hentikan stream lama
             */

            stopStream();


            /*
             * PENTING:
             *
             * Jangan mirror kamera.
             *
             * Kita memakai resolusi kamera normal.
             * Tampilan full-screen dilakukan dengan
             * object-fit: cover + canvas cover.
             */

            stream =
                await navigator.mediaDevices.getUserMedia({

                    video: {

                        facingMode:
                            currentFacingMode,

                        width: {
                            ideal: 1280
                        },

                        height: {
                            ideal: 720
                        },

                        frameRate: {
                            ideal: 30,
                            max: 30
                        }
                    },

                    audio: true
                });


            video.srcObject =
                stream;


            await video.play();


            cameraEnabled = true;

            micEnabled = true;


            /*
             * Pastikan kamera TIDAK mirror
             */

            video.style.transform =
                "none";

            canvas.style.transform =
                "none";


            /*
             * Resize setelah video memiliki
             * ukuran asli.
             */

            if (video.readyState >= 2) {

                resizeFilter();

            }


            /*
             * Mulai filter
             */

            if (dreamFilter) {

                dreamFilter.start();

                dreamFilter.enabled = true;
            }


            hideCameraStatus();


            console.log(
                "✅ Kamera aktif:",
                video.videoWidth,
                "x",
                video.videoHeight
            );

        } catch (error) {

            console.error(
                "Camera error:",
                error
            );

            showCameraStatus(
                getCameraErrorMessage(error)
            );
        }
    }


    /* =====================================================
       CAMERA ERROR
       ===================================================== */

    function getCameraErrorMessage(error) {

        if (!error) {

            return "❌ Kamera gagal dibuka";
        }

        if (
            error.name ===
            "NotAllowedError"
        ) {

            return "❌ Izin kamera ditolak";
        }

        if (
            error.name ===
            "NotFoundError"
        ) {

            return "❌ Kamera tidak ditemukan";
        }

        if (
            error.name ===
            "NotReadableError"
        ) {

            return "❌ Kamera sedang digunakan aplikasi lain";
        }

        if (
            error.name ===
            "SecurityError"
        ) {

            return "❌ Kamera membutuhkan HTTPS / izin aman";
        }

        return (
            "❌ Kamera gagal: " +
            error.message
        );
    }


    /* =====================================================
       STOP STREAM
       ===================================================== */

    function stopStream() {

        if (!stream) {
            return;
        }

        stream.getTracks().forEach(
            function (track) {

                track.stop();
            }
        );

        stream = null;

        if (video) {

            video.srcObject = null;
        }
    }


    /* =====================================================
       CAMERA ON / OFF
       ===================================================== */

    function toggleCamera() {

        if (!stream) {
            return;
        }

        cameraEnabled =
            !cameraEnabled;


        stream.getVideoTracks()
            .forEach(
                function (track) {

                    track.enabled =
                        cameraEnabled;
                }
            );


        if (cameraEnabled) {

            hideCameraStatus();

        } else {

            showCameraStatus(
                "📷 Kamera OFF"
            );
        }


        updateButtons();
    }


    /* =====================================================
       MIC ON / OFF
       ===================================================== */

    function toggleMic() {

        if (!stream) {
            return;
        }

        micEnabled =
            !micEnabled;


        stream.getAudioTracks()
            .forEach(
                function (track) {

                    track.enabled =
                        micEnabled;
                }
            );


        updateButtons();
    }


    /* =====================================================
       FLIP CAMERA
       ===================================================== */

    async function flipCamera() {

        currentFacingMode =
            currentFacingMode === "user"
                ? "environment"
                : "user";


        /*
         * Kamera tidak pernah dibuat mirror.
         */

        await startCamera();
    }


    /* =====================================================
       LIVE ON / OFF
       ===================================================== */

    function toggleLive() {

        if (liveStarted) {

            stopLive();

        } else {

            startLive();
        }
    }


    /* =====================================================
       START LIVE
       ===================================================== */

    function startLive() {

        liveStarted = true;

        liveSeconds = 0;

        viewers = 1;

        updateLiveButton();

        updateLiveTimer();

        liveTimer =
            setInterval(
                function () {

                    liveSeconds++;

                    updateLiveTimer();

                },
                1000
            );


        startViewerSimulation();

        console.log(
            "🔴 CHUK LIVE STARTED"
        );
    }


    /* =====================================================
       STOP LIVE
       ===================================================== */

    function stopLive() {

        liveStarted = false;

        clearInterval(
            liveTimer
        );

        liveTimer = null;

        stopViewerSimulation();

        updateLiveButton();

        console.log(
            "⏹️ CHUK LIVE STOPPED"
        );
    }


    /* =====================================================
       LIVE TIMER
       ===================================================== */

    function updateLiveTimer() {

        if (!liveTime) {
            return;
        }

        const minutes =
            Math.floor(
                liveSeconds / 60
            );

        const seconds =
            liveSeconds % 60;


        liveTime.textContent =
            String(minutes)
                .padStart(2, "0") +
            ":" +
            String(seconds)
                .padStart(2, "0");
    }


    /* =====================================================
       VIEWER SIMULATION
       ===================================================== */

    function startViewerSimulation() {

        stopViewerSimulation();


        viewerTimer =
            setInterval(
                function () {

                    if (!liveStarted) {
                        return;
                    }

                    const change =
                        Math.random() > .5
                            ? 1
                            : -1;

                    viewers += change;

                    if (viewers < 1) {
                        viewers = 1;
                    }

                    if (viewers > 9999) {
                        viewers = 9999;
                    }

                    updateViewerCount();

                },
                3000
            );
    }


    function stopViewerSimulation() {

        clearInterval(
            viewerTimer
        );

        viewerTimer = null;
    }


    function updateViewerCount() {

        if (!viewerCount) {
            return;
        }

        viewerCount.textContent =
            formatNumber(viewers);
    }


    function formatNumber(number) {

        if (number >= 1000000) {

            return (
                (number / 1000000)
                    .toFixed(1) +
                "M"
            );
        }

        if (number >= 1000) {

            return (
                (number / 1000)
                    .toFixed(1) +
                "K"
            );
        }

        return String(number);
    }


    /* =====================================================
       LIKE
       ===================================================== */

    function addLike() {

        likes++;

        if (likeCount) {

            likeCount.textContent =
                formatNumber(likes);
        }


        if (likeButton) {

            likeButton.animate(
                [
                    {
                        transform:
                            "scale(1)"
                    },

                    {
                        transform:
                            "scale(1.3)"
                    },

                    {
                        transform:
                            "scale(1)"
                    }
                ],
                {
                    duration: 220
                }
            );
        }
    }


    /* =====================================================
       FILTER PANEL
       ===================================================== */

    function openFilterPanel() {

        if (!filterPanel) {
            return;
        }

        filterPanel.classList.add(
            "open"
        );
    }


    function closeFilterPanel() {

        if (!filterPanel) {
            return;
        }

        filterPanel.classList.remove(
            "open"
        );
    }


    function toggleFilterPanel() {

        if (!filterPanel) {
            return;
        }

        if (
            filterPanel.classList.contains(
                "open"
            )
        ) {

            closeFilterPanel();

        } else {

            openFilterPanel();
        }
    }


    /* =====================================================
       DREAM FILTER
       ===================================================== */

    function toggleDreamFilter() {

        if (!dreamFilter) {
            return;
        }


        dreamFilter.enabled =
            true;


        if (dreamLikeButton) {

            dreamLikeButton.classList.add(
                "active"
            );
        }


        /*
         * Setelah filter dipilih,
         * panel otomatis ditutup.
         */

        closeFilterPanel();
    }


    /* =====================================================
       RESET FILTER
       ===================================================== */

    function resetDreamFilter() {

        if (!dreamFilter) {
            return;
        }


        dreamFilter.setSettings(
            DEFAULT_FILTER
        );

        dreamFilter.enabled =
            true;

        dreamFilter.setAutoLight(
            true
        );


        if (plasticRange) {
            plasticRange.value = 90;
        }

        if (glowRange) {
            glowRange.value = 65;
        }

        if (brightnessRange) {
            brightnessRange.value = 35;
        }

        if (softFocusRange) {
            softFocusRange.value = 55;
        }

        if (detailRange) {
            detailRange.value = 25;
        }


        autoLight = true;


        updateFilterLabels();

        updateAutoLightUI();


        if (dreamLikeButton) {

            dreamLikeButton.classList.add(
                "active"
            );
        }


        closeFilterPanel();
    }


    /* =====================================================
       UPDATE FILTER
       ===================================================== */

    function updateFilter(
        name,
        value
    ) {

        const numericValue =
            Number(value);


        if (dreamFilter) {

            dreamFilter.setSetting(
                name,
                numericValue
            );

            dreamFilter.enabled =
                true;
        }


        updateFilterLabels();
    }


    /* =====================================================
       FILTER LABELS
       ===================================================== */

    function updateFilterLabels() {

        if (plasticValue &&
            plasticRange) {

            plasticValue.textContent =
                plasticRange.value +
                "%";
        }

        if (glowValue &&
            glowRange) {

            glowValue.textContent =
                glowRange.value +
                "%";
        }

        if (
            brightnessValue &&
            brightnessRange
        ) {

            brightnessValue.textContent =
                brightnessRange.value +
                "%";
        }

        if (
            softFocusValue &&
            softFocusRange
        ) {

            softFocusValue.textContent =
                softFocusRange.value +
                "%";
        }

        if (
            detailValue &&
            detailRange
        ) {

            detailValue.textContent =
                detailRange.value +
                "%";
        }
    }


    /* =====================================================
       AUTO LIGHT
       ===================================================== */

    function toggleAutoLight() {

        autoLight =
            !autoLight;


        if (dreamFilter) {

            dreamFilter.setAutoLight(
                autoLight
            );
        }


        updateAutoLightUI();
    }


    function updateAutoLightUI() {

        if (autoLightButton) {

            autoLightButton.classList.toggle(
                "active",
                autoLight
            );
        }


        if (autoLightText) {

            autoLightText.textContent =
                autoLight
                    ? "Aktif — menyesuaikan cahaya otomatis"
                    : "Nonaktif — cahaya manual";
        }


        if (lightStatus) {

            lightStatus.textContent =
                autoLight
                    ? "☀️ AUTO LIGHT"
                    : "☀️ MANUAL LIGHT";
        }
    }


    /* =====================================================
       RESIZE FILTER
       ===================================================== */

    function resizeFilter() {

        if (!video || !canvas) {
            return;
        }


        /*
         * Canvas memakai ukuran video asli.
         *
         * CSS akan membuat canvas memenuhi
         * seluruh layar dengan object-fit: cover.
         */

        const width =
            video.videoWidth ||
            720;

        const height =
            video.videoHeight ||
            1280;


        if (
            canvas.width !== width ||
            canvas.height !== height
        ) {

            canvas.width =
                width;

            canvas.height =
                height;
        }


        if (dreamFilter) {

            dreamFilter.resize();
        }
    }


    /* =====================================================
       BUTTON STATES
       ===================================================== */

    function updateButtons() {

        if (cameraButton) {

            cameraButton.innerHTML =
                cameraEnabled
                    ? "📹<small>Kamera</small>"
                    : "🚫<small>Kamera</small>";
        }


        if (micButton) {

            micButton.innerHTML =
                micEnabled
                    ? "🎤<small>Mic</small>"
                    : "🔇<small>Mic</small>";
        }


        updateLiveButton();

        updateAutoLightUI();
    }


    /* =====================================================
       LIVE BUTTON
       ===================================================== */

    function updateLiveButton() {

        if (!startLiveButton) {
            return;
        }


        if (liveStarted) {

            startLiveButton.innerHTML =
                "⏹️<small>Stop Live</small>";

        } else {

            startLiveButton.innerHTML =
                "🔴<small>Mulai Live</small>";
        }
    }


    /* =====================================================
       CAMERA STATUS
       ===================================================== */

    function showCameraStatus(
        message
    ) {

        if (!cameraStatus) {
            return;
        }

        cameraStatus.textContent =
            message;

        cameraStatus.classList.remove(
            "hidden"
        );
    }


    function hideCameraStatus() {

        if (!cameraStatus) {
            return;
        }

        cameraStatus.classList.add(
            "hidden"
        );
    }


    /* =====================================================
       STOP EVERYTHING
       ===================================================== */

    function stopEverything() {

        stopLive();

        stopViewerSimulation();

        if (dreamFilter) {

            dreamFilter.stop();
        }

        stopStream();
    }


    /* =====================================================
       PAGE EXIT
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        function () {

            stopEverything();
        }
    );


    /* =====================================================
       START
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }


})();

Catatan penting bro: di versi ini saya sengaja pakai:

video.style.transform = "none";
canvas.style.transform = "none";

Jadi kamera benar-benar non-mirror. Kalau tangan asli bergerak 👉 ke kanan, di layar juga bergerak 👉 ke kanan.

Dan bagian kamera memakai:

width: { ideal: 1280 },
height: { ideal: 720 }

bukan dipaksa "720 × 1280", supaya HP yang punya sensor kamera landscape tidak menghasilkan efek zoom/crop yang aneh. CSS "cover" yang mengatur supaya hasil akhirnya tetap memenuhi layar portrait.
