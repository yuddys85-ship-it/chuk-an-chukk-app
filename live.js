/* =========================================================
   CHUK AN CHUKK — LIVE.JS V4
   FACE + BODY BEAUTY FILTER
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const video = document.getElementById("camera");
    const canvas = document.getElementById("filterCanvas");
    const ctx = canvas ? canvas.getContext("2d", {
        alpha: false,
        desynchronized: true
    }) : null;

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
       CAMERA STATE
       ===================================================== */

    let stream = null;
    let facing = "user";
    let cameraRunning = false;
    let micEnabled = true;

    let animationFrame = null;

    let faceResult = null;

    let detectCounter = 0;
    let bodyDetectCounter = 0;

    let lastFaceTime = 0;
    let lastBodyTime = 0;

    let filterEnabled = true;


    /* =====================================================
       INITIALIZE CANVAS
       ===================================================== */

    function resizeCanvas() {

        if (!canvas || !video) return;

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
       CAMERA START
       ===================================================== */

    async function startCamera() {

        try {

            stopCamera();

            if (cameraStatus) {
                cameraStatus.textContent =
                    "Starting camera...";
            }

            const constraints = {
                audio: true,

                video: {
                    facingMode: facing,

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
                }
            };

            stream =
                await navigator.mediaDevices
                    .getUserMedia(constraints);

            video.srcObject = stream;

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
                .forEach(track => {
                    track.stop();
                });

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

        await startCamera();

    }


    /* =====================================================
       CAMERA RENDER
       ===================================================== */

    function drawCameraFrame() {

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

        resizeCanvas();

        const cw = canvas.width;
        const ch = canvas.height;

        const vw = video.videoWidth;
        const vh = video.videoHeight;

        /*
         * CONTAIN
         * Menjaga seluruh gambar kamera terlihat.
         */

        const scale =
            Math.min(
                cw / vw,
                ch / vh
            );

        const w = vw * scale;
        const h = vh * scale;

        const x = (cw - w) / 2;
        const y = (ch - h) / 2;


        /* =================================================
           CLEAR
           ================================================= */

        ctx.save();

        ctx.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );

        ctx.clearRect(
            0,
            0,
            cw,
            ch
        );

        ctx.fillStyle = "#000";

        ctx.fillRect(
            0,
            0,
            cw,
            ch
        );


        /* =================================================
           BEAUTY GLOBAL FILTER
           ================================================= */

        let brightness = 1;
        let saturation = 1;
        let contrast = 1;

        if (
            window.ChukBeauty &&
            typeof window.ChukBeauty.getCSSFilter ===
                "function"
        ) {

            const filter =
                window.ChukBeauty.getCSSFilter();

            if (filter) {
                ctx.filter = filter;
            }
        }


        /* =================================================
           DRAW CAMERA

           IMPORTANT:
           FRONT CAMERA ONLY IS FLIPPED HERE.

           Jangan tambahkan CSS transform.
           Ini yang menjaga kamera tidak mirror.
           ================================================= */

        if (facing === "user") {

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

        ctx.filter = "none";

        ctx.restore();


        /* =================================================
           DETECTION TIME
           ================================================= */

        const now =
            performance.now();


        /* =================================================
           FACE DETECTION
           ================================================= */

        detectFace(
            now
        );


        /* =================================================
           BODY DETECTION
           ================================================= */

        updateBodyMask(
            now,
            cw,
            ch
        );


        /* =================================================
           BEAUTY APPLICATION
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

            window.ChukBeauty.apply(
                ctx,
                canvas,
                landmarks,
                cw,
                ch
            );
        }


        /* =================================================
           FACE GLOW

           V4 apply() already handles face glow.
           Tidak dipanggil lagi di sini supaya tidak double.
           ================================================= */


        /* =================================================
           LIGHT FALLBACK
           ================================================= */

        if (
            filterEnabled &&
            window.ChukBeauty &&
            typeof window.ChukBeauty.applyBodyGlow ===
                "function" &&
            window.ChukBeauty.state &&
            window.ChukBeauty.state.bodyDetected
        ) {

            // Body glow sudah dikerjakan oleh apply().
            // Tidak perlu render kedua kali.
        }
    }


    /* =====================================================
       FACE DETECTION
       ================================================= */

    function detectFace(timestamp) {

        const landmarker =
            window.ChukFaceLandmarker;

        if (
            !landmarker ||
            !video
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


        detectCounter++;

        /*
         * Jangan deteksi setiap frame.
         * Setiap 3 frame lebih ringan untuk HP.
         */

        if (
            detectCounter % 3 !== 0
        ) {
            return;
        }


        if (
            timestamp <= lastFaceTime
        ) {
            return;
        }

        lastFaceTime =
            timestamp;


        try {

            faceResult =
                landmarker.detectForVideo(
                    video,
                    timestamp
                );


            if (
                window.ChukBeauty
            ) {

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
                "Face detection:",
                error
            );
        }
    }


    /* =====================================================
       BODY SEGMENTATION
       ===================================================== */

    function updateBodyMask(
        timestamp,
        width,
        height
    ) {

        if (
            !window.ChukBeauty ||
            !window.ChukPersonSegmenter
        ) {
            return;
        }

        if (
            !video ||
            video.readyState < 2
        ) {
            return;
        }


        bodyDetectCounter++;


        /*
         * Body segmentation juga tidak perlu
         * dilakukan setiap frame.
         */

        if (
            bodyDetectCounter % 3 !== 0
        ) {
            return;
        }


        if (
            timestamp <= lastBodyTime
        ) {
            return;
        }

        lastBodyTime =
            timestamp;


        try {

            const success =
                window.ChukBeauty.updateBodyMask(
                    video,
                    timestamp,
                    width,
                    height
                );


            if (
                typeof success === "boolean"
            ) {

                window.ChukBeauty.set(
                    "bodyDetected",
                    success
                );
            }

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
                 * Face Landmarker memakai koordinat
                 * normal 0 → 1.
                 *
                 * Kamera depan sudah dibalik saat
                 * digambar ke Canvas, jadi koordinat
                 * wajah ikut dibalik.
                 */

                const px =
                    facing === "user"
                        ? 1 - point.x
                        : point.x;


                return {

                    x:
                        (x + px * w)
                        / canvas.width,

                    y:
                        (y + point.y * h)
                        / canvas.height,

                    z:
                        point.z || 0
                };
            }
        );
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


        function render() {

            drawCameraFrame();

            if (cameraRunning) {

                animationFrame =
                    requestAnimationFrame(
                        render
                    );
            }
        }


        render();
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
       FILTER ENABLE / DISABLE
       ===================================================== */

    function toggleFilter() {

        filterEnabled =
            !filterEnabled;


        if (window.ChukBeauty) {

            if (filterEnabled) {

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
       SLIDER HELPERS
       ===================================================== */

    function bindSlider(
        slider,
        valueElement,
        stateName,
        suffix = "%"
    ) {

        if (!slider) return;


        function update() {

            const value =
                Number(
                    slider.value
                );


            if (window.ChukBeauty) {

                window.ChukBeauty.set(
                    stateName,
                    value
                );
            }


            if (valueElement) {

                valueElement.textContent =
                    `${value}${suffix}`;
            }
        }


        slider.addEventListener(
            "input",
            update
        );

        update();
    }


    /* =====================================================
       FILTER SLIDERS
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

    if (dreamLikeButton) {

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


                if (plasticSlider) {
                    plasticSlider.value = 65;
                }

                if (glowSlider) {
                    glowSlider.value = 35;
                }

                if (brightnessSlider) {
                    brightnessSlider.value = 20;
                }

                if (softFocusSlider) {
                    softFocusSlider.value = 30;
                }

                if (detailSlider) {
                    detailSlider.value = 18;
                }


                plasticSlider?.dispatchEvent(
                    new Event("input")
                );

                glowSlider?.dispatchEvent(
                    new Event("input")
                );

                brightnessSlider?.dispatchEvent(
                    new Event("input")
                );

                softFocusSlider?.dispatchEvent(
                    new Event("input")
                );

                detailSlider?.dispatchEvent(
                    new Event("input")
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
            () => {

                if (
                    window.ChukBeauty &&
                    typeof window.ChukBeauty.natural ===
                        "function"
                ) {

                    window.ChukBeauty.natural();
                }


                if (brightnessSlider) {

                    brightnessSlider.value =
                        15;

                    brightnessSlider.dispatchEvent(
                        new Event("input")
                    );
                }
            }
        );
    }


    /* =====================================================
       BUTTON EVENTS
       ===================================================== */

    cameraButton?.addEventListener(
        "click",
        () => {

            if (cameraRunning) {

                stopCamera();

                if (cameraText) {
                    cameraText.textContent =
                        "Start Camera";
                }

            } else {

                startCamera();

                if (cameraText) {
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


    filterButton?.addEventListener(
        "click",
        openFilterPanel
    );


    closeFilterButton?.addEventListener(
        "click",
        closeFilterPanel
    );


    /* =====================================================
       WINDOW RESIZE
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
       INITIALIZE
       ===================================================== */

    if (window.ChukBeauty) {

        window.ChukBeauty.enable();

    }


    if (filterButton) {

        filterButton.classList.add(
            "active"
        );
    }


    console.log(
        "✅ CHUK AN CHUKK LIVE V4 — FACE + BODY BEAUTY READY"
    );


    /*
     * Start camera automatically.
     * Browser/Pi Browser tetap akan meminta permission.
     */

    startCamera();

});
