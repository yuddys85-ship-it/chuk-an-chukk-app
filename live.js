/* =========================================================
   CHUK AN CHUKK — LIVE.JS FINAL
   CAMERA + BEAUTY FILTER
   FACE + BODY SUPPORT
   SMOOTH RENDER
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENT
       ===================================================== */

    const video = document.getElementById("camera");
    const canvas = document.getElementById("filterCanvas");

    if (!video || !canvas) {
        console.error("❌ Camera atau filterCanvas tidak ditemukan");
        return;
    }

    const ctx = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true
    });

    const cameraStatus =
        document.getElementById("cameraStatus");

    const cameraButton =
        document.getElementById("cameraButton");

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

    let lastFaceDetection = 0;
    let lastBodyDetection = 0;

    /*
     * AI tidak boleh menghambat render kamera.
     */

    const FACE_INTERVAL = 160;
    const BODY_INTERVAL = 300;


    /* =====================================================
       CANVAS
       ===================================================== */

    function resizeCanvas() {

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
        }
    }


    /* =====================================================
       CAMERA
       ===================================================== */

    async function startCamera() {

        try {

            stopCamera();

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {

                throw new Error(
                    "getUserMedia tidak tersedia"
                );
            }


            if (cameraStatus) {
                cameraStatus.textContent =
                    "Starting camera...";
            }


            stream =
                await navigator.mediaDevices.getUserMedia({

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
                });


            video.srcObject =
                stream;

            video.muted = true;
            video.autoplay = true;
            video.playsInline = true;


            await video.play();


            cameraRunning = true;

            faceResult = null;

            lastFaceDetection = 0;
            lastBodyDetection = 0;


            resizeCanvas();

            updateMicState();

            startRenderLoop();


            if (cameraStatus) {

                cameraStatus.textContent =
                    "Camera ready";
            }


            if (cameraText) {

                cameraText.textContent =
                    "Camera";
            }


            console.log(
                "✅ CHUK CAMERA READY"
            );


        } catch (error) {

            console.error(
                "❌ Camera:",
                error
            );


            cameraRunning = false;


            if (cameraStatus) {

                cameraStatus.textContent =
                    "Camera permission required";
            }
        }
    }


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
                .forEach(track => {
                    track.stop();
                });

            stream = null;
        }


        video.srcObject = null;

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


        faceResult = null;

        await startCamera();
    }


    /* =====================================================
       FACE DETECTION
       ===================================================== */

    function detectFace(now) {

        const landmarker =
            window.ChukFaceLandmarker;


        if (
            !landmarker ||
            video.readyState < 2
        ) {
            return;
        }


        if (
            now - lastFaceDetection <
            FACE_INTERVAL
        ) {
            return;
        }


        lastFaceDetection =
            now;


        try {

            faceResult =
                landmarker.detectForVideo(
                    video,
                    now
                );


            if (window.ChukBeauty) {

                window.ChukBeauty.set(
                    "faceDetected",
                    Boolean(
                        faceResult &&
                        faceResult.faceLandmarks &&
                        faceResult.faceLandmarks.length
                    )
                );
            }


        } catch (error) {

            console.warn(
                "Face detector:",
                error
            );
        }
    }


    /* =====================================================
       BODY DETECTION
       ===================================================== */

    function detectBody(
        now,
        width,
        height
    ) {

        if (
            !window.ChukPersonSegmenter ||
            !window.ChukBeauty
        ) {
            return;
        }


        if (
            video.readyState < 2
        ) {
            return;
        }


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
                "Body detector:",
                error
            );
        }
    }


    /* =====================================================
       FACE LANDMARK
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


        const points =
            faceResult.faceLandmarks[0];


        return points.map(point => {

            /*
             * FRONT CAMERA:
             * Canvas sudah dibalik.
             * Landmark ikut dibalik.
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
        });
    }


    /* =====================================================
       DRAW CAMERA
       ===================================================== */

    function drawFrame(now) {

        if (
            !cameraRunning ||
            video.readyState < 2 ||
            !video.videoWidth ||
            !video.videoHeight
        ) {
            return;
        }


        resizeCanvas();


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
         * Tidak melakukan zoom.
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
           FULL FRAME BEAUTY
           ================================================= */

        let filter =
            "none";


        if (
            filterEnabled &&
            window.ChukBeauty &&
            typeof window.ChukBeauty.getCSSFilter ===
                "function"
        ) {

            filter =
                window.ChukBeauty.getCSSFilter() ||
                "none";
        }


        ctx.save();

        ctx.filter =
            filter;


        /* =================================================
           FRONT CAMERA
           ================================================= */

        if (
            facing === "user"
        ) {

            /*
             * JANGAN HAPUS BAGIAN INI.
             *
             * Ini yang membuat kamera depan
             * tidak mirror seperti versi sebelumnya.
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
           AI UPDATE
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


            try {

                window.ChukBeauty.apply(
                    ctx,
                    canvas,
                    landmarks,
                    cw,
                    ch
                );

            } catch (error) {

                console.warn(
                    "Beauty render:",
                    error
                );
            }
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

            drawFrame(now);


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


        const tracks =
            stream.getAudioTracks();


        tracks.forEach(track => {

            track.enabled =
                micEnabled;
        });


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
       BEAUTY PANEL
       ===================================================== */

    function openFilterPanel() {

        if (!filterPanel) {

            console.warn(
                "⚠️ filterPanel tidak ditemukan"
            );

            return;
        }


        filterPanel.classList.add(
            "active"
        );


        filterPanel.style.display =
            "block";


        filterPanel.setAttribute(
            "aria-hidden",
            "false"
        );


        console.log(
            "✨ Beauty Filter OPEN"
        );
    }


    function closeFilterPanel() {

        if (!filterPanel) return;


        filterPanel.classList.remove(
            "active"
        );


        filterPanel.style.display =
            "";


        filterPanel.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    /* =====================================================
       BEAUTY BUTTON
       ===================================================== */

    if (filterButton) {

        filterButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                openFilterPanel();
            }
        );
    }


    if (closeFilterButton) {

        closeFilterButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                event.stopPropagation();

                closeFilterPanel();
            }
        );
    }


    /* =====================================================
       SLIDERS
       ===================================================== */

    function bindSlider(
        slider,
        valueElement,
        stateName
    ) {

        if (!slider) return;


        function update() {

            const value =
                Number(slider.value);


            if (
                window.ChukBeauty &&
                typeof window.ChukBeauty.set ===
                    "function"
            ) {

                window.ChukBeauty.set(
                    stateName,
                    value
                );
            }


            if (valueElement) {

                valueElement.textContent =
                    `${value}%`;
            }
        }


        slider.addEventListener(
            "input",
            update
        );


        slider.addEventListener(
            "change",
            update
        );


        update();
    }


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

    function setSlider(
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


    if (dreamLikeButton) {

        dreamLikeButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                if (
                    window.ChukBeauty &&
                    typeof window.ChukBeauty.dream ===
                        "function"
                ) {

                    window.ChukBeauty.dream();
                }


                setSlider(
                    plasticSlider,
                    65
                );

                setSlider(
                    glowSlider,
                    35
                );

                setSlider(
                    brightnessSlider,
                    20
                );

                setSlider(
                    softFocusSlider,
                    30
                );

                setSlider(
                    detailSlider,
                    18
                );


                console.log(
                    "✨ Dream Beauty preset"
                );
            }
        );
    }


    /* =====================================================
       AUTO LIGHT
       ===================================================== */

    if (autoLightButton) {

        autoLightButton.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (
                    window.ChukBeauty &&
                    typeof window.ChukBeauty.natural ===
                        "function"
                ) {

                    window.ChukBeauty.natural();
                }


                setSlider(
                    brightnessSlider,
                    15
                );


                console.log(
                    "💡 Auto Light"
                );
            }
        );
    }


    /* =====================================================
       CAMERA BUTTON
       ===================================================== */

    if (cameraButton) {

        cameraButton.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (cameraRunning) {

                    stopCamera();


                    if (cameraText) {

                        cameraText.textContent =
                            "Start Camera";
                    }

                } else {

                    startCamera();
                }
            }
        );
    }


    /* =====================================================
       FLIP BUTTON
       ===================================================== */

    if (flipButton) {

        flipButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                flipCamera();
            }
        );
    }


    /* =====================================================
       MIC BUTTON
       ===================================================== */

    if (micButton) {

        micButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                toggleMic();
            }
        );
    }


    /* =====================================================
       FILTER ENABLE
       ===================================================== */

    function setFilterEnabled(enabled) {

        filterEnabled =
            Boolean(enabled);


        if (
            window.ChukBeauty
        ) {

            if (
                filterEnabled &&
                typeof window.ChukBeauty.enable ===
                    "function"
            ) {

                window.ChukBeauty.enable();

            } else if (
                !filterEnabled &&
                typeof window.ChukBeauty.disable ===
                    "function"
            ) {

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


    setFilterEnabled(true);


    /* =====================================================
       RESIZE
       ===================================================== */

    window.addEventListener(
        "resize",
        resizeCanvas
    );


    /* =====================================================
       PAGE VISIBILITY
       ===================================================== */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden
            ) {

                if (animationFrame) {

                    cancelAnimationFrame(
                        animationFrame
                    );

                    animationFrame = null;
                }

            } else if (
                cameraRunning
            ) {

                startRenderLoop();
            }
        }
    );


    /* =====================================================
       READY
       ===================================================== */

    console.log(
        "✅ CHUK AN CHUKK LIVE.JS FINAL READY"
    );


    /*
     * Mulai kamera.
     */

    startCamera();

});
