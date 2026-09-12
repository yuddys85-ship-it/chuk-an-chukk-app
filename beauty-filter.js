/* =========================================================
   CHUK AN CHUKK
   BEAUTY FILTER V2
   FACE-AWARE BEAUTY ENGINE
   ========================================================= */

window.ChukBeauty = (() => {

    const state = {

        enabled: true,

        smooth: 45,

        brightness: 18,

        glow: 18,

        warmth: 4,

        detail: 22,

        faceDetected: false

    };


    /* =====================================================
       BASIC STATE
       ===================================================== */

    function set(name, value) {

        if (!(name in state)) return;

        state[name] = Number(value);

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

        state.enabled = !state.enabled;

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

        state.smooth = 55;

        state.brightness = 18;

        state.glow = 20;

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
       CSS CAMERA FILTER
       ===================================================== */

    function getCSSFilter() {

        if (!state.enabled) {

            return "none";

        }


        const brightness =
            100 + state.brightness * 0.35;

        const contrast =
            100 + state.detail * 0.05;

        const saturation =
            100 + state.warmth * 1.5;


        return `
            brightness(${brightness}%)
            contrast(${contrast}%)
            saturate(${saturation}%)
        `;

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


        const points = landmarks;


        let minX = 1;
        let minY = 1;

        let maxX = 0;
        let maxY = 0;


        for (const point of points) {

            if (!point) continue;

            minX = Math.min(
                minX,
                point.x
            );

            minY = Math.min(
                minY,
                point.y
            );

            maxX = Math.max(
                maxX,
                point.x
            );

            maxY = Math.max(
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
            ((minX + maxX) / 2) * width;

        const centerY =
            ((minY + maxY) / 2) * height;


        const faceWidth =
            (maxX - minX) * width;

        const faceHeight =
            (maxY - minY) * height;


        const radiusX =
            faceWidth * 0.53;

        const radiusY =
            faceHeight * 0.56;


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
       CUT DETAIL AREAS
       Keep eyes / mouth sharper
       ===================================================== */

    function cutDetailAreas(
        ctx,
        landmarks,
        width,
        height
    ) {

        if (
            !landmarks ||
            landmarks.length < 400
        ) {

            return;

        }


        /*
         * MediaPipe Face Landmarker
         * approximate eye / mouth regions.
         */


        const areas = [

            /*
             * Left eye
             */
            [
                [33, 133],
                [159, 145]
            ],

            /*
             * Right eye
             */
            [
                [362, 263],
                [386, 374]
            ],

            /*
             * Mouth
             */
            [
                [61, 291],
                [13, 14]
            ]

        ];


        ctx.save();


        ctx.globalCompositeOperation =
            "destination-out";


        for (const area of areas) {

            const horizontal =
                area[0];

            const vertical =
                area[1];


            const p1 =
                landmarks[horizontal[0]];

            const p2 =
                landmarks[horizontal[1]];

            const p3 =
                landmarks[vertical[0]];

            const p4 =
                landmarks[vertical[1]];


            if (
                !p1 ||
                !p2 ||
                !p3 ||
                !p4
            ) {

                continue;

            }


            const cx =
                (
                    p1.x +
                    p2.x
                ) / 2 * width;


            const cy =
                (
                    p3.y +
                    p4.y
                ) / 2 * height;


            const rx =
                Math.abs(
                    p2.x -
                    p1.x
                ) * width * 0.72;


            const ry =
                Math.abs(
                    p4.y -
                    p3.y
                ) * height * 0.95;


            ctx.beginPath();

            ctx.ellipse(
                cx,
                cy,
                Math.max(rx, 5),
                Math.max(ry, 5),
                0,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }


        ctx.restore();

    }


    /* =====================================================
       FACE SMOOTHING
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
            document.createElement("canvas");

        maskCanvas.width = width;
        maskCanvas.height = height;


        const maskCtx =
            maskCanvas.getContext("2d");


        /*
         * Face mask
         */

        maskCtx.fillStyle =
            "#ffffff";

        maskCtx.beginPath();


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


        /*
         * Feather mask
         */

        maskCtx.globalCompositeOperation =
            "source-in";


        /*
         * Slightly softened copy
         */

        maskCtx.filter =
            `blur(${Math.max(
                1,
                state.smooth * 0.045
            )}px)`;


        maskCtx.drawImage(
            sourceCanvas,
            0,
            0,
            width,
            height
        );


        /*
         * Draw softened face
         */

        ctx.save();


        ctx.globalAlpha =
            Math.min(
                0.82,
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
            !landmarks.length
        ) {

            return;

        }


        const maskCanvas =
            document.createElement("canvas");

        maskCanvas.width = width;
        maskCanvas.height = height;


        const maskCtx =
            maskCanvas.getContext("2d");


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


        /*
         * Soft white / warm glow.
         */

        face.fillStyle =
            `rgba(
                255,
                240,
                225,
                ${Math.min(
                    0.22,
                    state.glow / 450
                )}
            )`;

        face.shadowColor =
            "rgba(255,240,225,0.35)";

        face.shadowBlur =
            18 + state.glow * 0.18;


        face.fill();


        ctx.save();


        ctx.globalCompositeOperation =
            "screen";

        ctx.globalAlpha =
            0.65;


        ctx.drawImage(
            maskCanvas,
            0,
            0
        );


        ctx.restore();

    }


    /* =====================================================
       MAIN FACE FILTER
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


        if (
            !landmarks ||
            !landmarks.length
        ) {

            return;

        }


        /*
         * 1. Face smoothing
         */

        applyFaceSmooth(
            ctx,
            sourceCanvas,
            landmarks,
            width,
            height
        );


        /*
         * 2. Keep important facial details sharp.
         */

        /*
         * Detail preservation is intentionally
         * subtle to prevent holes in the image.
         */

        if (state.detail > 35) {

            ctx.save();

            ctx.globalAlpha =
                Math.min(
                    0.18,
                    state.detail / 500
                );

            ctx.filter =
                "contrast(105%)";

            ctx.drawImage(
                sourceCanvas,
                0,
                0,
                width,
                height
            );

            ctx.restore();

        }

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

        createFaceMask,

        cutDetailAreas,

        applyFaceSmooth,

        applyFaceGlow,

        apply

    };

})();
