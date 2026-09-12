/* =========================================================
   CHUK AN CHUKK
   LIVE.JS
   TIKTOK STYLE LIVE CAMERA
   ========================================================= */

(function () {

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

    const viewerCount =
        document.getElementById("viewerCount");

    const likeCount =
        document.getElementById("likeCount");

    const liveTimer =
        document.getElementById("liveTimer");

    const startLiveButton =
        document.getElementById("startLiveButton");

    const startLiveText =
        document.getElementById("startLiveText");

    const cameraButton =
        document.getElementById("cameraButton");

    const cameraIcon =
        document.getElementById("cameraIcon");

    const cameraText =
        document.getElementById("cameraText");

    const micButton =
        document.getElementById("micButton");

    const micIcon =
        document.getElementById("micIcon");

    const micText =
        document.getElementById("micText");

    const flipButton =
        document.getElementById("flipButton");

    const bottomFlipButton =
        document.getElementById("bottomFlipButton");

    const bottomMicButton =
        document.getElementById("bottomMicButton");

    const filterButton =
        document.getElementById("filterButton");

    const bottomFilterButton =
        document.getElementById("bottomFilterButton");

    const filterPanel =
        document.getElementById("filterPanel");

    const closeFilterButton =
        document.getElementById("closeFilterButton");

    const dreamLikeButton =
        document.getElementById("dreamLikeButton");

    const autoLightButton =
        document.getElementById("autoLightButton");

    const commentsList =
        document.getElementById("commentsList");

    const commentInputArea =
        document.getElementById("commentInputArea");

    const commentInput =
        document.getElementById("commentInput");

    const sendCommentButton =
        document.getElementById("sendCommentButton");

    const commentButton =
        document.getElementById("commentButton");

    const likeButton =
        document.getElementById("likeButton");

    const closeLiveButton =
        document.getElementById("closeLiveButton");

    const followButton =
        document.getElementById("followButton");


    /* =====================================================
       STATE
       ===================================================== */

    let stream = null;

    let facingMode = "user";

    let cameraEnabled = true;

    let micEnabled = true;

    let liveStarted = false;

    let filterEnabled = false;

    let autoLight = true;

    let likes = 0;

    let viewers = 0;

    let liveSeconds = 0;

    let liveTimerInterval = null;

    let viewerTimerInterval = null;

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
       UTILITY
       ===================================================== */

    function safeText(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       CAMERA STATUS
       ===================================================== */

    function setCameraStatus(message) {

        if (!cameraStatus) {
            return;
        }

        cameraStatus.textContent = message;

    }


    /* =====================================================
       INITIALIZE FILTER
       ===================================================== */

    function setupFilter() {

        if (
            typeof window.DreamLikePlastic !==
            "function"
        ) {

            console.warn(
                "DreamLikePlastic tidak ditemukan"
            );

            return;

        }


        dreamFilter =
            new window.DreamLikePlastic(
                video,
                canvas
            );


        dreamFilter.setSettings(
            DEFAULT_FILTER
        );


        dreamFilter.setAutoLight(
            autoLight
        );


        /*
         * Canvas langsung menjadi display kamera.
         */

        canvas.style.display = "block";


        resizeCanvas();


        dreamFilter.start();


        console.log(
            "✅ DreamLikePlastic initialized"
        );

    }


    /* =====================================================
       RESIZE CANVAS
       ===================================================== */

    function resizeCanvas() {

        if (!canvas) {
            return;
        }


        const width =
            window.innerWidth ||
            720;

        const height =
            window.innerHeight ||
            1280;


        if (dreamFilter) {

            dreamFilter.resize(
                width,
                height
            );

        }

    }


    /* =====================================================
       START CAMERA
       ===================================================== */

    async function startCamera() {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            setCameraStatus(
                "Browser tidak mendukung kamera."
            );

            return false;

        }


        /*
         * Hentikan stream lama.
         */

        stopCurrentStream();


        setCameraStatus(
            "Meminta izin kamera dan microphone..."
        );


        try {

            stream =
                await navigator.mediaDevices.getUserMedia({

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

                    audio: {

                        echoCancellation: true,

                        noiseSuppression: true,

                        autoGainControl: true

                    }

                });


            /*
             * Video adalah SOURCE saja.
             * Tidak digunakan sebagai display.
             */

            video.srcObject =
                stream;

            video.autoplay =
                true;

            video.muted =
                true;

            video.playsInline =
                true;


            /*
             * Pastikan video TIDAK diberi transform.
             */

            video.style.transform =
                "none";

            video.style.webkitTransform =
                "none";


            /*
             * Canvas menjadi display utama.
             */

            canvas.style.display =
                "block";


            /*
             * Tunggu video siap.
             */

            await waitForVideo();


            try {

                await video.play();

            } catch (playError) {

                console.warn(
                    "Video autoplay:",
                    playError
                );

            }


            cameraEnabled = true;

            setCameraStatus(
                "Kamera aktif"
            );


            /*
             * Sinkronkan audio.
             */

            updateMicTracks();


            /*
             * Resize Canvas.
             */

            resizeCanvas();


            /*
             * Update informasi track.
             */

            const videoTrack =
                stream.getVideoTracks()[0];

            const audioTrack =
                stream.getAudioTracks()[0];


            console.log(
                "📷 Camera:",
                videoTrack
                    ? videoTrack.label
                    : "unknown"
            );


            console.log(
                "🎤 Audio:",
                audioTrack
                    ? audioTrack.label
                    : "unknown"
            );


            console.log(
                "📐 Video:",
                video.videoWidth,
                "x",
                video.videoHeight
            );


            return true;

        } catch (error) {

            console.error(
                "Camera error:",
                error
            );


            handleCameraError(
                error
            );


            return false;

        }

    }


    /* =====================================================
       WAIT VIDEO
       ===================================================== */

    function waitForVideo() {

        return new Promise(
            resolve => {

                if (
                    video.readyState >= 2 &&
                    video.videoWidth > 0
                ) {

                    resolve();

                    return;

                }


                const timeout =
                    setTimeout(
                        resolve,
                        5000
                    );


                video.onloadedmetadata =
                    () => {

                        clearTimeout(
                            timeout
                        );

                        resolve();

                    };

            }
        );

    }


    /* =====================================================
       CAMERA ERROR
       ===================================================== */

    function handleCameraError(error) {

        let message =
            "Kamera tidak dapat digunakan.";


        if (
            error &&
            error.name ===
            "NotAllowedError"
        ) {

            message =
                "Izin kamera/microphone ditolak.";

        } else if (
            error &&
            error.name ===
            "NotFoundError"
        ) {

            message =
                "Kamera atau microphone tidak ditemukan.";

        } else if (
            error &&
            error.name ===
            "NotReadableError"
        ) {

            message =
                "Kamera sedang digunakan aplikasi lain.";

        } else if (
            error &&
            error.name ===
            "OverconstrainedError"
        ) {

            message =
                "Mode kamera tidak tersedia.";

        }


        setCameraStatus(
            message
        );

    }


    /* =====================================================
       STOP CURRENT STREAM
       ===================================================== */

    function stopCurrentStream() {

        if (!stream) {
            return;
        }


        stream
            .getTracks()
            .forEach(
                track => {

                    track.stop();

                }
            );


        stream = null;

    }


    /* =====================================================
       CAMERA ON/OFF
       ===================================================== */

    function toggleCamera() {

        if (!stream) {
            return;
        }


        const tracks =
            stream.getVideoTracks();


        cameraEnabled =
            !cameraEnabled;


        tracks.forEach(
            track => {

                track.enabled =
                    cameraEnabled;

            }
        );


        updateCameraUI();

    }


    /* =====================================================
       CAMERA UI
       ===================================================== */

    function updateCameraUI() {

        if (cameraEnabled) {

            cameraIcon.textContent =
                "📷";

            cameraText.textContent =
                "Camera";

            cameraButton.classList
                .remove("disabled");

        } else {

            cameraIcon.textContent =
                "🚫";

            cameraText.textContent =
                "Off";

            cameraButton.classList
                .add("disabled");

        }

    }


    /* =====================================================
       MICROPHONE
       ===================================================== */

    function toggleMic() {

        if (!stream) {
            return;
        }


        micEnabled =
            !micEnabled;


        updateMicTracks();

        updateMicUI();

    }


    /* =====================================================
       UPDATE MIC TRACK
       ===================================================== */

    function updateMicTracks() {

        if (!stream) {
            return;
        }


        const tracks =
            stream.getAudioTracks();


        tracks.forEach(
            track => {

                track.enabled =
                    micEnabled;

            }
        );

    }


    /* =====================================================
       MIC UI
       ===================================================== */

    function updateMicUI() {

        if (micEnabled) {

            micIcon.textContent =
                "🎤";

            micText.textContent =
                "Mic";

            bottomMicButton.textContent =
                "🎤 Mic";

            micButton.classList
                .remove("disabled");

        } else {

            micIcon.textContent =
                "🔇";

            micText.textContent =
                "Muted";

            bottomMicButton.textContent =
                "🔇 Mic";

            micButton.classList
                .add("disabled");

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


        setCameraStatus(
            "Mengganti kamera..."
        );


        const wasLive =
            liveStarted;


        const success =
            await startCamera();


        if (success) {

            if (wasLive) {

                setCameraStatus(
                    "LIVE • Kamera berganti"
                );

            } else {

                setCameraStatus(
                    "Kamera aktif"
                );

            }

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
       DREAM LIKE
       ===================================================== */

    function toggleDreamLike() {

        if (!dreamFilter) {

            console.warn(
                "DreamLikePlastic belum siap"
            );

            return;

        }


        filterEnabled =
            !filterEnabled;


        if (filterEnabled) {

            dreamFilter.enable();


            dreamLikeButton.classList
                .add("active");


            dreamLikeButton.textContent =
                "✨ Dream Like ON";


            setCameraStatus(
                "Dream Like aktif"
            );

        } else {

            dreamFilter.disable();


            dreamLikeButton.classList
                .remove("active");


            dreamLikeButton.textContent =
                "✨ Dream Like";


            setCameraStatus(
                liveStarted
                    ? "LIVE"
                    : "Kamera aktif"
            );

        }

    }


    /* =====================================================
       SLIDER HELPER
       ===================================================== */

    function setupSlider(
        sliderId,
        valueId,
        settingName
    ) {

        const slider =
            document.getElementById(
                sliderId
            );

        const value =
            document.getElementById(
                valueId
            );


        if (!slider) {
            return;
        }


        slider.addEventListener(
            "input",
            function () {

                const number =
                    Number(this.value);


                if (value) {

                    value.textContent =
                        number;

                }


                if (dreamFilter) {

                    dreamFilter.setSetting(
                        settingName,
                        number
                    );

                }

            }
        );

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


        if (autoLight) {

            autoLightButton.textContent =
                "ON";

            autoLightButton.classList
                .add("active");

            lightStatus.textContent =
                "💡 Auto Light";

        } else {

            autoLightButton.textContent =
                "OFF";

            autoLightButton.classList
                .remove("active");

            lightStatus.textContent =
                "💡 Auto Light OFF";

        }

    }


    /* =====================================================
       LIKE
       ===================================================== */

    function addLike() {

        likes++;

        likeCount.textContent =
            formatNumber(likes);


        createFloatingHeart();

    }


    /* =====================================================
       FLOATING HEART
       ===================================================== */

    function createFloatingHeart() {

        const heart =
            document.createElement(
                "div"
            );


        heart.className =
            "floating-heart";


        heart.textContent =
            "❤️";


        heart.style.right =
            (
                55 +
                Math.random() * 80
            ) + "px";


        heart.style.bottom =
            (
                130 +
                Math.random() * 80
            ) + "px";


        document.body.appendChild(
            heart
        );


        setTimeout(
            () => {

                heart.remove();

            },
            1800
        );

    }


    /* =====================================================
       COMMENT
       ===================================================== */

    function addComment(
        username,
        text
    ) {

        if (!commentsList) {
            return;
        }


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "live-comment";


        item.innerHTML =

            '<div class="comment-avatar">👤</div>' +

            '<div class="comment-body">' +

            '<strong>' +
            safeText(username) +
            '</strong>' +

            '<span>' +
            safeText(text) +
            '</span>' +

            '</div>';


        commentsList.appendChild(
            item
        );


        /*
         * Batasi jumlah komentar.
         */

        while (
            commentsList.children.length >
            6
        ) {

            commentsList
                .firstElementChild
                .remove();

        }


        /*
         * Scroll ke komentar terbaru.
         */

        commentsList.scrollTop =
            commentsList.scrollHeight;


        /*
         * Hapus otomatis setelah beberapa
         * saat agar tampilan seperti TikTok.
         */

        setTimeout(
            () => {

                if (
                    item.parentNode ===
                    commentsList
                ) {

                    item.classList.add(
                        "fade-comment"
                    );


                    setTimeout(
                        () => {

                            if (
                                item.parentNode ===
                                commentsList
                            ) {

                                item.remove();

                            }

                        },
                        600
                    );

                }

            },
            9000
        );

    }


    /* =====================================================
       SEND COMMENT
       ===================================================== */

    function sendComment() {

        if (!commentInput) {
            return;
        }


        const text =
            commentInput.value.trim();


        if (!text) {
            return;
        }


        addComment(
            "Anda",
            text
        );


        commentInput.value =
            "";


        commentInput.blur();

    }


    /* =====================================================
       COMMENT INPUT
       ===================================================== */

    function toggleCommentInput() {

        if (!commentInputArea) {
            return;
        }


        commentInputArea.classList.toggle(
            "open"
        );


        if (
            commentInputArea.classList.contains(
                "open"
            )
        ) {

            setTimeout(
                () => {

                    commentInput.focus();

                },
                100
            );

        }

    }


    /* =====================================================
       FOLLOW
       ===================================================== */

    function toggleFollow() {

        if (
            followButton.textContent
                .trim()
                .toLowerCase() ===
            "follow"
        ) {

            followButton.textContent =
                "Following";

            followButton.classList
                .add("following");

        } else {

            followButton.textContent =
                "Follow";

            followButton.classList
                .remove("following");

        }

    }


    /* =====================================================
       START LIVE
       ===================================================== */

    function startLive() {

        if (liveStarted) {

            stopLive();

            return;

        }


        if (!stream) {

            setCameraStatus(
                "Kamera belum siap."
            );

            return;

        }


        liveStarted =
            true;


        liveSeconds =
            0;


        viewers =
            Math.floor(
                5 +
                Math.random() * 16
            );


        updateLiveButton();

        updateViewerCount();


        liveTimerInterval =
            setInterval(
                updateLiveTimer,
                1000
            );


        viewerTimerInterval =
            setInterval(
                simulateViewers,
                4000
            );


        setCameraStatus(
            "🔴 LIVE"
        );


        addComment(
            "Chuk an Chukk",
            "Selamat datang di Live! 🔥"
        );

    }


    /* =====================================================
       STOP LIVE
       ===================================================== */

    function stopLive() {

        liveStarted =
            false;


        clearInterval(
            liveTimerInterval
        );

        clearInterval(
            viewerTimerInterval
        );


        liveTimerInterval =
            null;

        viewerTimerInterval =
            null;


        viewers =
            0;


        updateLiveButton();

        updateViewerCount();


        liveTimer.textContent =
            "00:00";


        setCameraStatus(
            "Kamera aktif"
        );

    }


    /* =====================================================
       LIVE BUTTON UI
       ===================================================== */

    function updateLiveButton() {

        if (liveStarted) {

            startLiveButton.classList
                .add("active");

            startLiveText.textContent =
                "Stop Live";

        } else {

            startLiveButton.classList
                .remove("active");

            startLiveText.textContent =
                "Mulai Live";

        }

    }


    /* =====================================================
       LIVE TIMER
       ===================================================== */

    function updateLiveTimer() {

        liveSeconds++;


        const minutes =
            Math.floor(
                liveSeconds / 60
            );


        const seconds =
            liveSeconds % 60;


        liveTimer.textContent =

            String(minutes)
                .padStart(2, "0") +

            ":" +

            String(seconds)
                .padStart(2, "0");

    }


    /* =====================================================
       VIEWERS
       ===================================================== */

    function simulateViewers() {

        if (!liveStarted) {
            return;
        }


        const change =
            Math.floor(
                Math.random() * 5
            ) - 2;


        viewers =
            Math.max(
                1,
                viewers + change
            );


        updateViewerCount();

    }


    function updateViewerCount() {

        viewerCount.textContent =
            formatNumber(viewers);

    }


    /* =====================================================
       NUMBER FORMAT
       ===================================================== */

    function formatNumber(number) {

        return Number(
            number || 0
        ).toLocaleString(
            "id-ID"
        );

    }


    /* =====================================================
       DEMO COMMENTS
       =====================================================

       Hanya untuk testing UI.
       Nanti bisa diganti realtime database/WebSocket.
       ===================================================== */

    const demoComments = [

        ["Andi", "Halo bro! 👋"],

        ["Siti", "Mantap live-nya 🔥"],

        ["Budi", "Pi kuat bro! 💚"],

        ["Rina", "Salam dari komunitas 👋"],

        ["Dimas", "Keren banget!"],

        ["Fajar", "Filter-nya mantap ✨"]

    ];


    let demoCommentIndex =
        0;


    function startDemoComments() {

        setInterval(
            () => {

                if (!liveStarted) {
                    return;
                }


                const comment =
                    demoComments[
                        demoCommentIndex %
                        demoComments.length
                    ];


                demoCommentIndex++;


                addComment(
                    comment[0],
                    comment[1]
                );

            },
            5000
        );

    }


    /* =====================================================
       CLOSE LIVE
       ===================================================== */

    function closeLive() {

        stopLive();

        stopCurrentStream();


        if (dreamFilter) {

            dreamFilter.stop();

        }


        window.location.href =
            "index.html";

    }


    /* =====================================================
       EVENTS
       ===================================================== */

    function setupEvents() {

        if (startLiveButton) {

            startLiveButton.addEventListener(
                "click",
                startLive
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


        if (bottomMicButton) {

            bottomMicButton.addEventListener(
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


        if (bottomFlipButton) {

            bottomFlipButton.addEventListener(
                "click",
                flipCamera
            );

        }


        if (filterButton) {

            filterButton.addEventListener(
                "click",
                toggleFilterPanel
            );

        }


        if (bottomFilterButton) {

            bottomFilterButton.addEventListener(
                "click",
                toggleFilterPanel
            );

        }


        if (closeFilterButton) {

            closeFilterButton.addEventListener(
                "click",
                closeFilterPanel
            );

        }


        if (dreamLikeButton) {

            dreamLikeButton.addEventListener(
                "click",
                toggleDreamLike
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


        if (commentButton) {

            commentButton.addEventListener(
                "click",
                toggleCommentInput
            );

        }


        if (sendCommentButton) {

            sendCommentButton.addEventListener(
                "click",
                sendComment
            );

        }


        if (commentInput) {

            commentInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        sendComment();

                    }

                }
            );

        }


        if (followButton) {

            followButton.addEventListener(
                "click",
                toggleFollow
            );

        }


        if (closeLiveButton) {

            closeLiveButton.addEventListener(
                "click",
                closeLive
            );

        }


        /*
         * Slider filter.
         */

        setupSlider(
            "plasticSlider",
            "plasticValue",
            "plastic"
        );


        setupSlider(
            "glowSlider",
            "glowValue",
            "glow"
        );


        setupSlider(
            "brightnessSlider",
            "brightnessValue",
            "brightness"
        );


        setupSlider(
            "softFocusSlider",
            "softFocusValue",
            "softFocus"
        );


        setupSlider(
            "detailSlider",
            "detailValue",
            "detail"
        );


        /*
         * Resize.
         */

        window.addEventListener(
            "resize",
            resizeCanvas
        );


        window.addEventListener(
            "orientationchange",
            () => {

                setTimeout(
                    resizeCanvas,
                    300
                );

            }
        );


        /*
         * Ketika halaman ditutup,
         * matikan kamera.
         */

        window.addEventListener(
            "beforeunload",
            () => {

                stopLive();

                stopCurrentStream();

                if (dreamFilter) {

                    dreamFilter.stop();

                }

            }
        );

    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    async function init() {

        console.log(
            "🚀 Chuk an Chukk Live starting..."
        );


        setupFilter();

        setupEvents();

        updateCameraUI();

        updateMicUI();

        updateLiveButton();

        updateViewerCount();

        startDemoComments();


        /*
         * Mulai kamera otomatis.
         */

        await startCamera();

    }


    /* =====================================================
       DOM READY
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
