/* =========================================================
   CHUK AN CHUKK
   DREAM LIKE PLASTIC FILTER
   VERSION 2

   FEATURES:
   - Plastic Skin
   - Dream Glow
   - Brightness
   - Soft Focus
   - Face Detail
   - Auto Day / Night Compensation
   - Anti Zoom
   - Low Memory Canvas
   ========================================================= */

(function () {

    "use strict";


    class DreamLikePlastic {

        constructor(video, canvas) {

            this.video =
                video;

            this.canvas =
                canvas;

            this.ctx =
                canvas.getContext(
                    "2d",
                    {
                        alpha: false,
                        desynchronized: true
                    }
                );


            this.enabled =
                true;

            this.running =
                false;

            this.autoLight =
                true;

            this.animationFrame =
                null;


            /* -----------------------------------------
               SETTINGS
            ----------------------------------------- */

            this.settings = {

                plastic: 90,

                glow: 65,

                brightness: 35,

                softFocus: 55,

                detail: 25,

                strength: 90

            };


            /* -----------------------------------------
               OFFSCREEN CANVAS
               Dibuat SATU kali saja.
            ----------------------------------------- */

            this.workCanvas =
                document.createElement(
                    "canvas"
                );

            this.workCtx =
                this.workCanvas.getContext(
                    "2d",
                    {
                        alpha: false
                    }
                );


            this.blurCanvas =
                document.createElement(
                    "canvas"
                );

            this.blurCtx =
                this.blurCanvas.getContext(
                    "2d",
                    {
                        alpha: true
                    }
                );


            this.lastWidth =
                0;

            this.lastHeight =
                0;


            this.lightValue =
                1;


            this.lastRender =
                0;


            this.targetFPS =
                24;

        }


        /* =================================================
           START
        ================================================= */

        start() {

            if (this.running) {
                return;
            }


            this.running =
                true;


            this.resize();


            this.render();

        }


        /* =================================================
           STOP
        ================================================= */

        stop() {

            this.running =
                false;


            if (
                this.animationFrame
            ) {

                cancelAnimationFrame(
                    this.animationFrame
                );

                this.animationFrame =
                    null;

            }

        }


        /* =================================================
           RESIZE
        ================================================= */

        resize() {

            if (!this.video) {
                return;
            }


            const width =
                this.video.videoWidth ||
                720;


            const height =
                this.video.videoHeight ||
                1280;


            if (
                width <= 0 ||
                height <= 0
            ) {
                return;
            }


            if (
                width ===
                    this.lastWidth &&
                height ===
                    this.lastHeight
            ) {

                return;

            }


            this.lastWidth =
                width;

            this.lastHeight =
                height;


            this.canvas.width =
                width;

            this.canvas.height =
                height;


            this.workCanvas.width =
                width;

            this.workCanvas.height =
                height;


            this.blurCanvas.width =
                width;

            this.blurCanvas.height =
                height;

        }


        /* =================================================
           SETTING
        ================================================= */

        setSetting(
            name,
            value
        ) {

            if (
                !Object.prototype.hasOwnProperty.call(
                    this.settings,
                    name
                )
            ) {

                return;

            }


            value =
                Number(value);


            if (
                !Number.isFinite(value)
            ) {

                return;

            }


            this.settings[name] =
                Math.max(
                    0,
                    Math.min(
                        100,
                        value
                    )
                );

        }


        setSettings(settings) {

            if (!settings) {
                return;
            }


            Object.keys(
                this.settings
            ).forEach(name => {

                if (
                    settings[name] !==
                    undefined
                ) {

                    this.setSetting(
                        name,
                        settings[name]
                    );

                }

            });

        }


        /* =================================================
           AUTO LIGHT
        ================================================= */

        setAutoLight(enabled) {

            this.autoLight =
                Boolean(enabled);

        }


        /* =================================================
           MAIN RENDER LOOP
        ================================================= */

        render() {

            if (!this.running) {
                return;
            }


            this.animationFrame =
                requestAnimationFrame(
                    () => this.render()
                );


            if (
                !this.video ||
                this.video.readyState <
                    2
            ) {

                return;

            }


            const now =
                performance.now();


            /*
             * 24 FPS cukup halus untuk filter
             * sekaligus lebih ringan di HP.
             */

            const frameDelay =
                1000 /
                this.targetFPS;


            if (
                now -
                this.lastRender <
                frameDelay
            ) {

                return;

            }


            this.lastRender =
                now;


            this.resize();


            if (!this.enabled) {

                this.drawOriginal();

                return;

            }


            this.applyFilter();

        }


        /* =================================================
           ORIGINAL CAMERA
        ================================================= */

        drawOriginal() {

            const width =
                this.canvas.width;

            const height =
                this.canvas.height;


            this.ctx.save();

            this.ctx.clearRect(
                0,
                0,
                width,
                height
            );


            this.drawVideoContain(
                this.ctx,
                this.video,
                width,
                height
            );


            this.ctx.restore();

        }


        /* =================================================
           FILTER
        ================================================= */

        applyFilter() {

            const width =
                this.canvas.width;

            const height =
                this.canvas.height;


            if (
                width <= 0 ||
                height <= 0
            ) {

                return;

            }


            /* -----------------------------------------
               AUTO LIGHT
            ----------------------------------------- */

            let light =
                this.autoLight
                    ? this.calculateLight()
                    : 1;


            this.lightValue =
                light;


            /* -----------------------------------------
               WORK CANVAS
            ----------------------------------------- */

            const wctx =
                this.workCtx;


            wctx.clearRect(
                0,
                0,
                width,
                height
            );


            /*
             * Anti zoom:
             * kamera digambar dengan object-fit: contain
             * secara manual.
             */

            this.drawVideoContain(
                wctx,
                this.video,
                width,
                height
            );


            /* -----------------------------------------
               IMAGE COLOR
            ----------------------------------------- */

            const brightness =
                this.settings.brightness /
                100;


            const contrast =
                1 +
                (
                    this.settings.detail /
                    100
                ) *
                0.10;


            const autoBrightness =
                1 +
                (
                    1 - light
                ) *
                0.35;


            const finalBrightness =
                (
                    1 +
                    brightness *
                    0.22
                ) *
                autoBrightness;


            wctx.filter =
                `brightness(${finalBrightness}) contrast(${contrast}) saturate(1.05)`;


            wctx.drawImage(
                this.workCanvas,
                0,
                0,
                width,
                height
            );


            wctx.filter =
                "none";


            /* -----------------------------------------
               SOFT FOCUS / PLASTIC SKIN
            ----------------------------------------- */

            const plastic =
                this.settings.plastic /
                100;


            const soft =
                this.settings.softFocus /
                100;


            const blurAmount =
                (
                    plastic *
                    1.7
                ) +
                (
                    soft *
                    1.2
                );


            if (
                blurAmount >
                0.05
            ) {

                const bctx =
                    this.blurCtx;


                bctx.clearRect(
                    0,
                    0,
                    width,
                    height
                );


                bctx.filter =
                    `blur(${blurAmount}px)`;


                bctx.drawImage(
                    this.workCanvas,
                    0,
                    0,
                    width,
                    height
                );


                bctx.filter =
                    "none";


                /*
                 * Soft blend.
                 * Tidak full blur supaya mata,
                 * hidung dan rambut tetap terlihat.
                 */

                const skinAlpha =
                    0.08 +
                    (
                        plastic *
                        0.18
                    ) +
                    (
                        soft *
                        0.10
                    );


                this.ctx.globalAlpha =
                    Math.min(
                        0.34,
                        skinAlpha
                    );


                this.ctx.drawImage(
                    this.blurCanvas,
                    0,
                    0,
                    width,
                    height
                );


                this.ctx.globalAlpha =
                    1;

            }


            /* -----------------------------------------
               ORIGINAL DETAIL
            ----------------------------------------- */

            const detail =
                this.settings.detail /
                100;


            /*
             * Menambahkan sedikit gambar original
             * agar hasil tidak terlalu plastik.
             */

            if (detail > 0) {

                this.ctx.globalAlpha =
                    0.16 +
                    detail *
                    0.18;


                this.ctx.drawImage(
                    this.workCanvas,
                    0,
                    0,
                    width,
                    height
                );


                this.ctx.globalAlpha =
                    1;

            }


            /* -----------------------------------------
               DREAM GLOW
            ----------------------------------------- */

            const glow =
                this.settings.glow /
                100;


            if (glow > 0) {

                this.ctx.save();


                this.ctx.globalAlpha =
                    0.035 +
                    glow *
                    0.085;


                this.ctx.filter =
                    `blur(${4 + glow * 5}px) brightness(1.08)`;


                this.ctx.drawImage(
                    this.workCanvas,
                    0,
                    0,
                    width,
                    height
                );


                this.ctx.restore();

            }


            /* -----------------------------------------
               FINAL BRIGHTNESS
            ----------------------------------------- */

            if (
                brightness >
                0.01
            ) {

                this.ctx.save();


                this.ctx.globalAlpha =
                    brightness *
                    0.08;


                this.ctx.globalCompositeOperation =
                    "screen";


                this.ctx.fillStyle =
                    "#ffffff";


                this.ctx.fillRect(
                    0,
                    0,
                    width,
                    height
                );


                this.ctx.restore();

            }

        }


        /* =================================================
           VIDEO CONTAIN
           ANTI ZOOM
        ================================================= */

        drawVideoContain(
            context,
            source,
            targetWidth,
            targetHeight
        ) {

            const sourceWidth =
                source.videoWidth ||
                targetWidth;


            const sourceHeight =
                source.videoHeight ||
                targetHeight;


            if (
                sourceWidth <= 0 ||
                sourceHeight <= 0
            ) {

                return;

            }


            const sourceRatio =
                sourceWidth /
                sourceHeight;


            const targetRatio =
                targetWidth /
                targetHeight;


            let drawWidth;

            let drawHeight;

            let x;

            let y;


            /*
             * CONTAIN:
             * seluruh gambar kamera terlihat.
             * Tidak crop.
             */

            if (
                sourceRatio >
                targetRatio
            ) {

                drawWidth =
                    targetWidth;

                drawHeight =
                    targetWidth /
                    sourceRatio;

                x = 0;

                y =
                    (
                        targetHeight -
                        drawHeight
                    ) /
                    2;

            } else {

                drawHeight =
                    targetHeight;

                drawWidth =
                    targetHeight *
                    sourceRatio;

                y = 0;

                x =
                    (
                        targetWidth -
                        drawWidth
                    ) /
                    2;

            }


            context.drawImage(
                source,
                x,
                y,
                drawWidth,
                drawHeight
            );

        }


        /* =================================================
           LIGHT DETECTION
        ================================================= */

        calculateLight() {

            const width =
                64;

            const height =
                64;


            /*
             * Sampling kecil supaya ringan.
             */

            const sampleCanvas =
                this.lightCanvas ||
                (
                    this.lightCanvas =
                    document.createElement(
                        "canvas"
                    )
                );


            const sampleCtx =
                this.lightCtx ||
                (
                    this.lightCtx =
                    sampleCanvas.getContext(
                        "2d",
                        {
                            willReadFrequently:
                                true
                        }
                    )
                );


            sampleCanvas.width =
                width;

            sampleCanvas.height =
                height;


            try {

                sampleCtx.drawImage(
                    this.video,
                    0,
                    0,
                    width,
                    height
                );


                const data =
                    sampleCtx.getImageData(
                        0,
                        0,
                        width,
                        height
                    ).data;


                let total =
                    0;


                const pixels =
                    data.length /
                    4;


                for (
                    let i = 0;
                    i < data.length;
                    i += 16
                ) {

                    const r =
                        data[i];

                    const g =
                        data[i + 1];

                    const b =
                        data[i + 2];


                    /*
                     * Luminance.
                     */

                    total +=
                        (
                            0.2126 * r +
                            0.7152 * g +
                            0.0722 * b
                        ) /
                        255;

                }


                const brightness =
                    total /
                    Math.max(
                        1,
                        Math.ceil(
                            pixels / 4
                        )
                    );


                /*
                 * Smooth agar brightness tidak
                 * loncat-loncat.
                 */

                const target =
                    brightness < 0.28
                        ? 1.14
                        : brightness < 0.45
                            ? 1.08
                            : brightness > 0.78
                                ? 0.97
                                : 1.0;


                return (
                    this.lightValue *
                    0.90
                ) +
                (
                    target *
                    0.10
                );

            } catch (error) {

                return 1;

            }

        }

    }


    /* =====================================================
       GLOBAL
    ===================================================== */

    window.DreamLikePlastic =
        DreamLikePlastic;


})();
