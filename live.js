/* =========================================================
   CHUK AN CHUKK — LIVE.JS V5
   SMOOTH CAMERA + FULL FRAME BEAUTY
   FACE + BODY DETECTION OPTIMIZED
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const video = document.getElementById("camera");
    const canvas = document.getElementById("filterCanvas");

    const ctx = canvas
        ? canvas.getContext("2d", {
            alpha: false,
            desynchronized: true
        })
        : null;

    const cameraStatus =
        document.getElementById("cameraStatus");

    const cameraButton =
        document.getElementById("cameraButton");

    const cameraIcon =
        document.getElementById("cameraIcon");

    const cameraText =
        document.getElementById("cameraText");

    const flipButton =
        document.getElementById("flipButton");

    const micButton =
        document.getElementById("micButton");

    const micIcon =
        document.getElementById("micIcon");

    const micText =
        document.getElementById("micText");

    const filterButton =
        document.getElementById("filterButton");

    const filterPanel =
        document.getElementById("filterPanel");

    const closeFilterButton =
        document.getElementById("closeFilterButton");

    const dreamLikeButton =
        document.getElementById("dreamLikeButton");

    const plasticSlider =
        document.getElementById("plasticSlider");

    const plasticValue =
        document.getElementById("plasticValue");

    const glowSlider =
        document.getElementById("glowSlider");

    const glowValue =
        document.getElementById("glowValue");

    const brightnessSlider =
        document.getElementById("brightnessSlider");

    const brightnessValue =
        document.getElementById("brightnessValue");

    const softFocusSlider =
        document.getElementById("softFocusSlider");

    const softFocusValue =
        document.getElementById("softFocusValue");

    const detailSlider =
        document.getElementById("detailSlider");

    const detailValue =
        document.getElementById("detailValue");

    const autoLightButton =
        document.getElementById("autoLightButton");


    /* =====================================================
       STATE
       ===================================================== */

    let stream = null;

    let facing = "user";

    let cameraRunning = false;

    let micEnabled = true;

    let animationFrame = null;

    let faceResult = null;

    let filterEnabled = true;

    /*
     * Detection timers.
     *
     * Camera rendering tetap setiap frame.
     * AI detection hanya sesekali.
     */

    let lastFaceDetection = 0;
    let lastBodyDetection = 0;

    const FACE_INTERVAL = 100;
    const BODY_INTERVAL = 180;


    /* =====================================================
       CANVAS SIZE
       ===================================================== */

    function resizeCanvas() {

        if (!canvas) return;

        const rect =
            canvas.getBoundingClientRect();

        const width =
            Math.max(
                1,
                Math.floor(rect.width)
            );

        const height =
            Math.max(
                1,
                Math.floor(rect.height)
            );

        if (
            canvas.width !== width ||
            canvas.height !== height
        ) {

            canvas.width = width;
            canvas.height = height;

            if (window.ChukBeauty) {

                /*
                 * Reset internal beauty canvases
                 * setelah ukuran berubah.
                 */

                try {

                    if (
                        typeof window.ChukBeauty.ensureCanvases ===
                        "function"
                    ) {
                        window.ChukBeauty.ensureCanvases(
                            width,
                            height
                        );
                    }

                } catch (error) {
                    console.warn(
                        "Beauty canvas resize:",
                        error
                    );
                }
            }
        }
    }


    /* =====================================================
       CAMERA START
       ===================================================== */

    async function startCamera() {

        try {

            stopCamera();

            if (cameraStatus) {
                cameraStatus.textContent =
                    "Starting camera...";
            }


            /*
             * 720p + 30fps.
             *
             * Jangan paksa 60fps karena AI filter
             * akan jauh lebih berat di HP.
             */

            const constraints = {

                audio: true,

                video: {

                    facingMode: {
                        ideal: facing
                    },

                    width: {
                        ideal: 1280,
                        max: 1280
                    },

                    height: {
                        ideal: 720,
                        max: 720
                    },

                    frameRate: {
                        ideal: 30,
                        max: 30
                    }
                }
            };


            stream =
                await navigator.mediaDevices
                    .getUserMedia(
                        constraints
                    );


            video.srcObject =
                stream;

            video.muted = true;

            video.playsInline = true;


            await video.play();


            cameraRunning = true;


            if (cameraStatus) {

                cameraStatus.textContent =
                    "Camera ready";
            }


            updateMicState();

            resizeCanvas();

            startRenderLoop();


        } catch (error) {

            console.error(
                "Camera error:",
                error
            );

            cameraRunning = false;


            if (cameraStatus) {

                cameraStatus.textContent =
                    "Camera permission required";
            }


            alert(
                "Camera tidak bisa digunakan. " +
                "Pastikan izin kamera sudah diberikan."
            );
        }
    }


    /* =====================================================
       CAMERA STOP
       ===================================================== */

    function stopCamera() {

        if (animationFrame) {

            cancelAnimationFrame(
                animationFrame
            );

            animationFrame = null;
        }


        if (stream) {

            stream
                .getTracks()
                .forEach(
                    track => track.stop()
                );

            stream = null;
        }


        if (video) {

            video.srcObject = null;
        }


        cameraRunning = false;
    }


    /* =====================================================
       FLIP CAMERA
       ===================================================== */

    async function flipCamera() {

        facing =
            facing === "user"
                ? "environment"
                : "user";


        /*
         * Reset detection supaya hasil kamera
         * sebelumnya tidak terbawa.
         */

        faceResult = null;


        await startCamera();
    }


    /* =====================================================
       DETECT FACE
       ===================================================== */

    function detectFace(now) {

        const landmarker =
            window.ChukFaceLandmarker;


        if (
            !landmarker ||
            !video ||
            video.readyState < 2 ||
            !video.videoWidth ||
            !video.videoHeight
        ) {
            return;
        }


        /*
         * Face detection hanya sekitar 10 FPS.
         *
         * Render kamera tetap 30 FPS.
         */

        if (
            now - lastFaceDetection <
            FACE_INTERVAL
        ) {
            return;
        }


        lastFaceDetection =
            now;


        try {

            const result =
                landmarker.detectForVideo(
                    video,
                    now
                );


            faceResult =
                result;


            if (window.ChukBeauty) {

                window.ChukBeauty.set(
                    "faceDetected",
                    Boolean(
                        result &&
                        result.faceLandmarks &&
                        result.faceLandmarks.length
                    )
                );
            }


        } catch (error) {

            console.warn(
                "Face detection:",
                error
            );
        }
    }


    /* =====================================================
       BODY SEGMENTATION
       ===================================================== */

    function detectBody(
        now,
        width,
        height
    ) {

        if (
            !window.ChukBeauty ||
            !window.ChukPersonSegmenter ||
            !video
        ) {
            return;
        }


        if (
            video.readyState < 2
        ) {
            return;
        }


        /*
         * Body segmentation hanya sekitar
         * 5-6 FPS.
         *
         * Ini sengaja agar kamera tetap smooth.
         */

        if (
            now - lastBodyDetection <
            BODY_INTERVAL
        ) {
            return;
        }


        lastBodyDetection =
            now;


        try {

            window.ChukBeauty.updateBodyMask(
                video,
                now,
                width,
                height
            );


        } catch (error) {

            console.warn(
                "Body segmentation:",
                error
            );
        }
    }


    /* =====================================================
       FACE LANDMARK → CANVAS
       ===================================================== */

    function getCanvasFaceLandmarks(
        x,
        y,
        w,
        h
    ) {

        if (
            !faceResult ||
            !faceResult.faceLandmarks ||
            !faceResult.faceLandmarks.length
        ) {
            return null;
        }


        const source =
            faceResult.faceLandmarks[0];


        return source.map(
            point => {

                /*
                 * Karena kamera depan dibalik
                 * saat digambar ke Canvas,
                 * koordinat wajah juga dibalik.
                 */

                const px =
                    facing === "user"
                        ? 1 - point.x
                        : point.x;


                return {

                    x:
                        (
                            x +
                            px * w
                        ) /
                        canvas.width,

                    y:
                        (
                            y +
                            point.y * h
                        ) /
                        canvas.height,

                    z:
                        point.z || 0
                };
            }
        );
    }


    /* =====================================================
       DRAW CAMERA
       ===================================================== */

    function drawCameraFrame(now) {

        if (
            !ctx ||
            !canvas ||
            !video ||
            !cameraRunning
        ) {
            return;
        }


        if (
            video.readyState < 2 ||
            !video.videoWidth ||
            !video.videoHeight
        ) {
            return;
        }


        const cw =
            canvas.width;

        const ch =
            canvas.height;

        const vw =
            video.videoWidth;

        const vh =
            video.videoHeight;


        /*
         * CONTAIN
         *
         * Jangan zoom kamera.
         */

        const scale =
            Math.min(
                cw / vw,
                ch / vh
            );


        const w =
            vw * scale;

        const h =
            vh * scale;


        const x =
            (cw - w) / 2;

        const y =
            (ch - h) / 2;


        /* =================================================
           CLEAR
           ================================================= */

        ctx.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );

        ctx.filter = "none";


        ctx.clearRect(
            0,
            0,
            cw,
            ch
        );


        ctx.fillStyle =
            "#000";


        ctx.fillRect(
            0,
            0,
            cw,
            ch
        );


        /* =================================================
           FULL FRAME BEAUTY BASE
           ================================================= */

        let cssFilter =
            "none";


        if (
            filterEnabled &&
            window.ChukBeauty &&
            typeof window.ChukBeauty.getCSSFilter ===
                "function"
        ) {

            cssFilter =
                window.ChukBeauty.getCSSFilter() ||
                "none";
        }


        ctx.save();

        ctx.filter =
            cssFilter;


        /* =================================================
           FRONT CAMERA
           ================================================= */

        if (
            facing === "user"
        ) {

            /*
             * IMPORTANT:
             * Kamera depan tetap menggunakan
             * Canvas flip yang sudah diperbaiki.
             */

            ctx.save();

            ctx.translate(
                cw,
                0
            );

            ctx.scale(
                -1,
                1
            );


            ctx.drawImage(
                video,
                cw - x - w,
                y,
                w,
                h
            );


            ctx.restore();


        } else {

            /*
             * BACK CAMERA
             */

            ctx.drawImage(
                video,
                x,
                y,
                w,
                h
            );
        }


        ctx.restore();


        /* =================================================
           AI DETECTION
           ================================================= */

        detectFace(now);

        detectBody(
            now,
            cw,
            ch
        );


        /* =================================================
           ADVANCED BEAUTY
           ================================================= */

        if (
            filterEnabled &&
            window.ChukBeauty &&
            typeof window.ChukBeauty.apply ===
                "function"
        ) {

            const landmarks =
                getCanvasFaceLandmarks(
                    x,
                    y,
                    w,
                    h
                );


            /*
             * Body + face beauty.
             *
             * apply() V4 akan menggunakan
             * body mask jika tersedia.
             */

            window.ChukBeauty.apply(
                ctx,
                canvas,
                landmarks,
                cw,
                ch
            );
        }
    }


    /* =====================================================
       RENDER LOOP
       ===================================================== */

    function startRenderLoop() {

        if (animationFrame) {

            cancelAnimationFrame(
                animationFrame
            );
        }


        function render(now) {

            drawCameraFrame(
                now
            );


            if (
                cameraRunning
            ) {

                animationFrame =
                    requestAnimationFrame(
                        render
                    );
            }
        }


        animationFrame =
            requestAnimationFrame(
                render
            );
    }


    /* =====================================================
       MICROPHONE
       ===================================================== */

    function updateMicState() {

        if (!stream) return;


        const audioTracks =
            stream.getAudioTracks();


        audioTracks.forEach(
            track => {

                track.enabled =
                    micEnabled;
            }
        );


        if (micIcon) {

            micIcon.textContent =
                micEnabled
                    ? "🎙️"
                    : "🔇";
        }


        if (micText) {

            micText.textContent =
                micEnabled
                    ? "Mic"
                    : "Muted";
        }
    }


    function toggleMic() {

        micEnabled =
            !micEnabled;

        updateMicState();
    }


    /* =====================================================
       FILTER PANEL
       ===================================================== */

    function openFilterPanel() {

        if (!filterPanel) return;

        filterPanel.classList.add(
            "active"
        );
    }


    function closeFilterPanel() {

        if (!filterPanel) return;

        filterPanel.classList.remove(
            "active"
        );
    }


    /* =====================================================
       FILTER TOGGLE
       ===================================================== */

    function toggleFilter() {

        filterEnabled =
            !filterEnabled;


        if (window.ChukBeauty) {

            if (
                filterEnabled
            ) {

                window.ChukBeauty.enable();

            } else {

                window.ChukBeauty.disable();
            }
        }


        if (filterButton) {

            filterButton.classList.toggle(
                "active",
                filterEnabled
            );
        }
    }


    /* =====================================================
       SLIDER
       ===================================================== */

    function bindSlider(
        slider,
        valueElement,
        stateName
    ) {

        if (!slider) return;


        function update() {

            const value =
                Number(
                    slider.value
                );


            if (
                window.ChukBeauty
            ) {

                window.ChukBeauty.set(
                    stateName,
                    value
                );
            }


            if (
                valueElement
            ) {

                valueElement.textContent =
                    `${value}%`;
            }
        }


        slider.addEventListener(
            "input",
            update
        );


        update();
    }


    /* =====================================================
       BEAUTY CONTROLS
       ===================================================== */

    bindSlider(
        plasticSlider,
        plasticValue,
        "smooth"
    );


    bindSlider(
        glowSlider,
        glowValue,
        "glow"
    );


    bindSlider(
        brightnessSlider,
        brightnessValue,
        "brightness"
    );


    bindSlider(
        softFocusSlider,
        softFocusValue,
        "softFocus"
    );


    bindSlider(
        detailSlider,
        detailValue,
        "detail"
    );


    /* =====================================================
       DREAM PRESET
       ===================================================== */

    if (
        dreamLikeButton
    ) {

        dreamLikeButton.addEventListener(
            "click",
            () => {

                if (
                    window.ChukBeauty &&
                    typeof window.ChukBeauty.dream ===
                        "function"
                ) {

                    window.ChukBeauty.dream();
                }


                setSliderValue(
                    plasticSlider,
                    65
                );

                setSliderValue(
                    glowSlider,
                    35
                );

                setSliderValue(
                    brightnessSlider,
                    20
                );

                setSliderValue(
                    softFocusSlider,
                    30
                );

                setSliderValue(
                    detailSlider,
                    18
                );
            }
        );
    }


    function setSliderValue(
        slider,
        value
    ) {

        if (!slider) return;

        slider.value =
            value;

        slider.dispatchEvent(
            new Event("input")
        );
    }


    /* =====================================================
       AUTO LIGHT
       ===================================================== */

    if (
        autoLightButton
    ) {

        autoLightButton.addEventListener(
            "click",
            () => {

                if (
                    window.ChukBeauty &&
                    typeof window.ChukBeauty.natural ===
                        "function"
                ) {

                    window.ChukBeauty.natural();
                }


                setSliderValue(
                    brightnessSlider,
                    15
                );
            }
        );
    }


    /* =====================================================
       BUTTONS
       ===================================================== */

    cameraButton?.addEventListener(
        "click",
        () => {

            if (
                cameraRunning
            ) {

                stopCamera();

                if (
                    cameraText
                ) {

                    cameraText.textContent =
                        "Start Camera";
                }

            } else {

                startCamera();

                if (
                    cameraText
                ) {

                    cameraText.textContent =
                        "Camera";
                }
            }
        }
    );


    flipButton?.addEventListener(
        "click",
        flipCamera
    );


    micButton?.addEventListener(
        "click",
        toggleMic
    );


    /*
     * Filter button:
     * buka panel.
     *
     * Jika ingin toggle filter,
     * gunakan class active dari panel.
     */

    filterButton?.addEventListener(
        "click",
        openFilterPanel
    );


    closeFilterButton?.addEventListener(
        "click",
        closeFilterPanel
    );


    /* =====================================================
       RESIZE
       ===================================================== */

    window.addEventListener(
        "resize",
        resizeCanvas
    );


    /* =====================================================
       VISIBILITY
       ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden
            ) {

                if (
                    animationFrame
                ) {

                    cancelAnimationFrame(
                        animationFrame
                    );

                    animationFrame =
                        null;
                }

            } else if (
                cameraRunning
            ) {

                startRenderLoop();
            }
        }
    );


    /* =====================================================
       INITIAL FILTER
       ===================================================== */

    if (
        window.ChukBeauty
    ) {

        window.ChukBeauty.enable();
    }


    if (
        filterButton
    ) {

        filterButton.classList.add(
            "active"
        );
    }


    /* =====================================================
       READY
       ===================================================== */

    console.log(
        "✅ CHUK AN CHUKK LIVE V5 — SMOOTH FULL FRAME BEAUTY READY"
    );


    /* =====================================================
       START
       ===================================================== */

    startCamera();

});
