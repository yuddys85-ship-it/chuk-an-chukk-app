/* =========================================================
   CHUK AN CHUKK
   DREAM-LIKE-FILTER.JS
   BEAUTY FILTER ENGINE
   =========================================================

   Internal name:
   DreamLikePlastic

   Fungsi:
   - Menggambar kamera ke Canvas
   - Tidak pernah mirror / flip horizontal
   - Dream Like beauty effect
   - Plastic skin
   - Glow
   - Brightness
   - Soft Focus
   - Detail
   - Auto Light
   - Bisa ON/OFF tanpa mematikan kamera
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       CLASS
       ===================================================== */

    class DreamLikePlastic {

        constructor(video, canvas) {

            this.video = video;
            this.canvas = canvas;

            this.ctx = canvas.getContext("2d", {
                alpha: false,
                desynchronized: true
            });

            this.workCanvas = document.createElement("canvas");

            this.workCtx = this.workCanvas.getContext("2d", {
                alpha: false
            });

            this.blurCanvas = document.createElement("canvas");

            this.blurCtx = this.blurCanvas.getContext("2d", {
                alpha: false
            });


            /* =================================================
               DEFAULT SETTINGS
               ================================================= */

            this.settings = {

                plastic: 90,

                glow: 65,

                brightness: 35,

                softFocus: 55,

                detail: 25,

                strength: 90

            };


            /* =================================================
               STATE
               ================================================= */

            this.enabled = false;

            this.autoLight = true;

            this.running = false;

            this.animationFrame = null;

            this.lastWidth = 0;

            this.lastHeight = 0;


            /* =================================================
               PERFORMANCE
               ================================================= */

            this.maxWidth = 1280;

            this.maxHeight = 1920;


            /* =================================================
               BIND
               ================================================= */

            this.render = this.render.bind(this);

        }


        /* =====================================================
           START
           ===================================================== */

        start() {

            if (this.running) {
                return;
            }

            this.running = true;

            this.render();

        }


        /* =====================================================
           STOP
           ===================================================== */

        stop() {

            this.running = false;

            if (this.animationFrame) {

                cancelAnimationFrame(
                    this.animationFrame
                );

                this.animationFrame = null;

            }

        }


        /* =====================================================
           ENABLE
           ===================================================== */

        enable() {

            this.enabled = true;

        }


        /* =====================================================
           DISABLE
           ===================================================== */

        disable() {

            this.enabled = false;

        }


        /* =====================================================
           TOGGLE
           ===================================================== */

        toggle() {

            this.enabled = !this.enabled;

            return this.enabled;

        }


        /* =====================================================
           RESIZE
           ===================================================== */

        resize(width, height) {

            width = Math.max(
                320,
                Math.floor(width || 720)
            );

            height = Math.max(
                240,
                Math.floor(height || 1280)
            );


            /*
             * Batasi ukuran internal Canvas
             * supaya Android tidak terlalu berat.
             */

            let scale = Math.min(
                1,
                this.maxWidth / width,
                this.maxHeight / height
            );


            const targetWidth = Math.max(
                320,
                Math.floor(width * scale)
            );

            const targetHeight = Math.max(
                240,
                Math.floor(height * scale)
            );


            if (
                this.lastWidth === targetWidth &&
                this.lastHeight === targetHeight
            ) {

                return;

            }


            this.lastWidth = targetWidth;

            this.lastHeight = targetHeight;


            this.canvas.width = targetWidth;

            this.canvas.height = targetHeight;


            this.workCanvas.width = targetWidth;

            this.workCanvas.height = targetHeight;


            this.blurCanvas.width = targetWidth;

            this.blurCanvas.height = targetHeight;


            /*
             * Pastikan Canvas tidak pernah di-mirror.
             */

            this.ctx.setTransform(
                1,
                0,
                0,
                1,
                0,
                0
            );

            this.workCtx.setTransform(
                1,
                0,
                0,
                1,
                0,
                0
            );

            this.blurCtx.setTransform(
                1,
                0,
                0,
                1,
                0,
                0
            );

        }


        /* =====================================================
           SETTING
           ===================================================== */

        setSetting(name, value) {

            if (
                !Object.prototype.hasOwnProperty.call(
                    this.settings,
                    name
                )
            ) {

                return;

            }


            value = Number(value);


            if (!Number.isFinite(value)) {

                return;

            }


            value = Math.max(
                0,
                Math.min(100, value)
            );


            this.settings[name] = value;

        }


        /* =====================================================
           MULTIPLE SETTINGS
           ===================================================== */

        setSettings(settings) {

            if (!settings) {
                return;
            }


            Object.keys(settings).forEach(
                name => {

                    this.setSetting(
                        name,
                        settings[name]
                    );

                }
            );

        }


        /* =====================================================
           AUTO LIGHT
           ===================================================== */

        setAutoLight(enabled) {

            this.autoLight = Boolean(enabled);

        }


        /* =====================================================
           GET SETTINGS
           ===================================================== */

        getSettings() {

            return {
                ...this.settings
            };

        }


        /* =====================================================
           DRAW VIDEO COVER
           =====================================================

           Sangat penting:

           TIDAK ADA:

           ctx.scale(-1, 1)

           TIDAK ADA:

           translate + scale negatif.

           Jadi frame kamera digambar NORMAL.
           ===================================================== */

        drawVideoCover(ctx, source, width, height) {

            if (
                !source ||
                !source.videoWidth ||
                !source.videoHeight
            ) {

                return false;

            }


            const sourceWidth =
                source.videoWidth;

            const sourceHeight =
                source.videoHeight;


            const sourceRatio =
                sourceWidth / sourceHeight;

            const targetRatio =
                width / height;


            let sx = 0;

            let sy = 0;

            let sw = sourceWidth;

            let sh = sourceHeight;


            /* =================================================
               CROP HORIZONTAL
               ================================================= */

            if (sourceRatio > targetRatio) {

                sw =
                    sourceHeight * targetRatio;

                sx =
                    (sourceWidth - sw) / 2;

            }


            /* =================================================
               CROP VERTICAL
               ================================================= */

            else if (sourceRatio < targetRatio) {

                sh =
                    sourceWidth / targetRatio;

                sy =
                    (sourceHeight - sh) / 2;

            }


            /*
             * Reset transform.
             */

            ctx.setTransform(
                1,
                0,
                0,
                1,
                0,
                0
            );


            /*
             * Tidak ada horizontal flip.
             */

            ctx.drawImage(
                source,
                sx,
                sy,
                sw,
                sh,
                0,
                0,
                width,
                height
            );


            return true;

        }


        /* =====================================================
           DRAW ORIGINAL
           ===================================================== */

        drawOriginal() {

            if (
                !this.video ||
                this.video.readyState < 2
            ) {

                return false;

            }


            const width =
                this.canvas.width;

            const height =
                this.canvas.height;


            if (!width || !height) {

                return false;

            }


            return this.drawVideoCover(
                this.ctx,
                this.video,
                width,
                height
            );

        }


        /* =====================================================
           COPY FRAME
           ===================================================== */

        copyFrame() {

            const width =
                this.canvas.width;

            const height =
                this.canvas.height;


            this.drawVideoCover(
                this.workCtx,
                this.video,
                width,
                height
            );

        }


        /* =====================================================
           AUTO LIGHT CALCULATION
           ===================================================== */

        calculateBrightness() {

            const width =
                this.workCanvas.width;

            const height =
                this.workCanvas.height;


            if (!width || !height) {

                return 0.5;

            }


            /*
             * Sampling kecil agar ringan.
             */

            const sampleWidth = 32;

            const sampleHeight = 32;


            const sampleCanvas =
                document.createElement("canvas");


            sampleCanvas.width =
                sampleWidth;

            sampleCanvas.height =
                sampleHeight;


            const sampleCtx =
                sampleCanvas.getContext("2d");


            sampleCtx.drawImage(
                this.workCanvas,
                0,
                0,
                sampleWidth,
                sampleHeight
            );


            const data =
                sampleCtx.getImageData(
                    0,
                    0,
                    sampleWidth,
                    sampleHeight
                ).data;


            let total = 0;


            for (
                let i = 0;
                i < data.length;
                i += 4
            ) {

                const r = data[i];

                const g = data[i + 1];

                const b = data[i + 2];


                const brightness =
                    (
                        r * 0.299 +
                        g * 0.587 +
                        b * 0.114
                    ) / 255;


                total += brightness;

            }


            return total /
                (data.length / 4);

        }


        /* =====================================================
           APPLY FILTER
           ===================================================== */

        applyFilter() {

            const width =
                this.canvas.width;

            const height =
                this.canvas.height;


            if (!width || !height) {

                return;

            }


            /*
             * Ambil frame asli.
             */

            this.copyFrame();


            const plastic =
                this.settings.plastic / 100;

            const glow =
                this.settings.glow / 100;

            const brightness =
                this.settings.brightness / 100;

            const softFocus =
                this.settings.softFocus / 100;

            const detail =
                this.settings.detail / 100;

            const strength =
                this.settings.strength / 100;


            /* =================================================
               AUTO LIGHT
               ================================================= */

            let autoBrightness = 0;


            if (this.autoLight) {

                const current =
                    this.calculateBrightness();


                /*
                 * Jika terlalu gelap,
                 * tambahkan brightness.
                 */

                if (current < 0.45) {

                    autoBrightness =
                        Math.min(
                            0.25,
                            (0.45 - current) * 0.8
                        );

                }

            }


            /* =================================================
               BASE FILTER
               ================================================= */

            const brightnessBoost =
                (
                    brightness * 0.18 +
                    autoBrightness
                ) * strength;


            const contrast =
                1 +
                (
                    plastic * 0.08 *
                    strength
                );


            const saturation =
                1 +
                (
                    glow * 0.12 *
                    strength
                );


            const blurAmount =
                softFocus * 2.2;


            /*
             * Filter dasar.
             */

            this.ctx.save();


            this.ctx.setTransform(
                1,
                0,
                0,
                1,
                0,
                0
            );


            this.ctx.filter =
                "brightness(" +
                (1 + brightnessBoost) +
                ") " +
                "contrast(" +
                contrast +
                ") " +
                "saturate(" +
                saturation +
                ")";


            this.ctx.drawImage(
                this.workCanvas,
                0,
                0,
                width,
                height
            );


            this.ctx.restore();


            /* =================================================
               SOFT FOCUS
               ================================================= */

            if (softFocus > 0) {

                this.blurCtx.clearRect(
                    0,
                    0,
                    width,
                    height
                );


                this.blurCtx.filter =
                    "blur(" +
                    blurAmount +
                    "px)";


                this.blurCtx.drawImage(
                    this.workCanvas,
                    0,
                    0,
                    width,
                    height
                );


                this.ctx.save();


                this.ctx.globalAlpha =
                    softFocus *
                    0.24 *
                    strength;


                this.ctx.globalCompositeOperation =
                    "screen";


                this.ctx.drawImage(
                    this.blurCanvas,
                    0,
                    0,
                    width,
                    height
                );


                this.ctx.restore();

            }


            /* =================================================
               DREAM GLOW
               ================================================= */

            if (glow > 0) {

                this.ctx.save();


                this.ctx.globalAlpha =
                    glow *
                    0.16 *
                    strength;


                this.ctx.globalCompositeOperation =
                    "screen";


                this.ctx.filter =
                    "blur(" +
                    (2 + glow * 5) +
                    "px)";


                this.ctx.drawImage(
                    this.workCanvas,
                    0,
                    0,
                    width,
                    height
                );


                this.ctx.restore();

            }


            /* =================================================
               SKIN SOFTENING
               ================================================= */

            if (plastic > 0) {

                this.ctx.save();


                this.ctx.globalAlpha =
                    plastic *
                    0.10 *
                    strength;


                this.ctx.globalCompositeOperation =
                    "soft-light";


                this.ctx.filter =
                    "blur(" +
                    (1 + plastic * 2.5) +
                    "px)";


                this.ctx.drawImage(
                    this.workCanvas,
                    0,
                    0,
                    width,
                    height
                );


                this.ctx.restore();

            }


            /* =================================================
               DETAIL
               =================================================

               Detail sedikit dikembalikan supaya wajah
               tidak terlalu blur.
               ================================================= */

            if (detail > 0) {

                this.ctx.save();


                this.ctx.globalAlpha =
                    detail *
                    0.10 *
                    strength;


                this.ctx.globalCompositeOperation =
                    "overlay";


                this.ctx.filter =
                    "contrast(1.12)";


                this.ctx.drawImage(
                    this.workCanvas,
                    0,
                    0,
                    width,
                    height
                );


                this.ctx.restore();

            }


            /*
             * Reset filter untuk frame berikutnya.
             */

            this.ctx.filter = "none";

        }


        /* =====================================================
           RENDER
           ===================================================== */

        render() {

            if (!this.running) {

                return;

            }


            if (
                !this.video ||
                this.video.readyState < 2 ||
                !this.video.videoWidth ||
                !this.video.videoHeight
            ) {

                this.animationFrame =
                    requestAnimationFrame(
                        this.render
                    );

                return;

            }


            /*
             * Jika ukuran Canvas belum benar,
             * gunakan ukuran viewport.
             */

            if (
                !this.canvas.width ||
                !this.canvas.height
            ) {

                const width =
                    window.innerWidth ||
                    this.video.videoWidth ||
                    720;

                const height =
                    window.innerHeight ||
                    this.video.videoHeight ||
                    1280;


                this.resize(
                    width,
                    height
                );

            }


            /* =================================================
               FILTER OFF
               ================================================= */

            if (!this.enabled) {

                this.drawOriginal();

            }


            /* =================================================
               FILTER ON
               ================================================= */

            else {

                try {

                    this.applyFilter();

                } catch (error) {

                    console.warn(
                        "Dream Like filter error:",
                        error
                    );

                    /*
                     * PENTING:
                     * Kalau filter error, kamera TIDAK
                     * boleh mati.
                     *
                     * Kembali tampilkan kamera asli.
                     */

                    this.drawOriginal();

                }

            }


            this.animationFrame =
                requestAnimationFrame(
                    this.render
                );

        }


        /* =====================================================
           PUBLIC RENDER ORIGINAL
           ===================================================== */

        renderOriginal() {

            return this.drawOriginal();

        }

    }


    /* =========================================================
       GLOBAL EXPORT
       ========================================================= */

    window.DreamLikePlastic =
        DreamLikePlastic;


    console.log(
        "✅ DreamLikePlastic filter engine loaded"
    );

})();
