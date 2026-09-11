/* =========================================================
   CHUK AN CHUKK
   DREAM-LIKE FILTER
   INTERNAL NAME: DreamLikePlastic
   ========================================================= */

(function (window) {

    "use strict";


    class DreamLikePlastic {

        constructor(video, canvas) {

            this.video = video;

            this.canvas = canvas;

            this.ctx =
                canvas.getContext(
                    "2d",
                    {
                        alpha: false,
                        willReadFrequently: false
                    }
                );


            this.workCanvas =
                document.createElement(
                    "canvas"
                );

            this.workCtx =
                this.workCanvas.getContext(
                    "2d"
                );


            this.blurCanvas =
                document.createElement(
                    "canvas"
                );

            this.blurCtx =
                this.blurCanvas.getContext(
                    "2d"
                );


            this.running = false;

            this.animationFrame = null;


            this.settings = {

                plastic: 90,

                glow: 65,

                brightness: 35,

                softFocus: 55,

                detail: 25,

                strength: 90

            };


            this.autoLight = true;


            this.lastWidth = 0;

            this.lastHeight = 0;

        }


        /* =================================================
           START
           ================================================= */

        start() {

            if (this.running) {
                return;
            }


            this.running = true;


            this.resize();


            this.render();

        }


        /* =================================================
           STOP
           ================================================= */

        stop() {

            this.running = false;


            if (
                this.animationFrame
            ) {

                cancelAnimationFrame(
                    this.animationFrame
                );

            }


            this.animationFrame =
                null;

        }


        /* =================================================
           RESIZE
           ================================================= */

        resize() {

            const width =
                this.video.videoWidth ||
                this.canvas.width ||
                720;


            const height =
                this.video.videoHeight ||
                this.canvas.height ||
                1280;


            if (
                width <= 0 ||
                height <= 0
            ) {

                return;

            }


            if (
                this.lastWidth === width &&
                this.lastHeight === height
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
           SETTINGS
           ================================================= */

        setSetting(
            name,
            value
        ) {

            if (
                Object.prototype.hasOwnProperty
                    .call(
                        this.settings,
                        name
                    )
            ) {

                this.settings[name] =
                    Number(value);

            }

        }


        setSettings(settings) {

            if (!settings) {
                return;
            }


            Object.keys(
                settings
            ).forEach(
                (key) => {

                    if (
                        Object.prototype
                            .hasOwnProperty
                            .call(
                                this.settings,
                                key
                            )
                    ) {

                        this.settings[key] =
                            Number(
                                settings[key]
                            );

                    }

                }
            );

        }


        setAutoLight(enabled) {

            this.autoLight =
                Boolean(enabled);

        }


        /* =================================================
           RENDER
           ================================================= */

        render() {

            if (!this.running) {
                return;
            }


            if (
                !this.video ||
                this.video.readyState < 2
            ) {

                this.animationFrame =
                    requestAnimationFrame(
                        () => this.render()
                    );

                return;

            }


            try {

                this.resize();


                if (
                    this.canvas.width <= 0 ||
                    this.canvas.height <= 0
                ) {

                    this.animationFrame =
                        requestAnimationFrame(
                            () => this.render()
                        );

                    return;

                }


                this.applyFilter();

            } catch (error) {

                console.error(
                    "❌ Dream filter render error:",
                    error
                );


                /*
                   Jangan biarkan error filter
                   menghentikan loop kamera.
                */

            }


            this.animationFrame =
                requestAnimationFrame(
                    () => this.render()
                );

        }


        /* =================================================
           APPLY FILTER
           ================================================= */

        applyFilter() {

            const width =
                this.canvas.width;


            const height =
                this.canvas.height;


            /*
               Frame asli
            */

            this.workCtx.clearRect(
                0,
                0,
                width,
                height
            );


            this.drawVideoCover(
                this.workCtx,
                this.video,
                width,
                height
            );


            /*
               Ambil frame
            */

            const image =
                this.workCtx.getImageData(
                    0,
                    0,
                    width,
                    height
                );


            const data =
                image.data;


            const plastic =
                this.settings.plastic / 100;


            const brightness =
                this.settings.brightness / 100;


            const detail =
                this.settings.detail / 100;


            /*
               Beauty skin sederhana.
               Bekerja pada warna kulit,
               bukan AI face segmentation.
            */

            for (
                let i = 0;
                i < data.length;
                i += 4
            ) {

                const r =
                    data[i];


                const g =
                    data[i + 1];


                const b =
                    data[i + 2];


                const max =
                    Math.max(
                        r,
                        g,
                        b
                    );


                const min =
                    Math.min(
                        r,
                        g,
                        b
                    );


                const skinLike =
                    r > 60 &&
                    r > g * 1.08 &&
                    r > b * 1.12 &&
                    (max - min) > 15;


                if (skinLike) {

                    /*
                       Plastic Skin
                    */

                    const avg =
                        (r + g + b) /
                        3;


                    data[i] =
                        r +
                        (avg - r) *
                        plastic *
                        0.18;


                    data[i + 1] =
                        g +
                        (avg - g) *
                        plastic *
                        0.10;


                    data[i + 2] =
                        b +
                        (avg - b) *
                        plastic *
                        0.08;

                }


                /*
                   Brightness
                */

                const boost =
                    1 +
                    brightness *
                    0.18;


                data[i] =
                    Math.min(
                        255,
                        data[i] *
                        boost
                    );


                data[i + 1] =
                    Math.min(
                        255,
                        data[i + 1] *
                        boost
                    );


                data[i + 2] =
                    Math.min(
                        255,
                        data[i + 2] *
                        boost
                    );


                /*
                   Face detail protection
                */

                if (
                    detail > 0 &&
                    skinLike
                ) {

                    data[i] =
                        data[i] * 0.98 +
                        r * 0.02;

                    data[i + 1] =
                        data[i + 1] * 0.98 +
                        g * 0.02;

                    data[i + 2] =
                        data[i + 2] * 0.98 +
                        b * 0.02;

                }

            }


            this.workCtx.putImageData(
                image,
                0,
                0
            );


            /*
               Soft Focus
            */

            const soft =
                this.settings.softFocus /
                100;


            this.ctx.clearRect(
                0,
                0,
                width,
                height
            );


            if (soft > 0.01) {

                this.blurCtx.clearRect(
                    0,
                    0,
                    width,
                    height
                );


                this.blurCtx.filter =
                    "blur(" +
                    (
                        soft * 2.2
                    ).toFixed(1) +
                    "px)";


                this.blurCtx.drawImage(
                    this.workCanvas,
                    0,
                    0
                );


                this.blurCtx.filter =
                    "none";


                /*
                   Original
                */

                this.ctx.globalAlpha =
                    1;


                this.ctx.drawImage(
                    this.workCanvas,
                    0,
                    0
                );


                /*
                   Glow / Soft
                */

                const glow =
                    this.settings.glow /
                    100;


                this.ctx.globalAlpha =
                    glow * 0.18;


                this.ctx.globalCompositeOperation =
                    "screen";


                this.ctx.drawImage(
                    this.blurCanvas,
                    0,
                    0
                );


                this.ctx.globalAlpha =
                    1;

                this.ctx.globalCompositeOperation =
                    "source-over";

            } else {

                this.ctx.drawImage(
                    this.workCanvas,
                    0,
                    0
                );

            }

        }


        /* =================================================
           DRAW VIDEO COVER
           ================================================= */

        drawVideoCover(
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
               COVER:
               layar penuh tanpa black bar.
            */

            if (
                sourceRatio >
                targetRatio
            ) {

                drawHeight =
                    targetHeight;


                drawWidth =
                    targetHeight *
                    sourceRatio;


                x =
                    (
                        targetWidth -
                        drawWidth
                    ) / 2;


                y = 0;

            } else {

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
                    ) / 2;

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
           COMPATIBILITY NAME
           ================================================= */

        drawVideoContain(
            context,
            source,
            targetWidth,
            targetHeight
        ) {

            /*
               Nama internal tetap dipertahankan
               untuk kompatibilitas kode lama.
            */

            this.drawVideoCover(
                context,
                source,
                targetWidth,
                targetHeight
            );

        }

    }


    /* =====================================================
       GLOBAL
       ===================================================== */

    window.DreamLikePlastic =
        DreamLikePlastic;


    console.log(
        "✨ DreamLikePlastic loaded"
    );


})(window);
