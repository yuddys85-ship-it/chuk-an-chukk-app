/* =========================================================
   CHUK AN CHUKK
   LIVE.JS
   CAMERA + MIC + FLIP + LIVE + FILTER
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       DOM
       ===================================================== */

    const video = document.getElementById("camera");
    const canvas = document.getElementById("filterCanvas");

    const cameraStatus =
        document.getElementById("cameraStatus");

    const lightStatus =
        document.getElementById("lightStatus");

    const viewerCount =
        document.getElementById("viewerCount");

    const liveTime =
        document.getElementById("liveTime");

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

    const dreamLikeButton =
        document.getElementById("dreamLikeButton");

    const resetFilter =
        document.getElementById("resetFilter");

    const autoLightButton =
        document.getElementById("autoLightButton");

    const autoLightText =
        document.getElementById("autoLightText");

    const likeButton =
        document.getElementById("likeButton");


    /* =====================================================
       STATE
       ===================================================== */

    let stream = null;

    let facingMode = "user";

    let cameraEnabled = true;

    let micEnabled = true;

    let liveStarted = false;

    let liveSeconds = 0;

    let liveTimer = null;

    let viewerTimer = null;

    let viewers = 0;

    let likes = 0;

    let autoLight = true;

    let filterEnabled = false;

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

    document.addEventListener(
        "DOMContentLoaded",
        init
    );


    function init() {

        console.log(
            "🚀 CHUK AN CHUKK LIVE START"
        );


        if (!video) {

            console.error(
                "❌ Element #camera tidak ditemukan"
            );

            return;
        }


        setupButtons();

        setupSliders();

        setupFilter();

        setupVideoEvents();

        resizeCanvas();

        startCamera();

    }


    /* =====================================================
       BUTTON EVENTS
       ===================================================== */

    function setupButtons() {

        if (closeLive) {

            closeLive.addEventListener(
                "click",
                closeLivePage
            );

        }


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


        if (dreamLikeButton) {

            dreamLikeButton.addEventListener(
                "click",
                enableDreamLike
            );

        }


        if (resetFilter) {

            resetFilter.addEventListener(
                "click",
                resetBeautyFilter
            );

        }


        if (autoLightButton) {

            autoLightButton.addEventListener(
                "click",
                toggleAutoLight
            );

        }


        if (likeButton) {

            likeButton.addEventListener(
                "click",
                addLike
            );

        }


        window.addEventListener(
            "resize",
            resizeCanvas
        );


        window.addEventListener(
            "orientationchange",
            function () {

                setTimeout(
                    resizeCanvas,
                    300
                );

            }
        );


        document.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Escape") {

                    closeFilterPanel();

                }

            }
        );

    }


    /* =====================================================
       FILTER SETUP
       ===================================================== */

    function setupFilter() {

        canvas.style.display = "none";

        if (
            typeof window.DreamLikePlastic !==
            "function"
        ) {

            console.warn(
                "⚠️ dream-like-filter.js tidak tersedia"
            );

            return;
        }


        try {

            dreamFilter =
                new window.DreamLikePlastic(
                    video,
                    canvas
                );


            dreamFilter.setSettings(
                DEFAULT_FILTER
            );


            if (
                typeof dreamFilter.setAutoLight ===
                "function"
            ) {

                dreamFilter.setAutoLight(
                    autoLight
                );

            }


            console.log(
                "✅ DreamLikePlastic siap"
            );

        } catch (error) {

            console.error(
                "❌ Filter gagal dibuat:",
                error
            );

            dreamFilter = null;

        }

    }


    /* =====================================================
       VIDEO EVENTS
       ===================================================== */

    function setupVideoEvents() {

        video.addEventListener(
            "loadedmetadata",
            function () {

                console.log(
                    "🎥 Camera resolution:",
                    video.videoWidth,
                    "x",
                    video.videoHeight
                );

                resizeCanvas();

            }
        );


        video.addEventListener(
            "canplay",
            function () {

                hideCameraStatus();

                tryPlayVideo();

            }
        );


        video.addEventListener(
            "playing",
            function () {

                hideCameraStatus();

            }
        );

    }


    /* =====================================================
       START CAMERA
       ===================================================== */

    async function startCamera() {

        console.log(
            "📷 Memulai kamera:",
            facingMode
        );


        showCameraStatus(
            "📷 Meminta izin kamera..."
        );


        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            showCameraStatus(
                "❌ Browser tidak mendukung kamera"
            );

            console.error(
                "getUserMedia tidak tersedia"
            );

            return;

        }


        stopCurrentStream();


        const constraints = {

            video: {

                facingMode: {
                    ideal: facingMode
                },

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

        };


        try {

            stream =
                await navigator.mediaDevices
                    .getUserMedia(
                        constraints
                    );


            console.log(
                "✅ getUserMedia berhasil"
            );


            video.srcObject = stream;

            video.muted = true;

            video.autoplay = true;

            video.playsInline = true;


            /*
               PENTING:
               Jangan mirror kamera.
               Gerak kanan = terlihat kanan.
            */

            video.style.transform = "none";

            canvas.style.transform = "none";


            updateTrackStates();


            tryPlayVideo();


            video.onloadedmetadata =
                function () {

                    console.log(
                        "📐 Video:",
                        video.videoWidth,
                        "x",
                        video.videoHeight
                    );


                    resizeCanvas();

                    hideCameraStatus();


                    if (
                        dreamFilter &&
                        filterEnabled
                    ) {

                        startFilter();

                    }

                };


            setTimeout(
                function () {

                    if (
                        video.readyState >= 2
                    ) {

                        hideCameraStatus();

                    }

                },
                2500
            );


        } catch (error) {

            console.error(
                "❌ Kamera error:",
                error
            );


            handleCameraError(
                error
            );

        }

    }


    /* =====================================================
       PLAY VIDEO
       ===================================================== */

    function tryPlayVideo() {

        if (!video) {
            return;
        }


        const promise =
            video.play();


        if (
            promise &&
            typeof promise.catch ===
            "function"
        ) {

            promise.catch(
                function (error) {

                    console.warn(
                        "Video play menunggu gesture:",
                        error
                    );

                    showCameraStatus(
                        "📷 Tekan Kamera untuk mengaktifkan"
                    );

                }
            );

        }

    }


    /* =====================================================
       CAMERA ERROR
       ===================================================== */

    function handleCameraError(error) {

        let message =
            "❌ Kamera tidak dapat digunakan";


        switch (error.name) {

            case "NotAllowedError":

            case "PermissionDeniedError":

                message =
                    "❌ Izin kamera ditolak. Izinkan kamera untuk CHUK.";

                break;


            case "NotFoundError":

                message =
                    "❌ Kamera tidak ditemukan.";

                break;


            case "NotReadableError":

                message =
                    "❌ Kamera sedang digunakan aplikasi lain.";

                break;


            case "OverconstrainedError":

                message =
                    "❌ Mode kamera tidak tersedia.";

                break;


            case "SecurityError":

                message =
                    "❌ Kamera membutuhkan HTTPS.";

                break;

        }


        showCameraStatus(
            message
        );

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
            .forEach(
                function (track) {

                    track.stop();

                }
            );


        stream = null;

        video.srcObject = null;

    }


    /* =====================================================
       CAMERA TOGGLE
       ===================================================== */

    async function toggleCamera() {

        if (!stream) {

            cameraEnabled = true;

            await startCamera();

            return;

        }


        const tracks =
            stream.getVideoTracks();


        cameraEnabled =
            !cameraEnabled;


        tracks.forEach(
            function (track) {

                track.enabled =
                    cameraEnabled;

            }
        );


        if (cameraEnabled) {

            cameraButton.innerHTML =
                "📹<small>Kamera</small>";

            hideCameraStatus();

        } else {

            cameraButton.innerHTML =
                "🚫<small>Kamera OFF</small>";

            showCameraStatus(
                "📷 Kamera OFF"
            );

            stopFilter();

        }

    }


    /* =====================================================
       MICROPHONE
       ===================================================== */

    function toggleMic() {

        if (!stream) {
            return;
        }


        const tracks =
            stream.getAudioTracks();


        micEnabled =
            !micEnabled;


        tracks.forEach(
            function (track) {

                track.enabled =
                    micEnabled;

            }
        );


        if (micEnabled) {

            micButton.innerHTML =
                "🎤<small>Mic</small>";

        } else {

            micButton.innerHTML =
                "🔇<small>Mic OFF</small>";

        }

    }


    /* =====================================================
       FLIP CAMERA
       ===================================================== */

    async function flipCamera() {

        facingMode =
            facingMode === "user"
                ? "environment"
                : "user";


        console.log(
            "🔄 Flip:",
            facingMode
        );


        showCameraStatus(
            "🔄 Mengganti kamera..."
        );


        await startCamera();

    }


    /* =====================================================
       CANVAS
       ===================================================== */

    function resizeCanvas() {

        if (!canvas) {
            return;
        }


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

            canvas.width = width;

            canvas.height = height;

        }


        if (
            dreamFilter &&
            typeof dreamFilter.resize ===
            "function"
        ) {

            try {

                dreamFilter.resize();

            } catch (error) {

                console.warn(
                    "Filter resize error:",
                    error
                );

            }

        }

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


    function closeFilterPanel() {

        if (!filterPanel) {
            return;
        }


        filterPanel.classList.remove(
            "open"
        );

    }


    /* =====================================================
       DREAM LIKE
       ===================================================== */

    function enableDreamLike() {

        filterEnabled = true;


        if (dreamLikeButton) {

            dreamLikeButton.classList.add(
                "active"
            );

        }


        canvas.style.display =
            "block";


        startFilter();


        /*
           Setelah memilih filter,
           panel langsung ditutup.
        */

        closeFilterPanel();

    }


    /* =====================================================
       START FILTER
       ===================================================== */

    function startFilter() {

        if (
            !dreamFilter ||
            !cameraEnabled
        ) {

            return;

        }


        try {

            if (
                typeof dreamFilter.start ===
                "function"
            ) {

                dreamFilter.start();

            }

        } catch (error) {

            console.error(
                "Filter start error:",
                error
            );

            /*
               Kalau filter error,
               kamera tetap hidup.
            */

            filterEnabled = false;

            canvas.style.display =
                "none";

        }

    }


    /* =====================================================
       STOP FILTER
       ===================================================== */

    function stopFilter() {

        if (
            dreamFilter &&
            typeof dreamFilter.stop ===
            "function"
        ) {

            try {

                dreamFilter.stop();

            } catch (error) {

                console.warn(
                    "Filter stop error:",
                    error
                );

            }

        }


        canvas.style.display =
            "none";

    }


    /* =====================================================
       RESET FILTER
       ===================================================== */

    function resetBeautyFilter() {

        filterEnabled = false;


        if (dreamFilter) {

            try {

                dreamFilter.setSettings(
                    DEFAULT_FILTER
                );

            } catch (error) {

                console.warn(
                    "Reset filter error:",
                    error
                );

            }

        }


        updateSliderValue(
            "plasticRange",
            "plasticValue"
        );

        updateSliderValue(
            "glowRange",
            "glowValue"
        );

        updateSliderValue(
            "brightnessRange",
            "brightnessValue"
        );

        updateSliderValue(
            "softFocusRange",
            "softFocusValue"
        );

        updateSliderValue(
            "detailRange",
            "detailValue"
        );


        canvas.style.display =
            "none";


        if (dreamLikeButton) {

            dreamLikeButton.classList.remove(
                "active"
            );

        }


        closeFilterPanel();

    }


    /* =====================================================
       SLIDERS
       ===================================================== */

    function setupSliders() {

        const sliders = [

            [
                "plasticRange",
                "plasticValue",
                "plastic"
            ],

            [
                "glowRange",
                "glowValue",
                "glow"
            ],

            [
                "brightnessRange",
                "brightnessValue",
                "brightness"
            ],

            [
                "softFocusRange",
                "softFocusValue",
                "softFocus"
            ],

            [
                "detailRange",
                "detailValue",
                "detail"
            ]

        ];


        sliders.forEach(
            function (item) {

                const input =
                    document.getElementById(
                        item[0]
                    );

                const output =
                    document.getElementById(
                        item[1]
                    );


                if (!input) {
                    return;
                }


                input.addEventListener(
                    "input",
                    function () {

                        const value =
                            Number(
                                input.value
                            );


                        if (output) {

                            output.textContent =
                                value + "%";

                        }


                        if (
                            dreamFilter &&
                            typeof dreamFilter.setSetting ===
                            "function"
                        ) {

                            try {

                                dreamFilter.setSetting(
                                    item[2],
                                    value
                                );

                            } catch (error) {

                                console.warn(
                                    "Slider filter error:",
                                    error
                                );

                            }

                        }


                        if (!filterEnabled) {

                            filterEnabled =
                                true;

                            canvas.style.display =
                                "block";

                            startFilter();

                        }

                    }
                );

            }
        );

    }


    function updateSliderValue(
        inputId,
        outputId
    ) {

        const input =
            document.getElementById(
                inputId
            );

        const output =
            document.getElementById(
                outputId
            );


        if (
            input &&
            output
        ) {

            output.textContent =
                input.value + "%";

        }

    }


    /* =====================================================
       AUTO LIGHT
       ===================================================== */

    function toggleAutoLight() {

        autoLight =
            !autoLight;


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


        if (
            dreamFilter &&
            typeof dreamFilter.setAutoLight ===
            "function"
        ) {

            try {

                dreamFilter.setAutoLight(
                    autoLight
                );

            } catch (error) {

                console.warn(
                    "Auto light error:",
                    error
                );

            }

        }


        if (lightStatus) {

            lightStatus.textContent =
                autoLight
                    ? "☀️ AUTO LIGHT"
                    : "☀️ MANUAL LIGHT";

        }

    }


    /* =====================================================
       LIVE
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

            showCameraStatus(
                "📷 Kamera belum aktif"
            );

            return;

        }


        liveStarted = true;

        liveSeconds = 0;

        viewers = 1;


        if (startLiveButton) {

            startLiveButton.innerHTML =
                "⏹️<small>Stop Live</small>";

        }


        updateLiveTime();

        updateViewerCount();


        clearInterval(
            liveTimer
        );

        clearInterval(
            viewerTimer
        );


        liveTimer =
            setInterval(
                function () {

                    liveSeconds++;

                    updateLiveTime();

                },
                1000
            );


        viewerTimer =
            setInterval(
                function () {

                    /*
                       Simulasi viewer lokal.
                       Belum streaming ke user lain.
                    */

                    viewers =
                        Math.max(
                            1,
                            viewers +
                            Math.floor(
                                Math.random() * 3
                            ) - 1
                        );


                    updateViewerCount();

                },
                3000
            );


        console.log(
            "🔴 LIVE STARTED"
        );

    }


    function stopLive() {

        liveStarted = false;


        clearInterval(
            liveTimer
        );

        clearInterval(
            viewerTimer
        );


        liveTimer = null;

        viewerTimer = null;


        if (startLiveButton) {

            startLiveButton.innerHTML =
                "🔴<small>Mulai Live</small>";

        }


        console.log(
            "⏹️ LIVE STOPPED"
        );

    }


    /* =====================================================
       LIVE TIMER
       ===================================================== */

    function updateLiveTime() {

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
            String(minutes).padStart(
                2,
                "0"
            )
            +
            ":"
            +
            String(seconds).padStart(
                2,
                "0"
            );

    }


    /* =====================================================
       VIEWERS
       ===================================================== */

    function updateViewerCount() {

        if (viewerCount) {

            viewerCount.textContent =
                viewers;

        }

    }


    /* =====================================================
       LIKE
       ===================================================== */

    function addLike() {

        likes++;


        if (likeCount) {

            likeCount.textContent =
                likes;

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
                            "scale(1.35)"
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
       TRACK STATUS
       ===================================================== */

    function updateTrackStates() {

        if (!stream) {
            return;
        }


        const videoTracks =
            stream.getVideoTracks();


        const audioTracks =
            stream.getAudioTracks();


        if (videoTracks.length) {

            cameraEnabled =
                videoTracks[0].enabled;

        }


        if (audioTracks.length) {

            micEnabled =
                audioTracks[0].enabled;

        }

    }


    /* =====================================================
       STATUS
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
       CLOSE
       ===================================================== */

    function closeLivePage() {

        stopLive();

        stopFilter();

        stopCurrentStream();


        window.location.href =
            "index.html";

    }


    /* =====================================================
       CLEANUP
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        function () {

            stopLive();

            stopFilter();

            stopCurrentStream();

        }
    );


})();
