/* =========================================================
   CHUK AN CHUKK
   BEAUTY FILTER V4
   FACE + FULL BODY BEAUTY
   MediaPipe Person Segmentation
   Compatible with current live.js V2
   ========================================================= */

window.ChukBeauty = (() => {

    const state = {

        enabled: true,

        smooth: 45,

        brightness: 18,

        glow: 18,

        warmth: 4,

        detail: 22,

        faceDetected: false,

        bodyDetected: false

    };


    /* =====================================================
       INTERNAL CANVAS
       ===================================================== */

    let bodyMaskCanvas = null;
    let bodyMaskCtx = null;

    let bodyLayerCanvas = null;
    let bodyLayerCtx = null;

    let glowLayerCanvas = null;
    let glowLayerCtx = null;

    let lastWidth = 0;
    let lastHeight = 0;


    function ensureCanvases(width, height) {

        if (
            bodyMaskCanvas &&
            lastWidth === width &&
            lastHeight === height
        ) {
            return;
        }


        lastWidth = width;
        lastHeight = height;


        bodyMaskCanvas =
            document.createElement("canvas");

        bodyMaskCanvas.width = width;
        bodyMaskCanvas.height = height;


        bodyMaskCtx =
            bodyMaskCanvas.getContext("2d", {
                willReadFrequently: true
            });


        bodyLayerCanvas =
            document.createElement("canvas");

        bodyLayerCanvas.width = width;
        bodyLayerCanvas.height = height;


        bodyLayerCtx =
            bodyLayerCanvas.getContext("2d");


        glowLayerCanvas =
            document.createElement("canvas");

        glowLayerCanvas.width = width;
        glowLayerCanvas.height = height;


        glowLayerCtx =
            glowLayerCanvas.getContext("2d");

    }


    /* =====================================================
       STATE
       ===================================================== */

    function set(name, value) {

        if (!(name in state)) {
            return;
        }


        if (
            name === "faceDetected" ||
            name === "bodyDetected"
        ) {

            state[name] =
                Boolean(value);

            return;
        }


        state[name] =
            Number(value);

    }


    function get(name) {

        return state[name];

    }


    function enable() {

        state.enabled = true;

    }


    function disable() {

        state.enabled = false;

    }


    function toggle() {

        state.enabled =
            !state.enabled;

        return state.enabled;

    }


    /* =====================================================
       PRESETS
       ===================================================== */

    function reset() {

        state.enabled = true;

        state.smooth = 45;

        state.brightness = 18;

        state.glow = 18;

        state.warmth = 4;

        state.detail = 22;

    }


    function natural() {

        state.enabled = true;

        state.smooth = 25;

        state.brightness = 8;

        state.glow = 8;

        state.warmth = 2;

        state.detail = 35;

    }


    function beauty() {

        state.enabled = true;

        state.smooth = 58;

        state.brightness = 18;

        state.glow = 22;

        state.warmth = 4;

        state.detail = 20;

    }


    function dream() {

        state.enabled = true;

        state.smooth = 72;

        state.brightness = 25;

        state.glow = 35;

        state.warmth = 6;

        state.detail = 12;

    }


    /* =====================================================
       CSS FILTER
       ===================================================== */

    function getCSSFilter() {

        if (!state.enabled) {

            return "none";

        }


        const brightness =
            100 +
            state.brightness * 0.30;


        const contrast =
            100 +
            state.detail * 0.04;


        const saturation =
            100 +
            state.warmth * 1.4;


        return `
            brightness(${brightness}%)
            contrast(${contrast}%)
            saturate(${saturation}%)
        `;

    }


    /* =====================================================
       GET PERSON SEGMENTATION
       ===================================================== */

    function getPersonMask(
        video,
        timestamp
    ) {

        const segmenter =
            window.ChukPersonSegmenter;


        if (
            !segmenter ||
            !video ||
            video.readyState < 2
        ) {

            return null;

        }


        try {

            const result =
                segmenter.segmentForVideo(
                    video,
                    timestamp
                );


            if (
                !result ||
                !result.categoryMask
            ) {

                return null;

            }


            return result.categoryMask;

        } catch (error) {

            console.warn(
                "CHUK BODY SEGMENTATION:",
                error
            );


            return null;

        }

    }


    /* =====================================================
       BUILD BODY MASK
       ===================================================== */

    function buildBodyMask(
        categoryMask,
        width,
        height
    ) {

        if (!categoryMask) {

            return false;

        }


        ensureCanvases(
            width,
            height
        );


        const mask =
            categoryMask;


        const maskWidth =
            mask.width;


        const maskHeight =
            mask.height;


        if (
            !maskWidth ||
            !maskHeight
        ) {

            return false;

        }


        try {

            const maskData =
                mask.getAsUint8Array();


            if (!maskData) {

                return false;

            }


            const imageData =
                bodyMaskCtx.createImageData(
                    width,
                    height
                );


            const pixels =
                imageData.data;


            const scaleX =
                maskWidth / width;


            const scaleY =
                maskHeight / height;


            let detected = false;


            for (
                let y = 0;
                y < height;
                y++
            ) {

                const sy =
                    Math.min(
                        maskHeight - 1,
                        Math.floor(
                            y * scaleY
                        )
                    );


                for (
                    let x = 0;
                    x < width;
                    x++
                ) {

                    const sx =
                        Math.min(
                            maskWidth - 1,
                            Math.floor(
                                x * scaleX
                            )
                        );


                    const index =
                        sy * maskWidth +
                        sx;


                    const category =
                        maskData[index];


                    const pixel =
                        (
                            y * width +
                            x
                        ) * 4;


                    /*
                     * Selfie/person segmentation
                     * normally uses person category.
                     *
                     * 0 = background
                     * 1 = person
                     */

                    if (
                        category > 0
                    ) {

                        pixels[pixel] = 255;

                        pixels[pixel + 1] = 255;

                        pixels[pixel + 2] = 255;

                        pixels[pixel + 3] = 255;

                        detected = true;

                    } else {

                        pixels[pixel] = 0;

                        pixels[pixel + 1] = 0;

                        pixels[pixel + 2] = 0;

                        pixels[pixel + 3] = 0;

                    }

                }

            }


            bodyMaskCtx.putImageData(
                imageData,
                0,
                0
            );


            state.bodyDetected =
                detected;


            return detected;

        } catch (error) {

            console.warn(
                "CHUK BODY MASK ERROR:",
                error
            );


            state.bodyDetected =
                false;


            return false;

        }

    }


    /* =====================================================
       SOFT BODY BEAUTY
       ===================================================== */

    function applyBodyBeauty(
        ctx,
        sourceCanvas,
        width,
        height
    ) {

        if (
            !state.enabled ||
            !bodyMaskCanvas
        ) {

            return;

        }


        const smooth =
            Math.max(
                0,
                Math.min(
                    100,
                    state.smooth
                )
            );


        if (smooth <= 0) {

            return;

        }


        /*
         * Clear previous layer
         */

        bodyLayerCtx.clearRect(
            0,
            0,
            width,
            height
        );


        /*
         * Softened full-frame copy
         */

        bodyLayerCtx.save();


        bodyLayerCtx.filter =
            `blur(${Math.max(
                0.4,
                smooth * 0.035
            )}px)`;


        bodyLayerCtx.drawImage(
            sourceCanvas,
            0,
            0,
            width,
            height
        );


        bodyLayerCtx.restore();


        /*
         * Keep only the person.
         */

        bodyLayerCtx.globalCompositeOperation =
            "destination-in";


        bodyLayerCtx.drawImage(
            bodyMaskCanvas,
            0,
            0,
            width,
            height
        );


        bodyLayerCtx.globalCompositeOperation =
            "source-over";


        /*
         * Blend softened body over original.
         */

        ctx.save();


        ctx.globalAlpha =
            Math.min(
                0.70,
                smooth / 120
            );


        ctx.drawImage(
            bodyLayerCanvas,
            0,
            0,
            width,
            height
        );


        ctx.restore();

    }


    /* =====================================================
       BODY LIGHT
       ===================================================== */

    function applyBodyLight(
        ctx,
        width,
        height
    ) {

        if (
            !state.enabled ||
            !bodyMaskCanvas
        ) {

            return;

        }


        const amount =
            Math.min(
                0.20,
                state.brightness / 450
            );


        if (amount <= 0) {

            return;

        }


        glowLayerCtx.clearRect(
            0,
            0,
            width,
            height
        );


        glowLayerCtx.fillStyle =
            `rgba(
                255,
                244,
                232,
                ${amount}
            )`;


        glowLayerCtx.fillRect(
            0,
            0,
            width,
            height
        );


        glowLayerCtx.globalCompositeOperation =
            "destination-in";


        glowLayerCtx.drawImage(
            bodyMaskCanvas,
            0,
            0,
            width,
            height
        );


        glowLayerCtx.globalCompositeOperation =
            "source-over";


        ctx.save();


        ctx.globalCompositeOperation =
            "screen";


        ctx.globalAlpha =
            0.85;


        ctx.drawImage(
            glowLayerCanvas,
            0,
            0,
            width,
            height
        );


        ctx.restore();

    }


    /* =====================================================
       BODY GLOW
       ===================================================== */

    function applyBodyGlow(
        ctx,
        sourceCanvas,
        width,
        height
    ) {

        if (
            !state.enabled ||
            !bodyMaskCanvas ||
            state.glow <= 0
        ) {

            return;

        }


        glowLayerCtx.clearRect(
            0,
            0,
            width,
            height
        );


        /*
         * Create soft glow from person.
         */

        glowLayerCtx.save();


        glowLayerCtx.filter =
            `blur(${2 +
                state.glow * 0.025
            }px)`;


        glowLayerCtx.globalAlpha =
            Math.min(
                0.16,
                state.glow / 600
            );


        glowLayerCtx.drawImage(
            sourceCanvas,
            0,
            0,
            width,
            height
        );


        glowLayerCtx.restore();


        /*
         * Mask glow to body.
         */

        glowLayerCtx.globalCompositeOperation =
            "destination-in";


        glowLayerCtx.drawImage(
            bodyMaskCanvas,
            0,
            0,
            width,
            height
        );


        glowLayerCtx.globalCompositeOperation =
            "source-over";


        ctx.save();


        ctx.globalCompositeOperation =
            "screen";


        ctx.drawImage(
            glowLayerCanvas,
            0,
            0,
            width,
            height
        );


        ctx.restore();

    }


    /* =====================================================
       FACE MASK
       ===================================================== */

    function createFaceMask(
        ctx,
        landmarks,
        width,
        height
    ) {

        if (
            !landmarks ||
            !landmarks.length
        ) {

            return null;

        }


        let minX = 1;

        let minY = 1;

        let maxX = 0;

        let maxY = 0;


        for (const point of landmarks) {

            if (!point) continue;


            minX =
                Math.min(
                    minX,
                    point.x
                );


            minY =
                Math.min(
                    minY,
                    point.y
                );


            maxX =
                Math.max(
                    maxX,
                    point.x
                );


            maxY =
                Math.max(
                    maxY,
                    point.y
                );

        }


        if (
            maxX <= minX ||
            maxY <= minY
        ) {

            return null;

        }


        const centerX =
            ((minX + maxX) / 2) *
            width;


        const centerY =
            ((minY + maxY) / 2) *
            height;


        const radiusX =
            (maxX - minX) *
            width *
            0.54;


        const radiusY =
            (maxY - minY) *
            height *
            0.57;


        ctx.beginPath();


        ctx.ellipse(
            centerX,
            centerY,
            radiusX,
            radiusY,
            0,
            0,
            Math.PI * 2
        );


        return ctx;

    }


    /* =====================================================
       FACE SMOOTH
       ===================================================== */

    function applyFaceSmooth(
        ctx,
        sourceCanvas,
        landmarks,
        width,
        height
    ) {

        if (
            !state.enabled ||
            !landmarks ||
            !landmarks.length
        ) {

            return;

        }


        const maskCanvas =
            document.createElement(
                "canvas"
            );


        maskCanvas.width =
            width;

        maskCanvas.height =
            height;


        const maskCtx =
            maskCanvas.getContext(
                "2d"
            );


        const face =
            createFaceMask(
                maskCtx,
                landmarks,
                width,
                height
            );


        if (!face) {

            return;

        }


        face.fillStyle =
            "#ffffff";


        face.fill();


        maskCtx.globalCompositeOperation =
            "source-in";


        maskCtx.filter =
            `blur(${Math.max(
                1,
                state.smooth * 0.05
            )}px)`;


        maskCtx.drawImage(
            sourceCanvas,
            0,
            0,
            width,
            height
        );


        ctx.save();


        ctx.globalAlpha =
            Math.min(
                0.78,
                state.smooth / 100
            );


        ctx.drawImage(
            maskCanvas,
            0,
            0,
            width,
            height
        );


        ctx.restore();

    }


    /* =====================================================
       FACE GLOW
       ===================================================== */

    function applyFaceGlow(
        ctx,
        landmarks,
        width,
        height
    ) {

        if (
            !state.enabled ||
            !landmarks ||
            !landmarks.length ||
            state.glow <= 0
        ) {

            return;

        }


        const glowCanvas =
            document.createElement(
                "canvas"
            );


        glowCanvas.width =
            width;

        glowCanvas.height =
            height;


        const glowCtx =
            glowCanvas.getContext(
                "2d"
            );


        const face =
            createFaceMask(
                glowCtx,
                landmarks,
                width,
                height
            );


        if (!face) {

            return;

        }


        face.fillStyle =
            `rgba(
                255,
                240,
                225,
                ${Math.min(
                    0.20,
                    state.glow / 500
                )}
            )`;


        face.shadowColor =
            "rgba(255,240,225,0.35)";


        face.shadowBlur =
            12 +
            state.glow * 0.20;


        face.fill();


        ctx.save();


        ctx.globalCompositeOperation =
            "screen";


        ctx.globalAlpha =
            0.75;


        ctx.drawImage(
            glowCanvas,
            0,
            0
        );


        ctx.restore();

    }


    /* =====================================================
       MAIN V4
       ===================================================== */

    function apply(
        ctx,
        sourceCanvas,
        landmarks,
        width,
        height
    ) {

        if (!state.enabled) {

            return;

        }


        /*
         * V4 menerima body mask yang dibuat
         * oleh segmenter.
         *
         * Jika segmenter belum siap,
         * wajah tetap bisa diproses.
         */

        if (
            state.bodyDetected &&
            bodyMaskCanvas
        ) {

            /*
             * 1. Full body smoothing
             */

            applyBodyBeauty(
                ctx,
                sourceCanvas,
                width,
                height
            );


            /*
             * 2. Body brightness
             */

            applyBodyLight(
                ctx,
                width,
                height
            );


            /*
             * 3. Body glow
             */

            applyBodyGlow(
                ctx,
                sourceCanvas,
                width,
                height
            );

        }


        /*
         * 4. Face enhancement
         */

        if (
            landmarks &&
            landmarks.length
        ) {

            applyFaceSmooth(
                ctx,
                sourceCanvas,
                landmarks,
                width,
                height
            );


            applyFaceGlow(
                ctx,
                landmarks,
                width,
                height
            );

        }

    }


    /* =====================================================
       V4 SEGMENTATION UPDATE
       Dipanggil dari live.js jika tersedia.
       ===================================================== */

    function updateBodyMask(
        video,
        timestamp,
        width,
        height
    ) {

        const categoryMask =
            getPersonMask(
                video,
                timestamp
            );


        if (!categoryMask) {

            state.bodyDetected =
                false;

            return false;

        }


        return buildBodyMask(
            categoryMask,
            width,
            height
        );

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    return {

        state,

        set,

        get,

        enable,

        disable,

        toggle,

        reset,

        natural,

        beauty,

        dream,

        getCSSFilter,

        getPersonMask,

        buildBodyMask,

        updateBodyMask,

        applyBodyBeauty,

        applyBodyLight,

        applyBodyGlow,

        createFaceMask,

        applyFaceSmooth,

        applyFaceGlow,

        apply

    };

})();
