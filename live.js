/* =========================================================
   CHUK AN CHUKK
   LIVE.JS
   LIVE CAMERA + MIC + FLIP + TIMER + FILTER
   ANTI ZOOM / ANTI DISTORTION
   ========================================================= */

(() => {

    "use strict";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const video =
        document.getElementById("camera");

    const canvas =
        document.getElementById("filterCanvas");

    const cameraStatus =
        document.getElementById("cameraStatus");

    const lightStatus =
        document.getElementById("lightStatus");

    const liveTime =
        document.getElementById("liveTime");

    const viewerCount =
        document.getElementById("viewerCount");

    const likeButton =
        document.getElementById("likeButton");

    const likeCount =
        document.getElementById("likeCount");

    const closeLive =
        document.getElementById("closeLive");

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

    let timerInterval = null;

    let likeTotal = 0;

    let viewerTotal = 1;

    let autoLightEnabled = true;

    let renderFrame = null;


    /* =====================================================
       DREAM FILTER
    ===================================================== */

    let dreamFilter = null;


    /* =====================================================
       DEFAULT FILTER SETTINGS
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
       INITIALIZE
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        initializeLive
    );


    async function initializeLive() {

        console.log(
            "🎥 CHUK AN CHUKK LIVE starting..."
        );


        /* ---------------------------------------------
           FILTER ENGINE
        --------------------------------------------- */

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
                autoLightEnabled
            );

        }


        /* ---------------------------------------------
           BUTTON EVENTS
        --------------------------------------------- */

        closeLive?.addEventListener(
            "click",
            closeLivePage
        );

        cameraButton?.addEventListener(
            "click",
            toggleCamera
        );

        micButton?.addEventListener(
            "click",
            toggleMic
        );

        startLiveButton?.addEventListener(
            "click",
            toggleLive
        );

        flipButton?.addEventListener(
            "click",
            flipCamera
        );

        filterButton?.addEventListener(
            "click",
            toggleFilterPanel
        );

        resetFilter?.addEventListener(
            "click",
            resetDreamFilter
        );

        dreamLikeButton?.addEventListener(
            "click",
            toggleDreamFilter
        );

        likeButton?.addEventListener(
            "click",
            sendLike
        );

        autoLightButton?.addEventListener(
            "click",
            toggleAutoLight
        );


        /* ---------------------------------------------
           FILTER SLIDERS
        --------------------------------------------- */

        bindFilterRange(
            plasticRange,
            plasticValue,
            "plastic"
        );

        bindFilterRange(
            glowRange,
            glowValue,
            "glow"
        );

        bindFilterRange(
            brightnessRange,
            brightnessValue,
            "brightness"
        );

        bindFilterRange(
            softFocusRange,
            softFocusValue,
            "softFocus"
        );

        bindFilterRange(
            detailRange,
            detailValue,
            "detail"
        );


        /* ---------------------------------------------
           WINDOW RESIZE
        --------------------------------------------- */

        window.addEventListener(
            "resize",
            resizeFilter
        );

        window.addEventListener(
            "orientationchange",
            () => {

                setTimeout(
                    resizeFilter,
                    250
                );

            }
        );


        /* ---------------------------------------------
           START CAMERA
        --------------------------------------------- */

        await startCamera();


        /* ---------------------------------------------
           VIEWER SIMULATION
           Placeholder sampai backend
        --------------------------------------------- */

        startViewerSimulation();


        console.log(
            "✅ CHUK LIVE ready"
        );

    }


    /* =====================================================
       START CAMERA
    ===================================================== */

    async function startCamera() {

        try {

            stopCurrentStream();

            cameraStatus.textContent =
                "📷 Meminta izin kamera...";


            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                throw new Error(
                    "Browser tidak mendukung kamera."
                );

            }


            stream =
                await navigator.mediaDevices.getUserMedia({

                    video: {
                        facingMode:
                            currentFacingMode,

                        width: {
                            ideal: 720
                        },

                        height: {
                            ideal: 1280
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


            cameraStatus.textContent =
                "🟢 Kamera siap";


            setTimeout(() => {

                if (cameraStatus) {

                    cameraStatus.classList.add(
                        "hidden"
                    );

                }

            }, 1800);


            resizeFilter();


            if (dreamFilter) {

                dreamFilter.start();

            }


            updateCameraButtons();

        } catch (error) {

            console.error(
                "Camera error:",
                error
            );


            cameraStatus.textContent =
                "❌ Kamera tidak dapat digunakan";

            cameraStatus.classList.remove(
                "hidden"
            );


            showCameraHelp(error);

        }

    }


    /* =====================================================
       STOP STREAM
    ===================================================== */

    function stopCurrentStream() {

        if (!stream) {
            return;
        }


        stream
            .getTracks()
            .forEach(track => {

                track.stop();

            });


        stream = null;

    }


    /* =====================================================
       CAMERA TOGGLE
    ===================================================== */

    function toggleCamera() {

        if (!stream) {
            return;
        }


        const tracks =
            stream.getVideoTracks();


        tracks.forEach(track => {

            track.enabled =
                !cameraEnabled;

        });


        cameraEnabled =
            !cameraEnabled;


        updateCameraButtons();


        if (!cameraEnabled) {

            cameraStatus.textContent =
                "📷 Kamera dimatikan";

            cameraStatus.classList.remove(
                "hidden"
            );

        } else {

            cameraStatus.textContent =
                "🟢 Kamera aktif";

            setTimeout(() => {

                cameraStatus.classList.add(
                    "hidden"
                );

            }, 1200);

        }

    }


    /* =====================================================
       MIC TOGGLE
    ===================================================== */

    function toggleMic() {

        if (!stream) {
            return;
        }


        const tracks =
            stream.getAudioTracks();


        tracks.forEach(track => {

            track.enabled =
                !micEnabled;

        });


        micEnabled =
            !micEnabled;


        updateMicButton();

    }


    /* =====================================================
       FLIP CAMERA
    ===================================================== */

    async function flipCamera() {

        currentFacingMode =
            currentFacingMode === "user"
                ? "environment"
                : "user";


        cameraStatus.classList.remove(
            "hidden"
        );


        cameraStatus.textContent =
            "🔄 Mengganti kamera...";


        await startCamera();

    }


    /* =====================================================
       START / STOP LIVE
    ===================================================== */

    function toggleLive() {

        if (liveStarted) {

            stopLive();

        } else {

            startLive();

        }

    }


    function startLive() {

        if (!stream) {

            alert(
                "Kamera belum siap."
            );

            return;

        }


        liveStarted =
            true;

        liveSeconds =
            0;


        startTimer();


        startLiveButton.classList.add(
            "is-live"
        );


        startLiveButton.innerHTML =
            "⏹️<small>Stop Live</small>";


        /* ---------------------------------------------
           Placeholder viewer
        --------------------------------------------- */

        viewerTotal =
            Math.max(
                1,
                viewerTotal
            );


        viewerCount.textContent =
            viewerTotal;


        console.log(
            "🔴 LIVE STARTED"
        );

    }


    function stopLive() {

        liveStarted =
            false;


        stopTimer();


        startLiveButton.classList.remove(
            "is-live"
        );


        startLiveButton.innerHTML =
            "🔴<small>Mulai Live</small>";


        console.log(
            "⏹️ LIVE STOPPED"
        );

    }


    /* =====================================================
       LIVE TIMER
    ===================================================== */

    function startTimer() {

        stopTimer();


        timerInterval =
            setInterval(() => {

                liveSeconds++;

                updateLiveTime();

            }, 1000);

    }


    function stopTimer() {

        if (timerInterval) {

            clearInterval(
                timerInterval
            );

            timerInterval = null;

        }

    }


    function updateLiveTime() {

        const minutes =
            Math.floor(
                liveSeconds / 60
            );

        const seconds =
            liveSeconds % 60;


        const mm =
            String(minutes)
                .padStart(2, "0");

        const ss =
            String(seconds)
                .padStart(2, "0");


        if (liveTime) {

            liveTime.textContent =
                `${mm}:${ss}`;

        }

    }


    /* =====================================================
       LIKE
    ===================================================== */

    function sendLike() {

        likeTotal++;


        if (likeCount) {

            likeCount.textContent =
                formatNumber(likeTotal);

        }


        likeButton.classList.add(
            "liked"
        );


        setTimeout(() => {

            likeButton.classList.remove(
                "liked"
            );

        }, 300);

    }


    /* =====================================================
       VIEWER SIMULATION
       TEMPORARY UNTIL BACKEND LIVE
    ===================================================== */

    function startViewerSimulation() {

        viewerTotal =
            Math.floor(
                Math.random() * 8
            ) + 1;


        viewerCount.textContent =
            viewerTotal;


        setInterval(() => {

            if (!liveStarted) {
                return;
            }


            const change =
                Math.random() > 0.65
                    ? 1
                    : 0;


            viewerTotal +=
                change;


            viewerCount.textContent =
                viewerTotal;

        }, 8000);

    }


    /* =====================================================
       FILTER PANEL
    ===================================================== */

    function toggleFilterPanel() {

        if (!filterPanel) {
            return;
        }


        filterPanel.classList.toggle(
            "open"
        );

    }


    function toggleDreamFilter() {

        if (!dreamFilter) {
            return;
        }


        const active =
            dreamFilter.enabled;


        dreamFilter.enabled =
            !active;


        dreamLikeButton.classList.toggle(
            "active",
            !active
        );

    }


    function resetDreamFilter() {

        plasticRange.value =
            DEFAULT_FILTER.plastic;

        glowRange.value =
            DEFAULT_FILTER.glow;

        brightnessRange.value =
            DEFAULT_FILTER.brightness;

        softFocusRange.value =
            DEFAULT_FILTER.softFocus;

        detailRange.value =
            DEFAULT_FILTER.detail;


        updateRangeLabel(
            plasticRange,
            plasticValue
        );

        updateRangeLabel(
            glowRange,
            glowValue
        );

        updateRangeLabel(
            brightnessRange,
            brightnessValue
        );

        updateRangeLabel(
            softFocusRange,
            softFocusValue
        );

        updateRangeLabel(
            detailRange,
            detailValue
        );


        if (dreamFilter) {

            dreamFilter.setSettings(
                DEFAULT_FILTER
            );

            dreamFilter.enabled =
                true;

        }


        dreamLikeButton?.classList.add(
            "active"
        );

    }


    /* =====================================================
       FILTER RANGE
    ===================================================== */

    function bindFilterRange(
        range,
        output,
        setting
    ) {

        if (!range) {
            return;
        }


        range.addEventListener(
            "input",
            () => {

                const value =
                    Number(
                        range.value
                    );


                if (output) {

                    output.textContent =
                        `${value}%`;

                }


                if (dreamFilter) {

                    dreamFilter.setSetting(
                        setting,
                        value
                    );

                }

            }
        );

    }


    function updateRangeLabel(
        range,
        output
    ) {

        if (
            range &&
            output
        ) {

            output.textContent =
                `${range.value}%`;

        }

    }


    /* =====================================================
       AUTO LIGHT
    ===================================================== */

    function toggleAutoLight() {

        autoLightEnabled =
            !autoLightEnabled;


        autoLightButton?.classList.toggle(
            "active",
            autoLightEnabled
        );


        if (autoLightText) {

            autoLightText.textContent =
                autoLightEnabled
                    ? "Aktif — menyesuaikan cahaya otomatis"
                    : "Nonaktif — cahaya manual";

        }


        if (dreamFilter) {

            dreamFilter.setAutoLight(
                autoLightEnabled
            );

        }


        updateLightStatus();

    }


    function updateLightStatus() {

        if (!lightStatus) {
            return;
        }


        if (!autoLightEnabled) {

            lightStatus.textContent =
                "☀️ AUTO LIGHT OFF";

            return;

        }


        lightStatus.textContent =
            "☀️🌙 AUTO LIGHT";

    }


    /* =====================================================
       RESIZE FILTER
       ANTI ZOOM
    ===================================================== */

    function resizeFilter() {

        if (!canvas) {
            return;
        }


        const width =
            video.videoWidth ||
            window.innerWidth;


        const height =
            video.videoHeight ||
            window.innerHeight;


        if (
            width <= 0 ||
            height <= 0
        ) {
            return;
        }


        /*
         * Canvas mengikuti rasio asli kamera.
         * Ini penting agar wajah tidak ter-zoom
         * atau melebar.
         */

        canvas.width =
            width;

        canvas.height =
            height;


        if (dreamFilter) {

            dreamFilter.resize();

        }

    }


    /* =====================================================
       BUTTON STATES
    ===================================================== */

    function updateCameraButtons() {

        if (!cameraButton) {
            return;
        }


        cameraButton.classList.toggle(
            "off",
            !cameraEnabled
        );


        cameraButton.innerHTML =
            cameraEnabled
                ? "📹<small>Kamera</small>"
                : "🚫<small>Kamera</small>";

    }


    function updateMicButton() {

        if (!micButton) {
            return;
        }


        micButton.classList.toggle(
            "off",
            !micEnabled
        );


        micButton.innerHTML =
            micEnabled
                ? "🎤<small>Mic</small>"
                : "🔇<small>Mic</small>";

    }


    /* =====================================================
       CLOSE LIVE
    ===================================================== */

    function closeLivePage() {

        if (liveStarted) {

            const confirmClose =
                confirm(
                    "Live masih berjalan. Tutup Live?"
                );


            if (!confirmClose) {
                return;
            }

        }


        liveStarted =
            false;


        stopTimer();


        if (dreamFilter) {

            dreamFilter.stop();

        }


        stopCurrentStream();


        window.location.href =
            "index.html";

    }


    /* =====================================================
       CAMERA ERROR HELP
    ===================================================== */

    function showCameraHelp(error) {

        let message =
            "❌ Kamera tidak tersedia.";


        if (
            error &&
            error.name ===
            "NotAllowedError"
        ) {

            message =
                "🔒 Izin kamera ditolak. Izinkan kamera di Pi Browser.";

        }


        if (
            error &&
            error.name ===
            "NotFoundError"
        ) {

            message =
                "📷 Kamera tidak ditemukan.";

        }


        if (
            error &&
            error.name ===
            "NotReadableError"
        ) {

            message =
                "⚠️ Kamera sedang digunakan aplikasi lain.";

        }


        cameraStatus.textContent =
            message;

        cameraStatus.classList.remove(
            "hidden"
        );

    }


    /* =====================================================
       NUMBER FORMAT
    ===================================================== */

    function formatNumber(number) {

        return new Intl.NumberFormat(
            "id-ID"
        ).format(number);

    }


    /* =====================================================
       PAGE CLEANUP
    ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            stopTimer();

            if (dreamFilter) {

                dreamFilter.stop();

            }

            stopCurrentStream();

        }
    );


})();
