/* =========================================================
   CHUK AN CHUKK
   DREAM-LIKE FILTER
   NON-MIRROR CAMERA + FULL SCREEN COVER
   ========================================================= */

(function () {

    class DreamLikePlastic {

        constructor(video, canvas) {

            this.video = video;
            this.canvas = canvas;
            this.ctx = canvas.getContext("2d", {
                alpha: false
            });

            this.enabled = true;
            this.running = false;
            this.autoLight = true;

            this.settings = {
                plastic: 90,
                glow: 65,
                brightness: 35,
                softFocus: 55,
                detail: 25,
                strength: 90
            };

            this.workCanvas = document.createElement("canvas");
            this.workCtx = this.workCanvas.getContext("2d", {
                alpha: false
            });

            this.blurCanvas = document.createElement("canvas");
            this.blurCtx = this.blurCanvas.getContext("2d", {
                alpha: false
            });

            this.lastFrame = 0;
            this.frameInterval = 1000 / 24;

            this.lightValue = 1;

            /*
             * PENTING:
             * false = kamera tidak mirror.
             *
             * Gerakan kanan -> kanan
             * Gerakan kiri -> kiri
             */
            this.mirror = false;
        }

        /* =====================================================
           START
           ===================================================== */

        start() {

            if (this.running) {
                return;
            }

            this.running = true;

            this.resize();

            requestAnimationFrame((time) => {
                this.render(time);
            });
        }

        /* =====================================================
           STOP
           ===================================================== */

        stop() {

            this.running = false;
        }

        /* =====================================================
           RESIZE
           ===================================================== */

        resize() {

            const videoWidth =
                this.video.videoWidth ||
                window.innerWidth ||
                720;

            const videoHeight =
                this.video.videoHeight ||
                window.innerHeight ||
                1280;

            /*
             * Canvas mengikuti ukuran video asli.
             * CSS akan membuatnya FULL SCREEN.
             */

            this.canvas.width = videoWidth;
            this.canvas.height = videoHeight;

            this.workCanvas.width = videoWidth;
            this.workCanvas.height = videoHeight;

            this.blurCanvas.width = videoWidth;
            this.blurCanvas.height = videoHeight;
        }

        /* =====================================================
           SETTINGS
           ===================================================== */

        setSetting(name, value) {

            if (this.settings.hasOwnProperty(name)) {

                this.settings[name] = Number(value);

            }
        }

        setSettings(settings) {

            if (!settings) {
                return;
            }

            Object.keys(settings).forEach((key) => {

                if (this.settings.hasOwnProperty(key)) {

                    this.settings[key] = Number(settings[key]);

                }

            });
        }

        setAutoLight(enabled) {

            this.autoLight = Boolean(enabled);

        }

        /* =====================================================
           MAIN RENDER
           ===================================================== */

        render(timestamp) {

            if (!this.running) {
                return;
            }

            requestAnimationFrame((time) => {
                this.render(time);
            });

            if (!this.video) {
                return;
            }

            if (this.video.readyState < 2) {
                return;
            }

            if (
                timestamp - this.lastFrame <
                this.frameInterval
            ) {
                return;
            }

            this.lastFrame = timestamp;

            if (!this.enabled) {

                this.drawOriginal();

                return;
            }

            this.applyFilter();
        }

        /* =====================================================
           ORIGINAL CAMERA
           ===================================================== */

        drawOriginal() {

            const width =
                this.canvas.width ||
                this.video.videoWidth ||
                window.innerWidth;

            const height =
                this.canvas.height ||
                this.video.videoHeight ||
                window.innerHeight;

            this.ctx.clearRect(
                0,
                0,
                width,
                height
            );

            /*
             * NON-MIRROR
             *
             * Tidak ada:
             * scale(-1, 1)
             * translate(width, 0)
             */

            this.drawVideoContain(
                this.ctx,
                this.video,
                width,
                height
            );
        }

        /* =====================================================
           APPLY BEAUTY FILTER
           ===================================================== */

        applyFilter() {

            const width = this.canvas.width;
            const height = this.canvas.height;

            if (!width || !height) {
                return;
            }

            /* -----------------------------------------------
               AUTO LIGHT
               ----------------------------------------------- */

            if (this.autoLight) {

                this.lightValue =
                    this.calculateLight();

            } else {

                this.lightValue = 1;

            }

            /* -----------------------------------------------
               DRAW VIDEO TO WORK CANVAS
               ----------------------------------------------- */

            this.workCtx.clearRect(
                0,
                0,
                width,
                height
            );

            /*
             * NON-MIRROR + COVER
             */

            this.drawVideoContain(
                this.workCtx,
                this.video,
                width,
                height
            );

            /* -----------------------------------------------
               BASE IMAGE
               ----------------------------------------------- */

            this.ctx.clearRect(
                0,
                0,
                width,
                height
            );

            const brightness =
                1 +
                (
                    this.settings.brightness / 100
                ) * 0.35;

            const contrast =
                1 +
                (
                    this.settings.detail / 100
                ) * 0.10;

            const saturation =
                1 +
                (
                    this.settings.glow / 100
                ) * 0.18;

            this.ctx.save();

            this.ctx.filter =
                `brightness(${brightness * this.lightValue}) ` +
                `contrast(${contrast}) ` +
                `saturate(${saturation})`;

            this.ctx.globalAlpha = 1;

            this.ctx.drawImage(
                this.workCanvas,
                0,
                0,
                width,
                height
            );

            this.ctx.restore();

            /* -----------------------------------------------
               SOFT SKIN
               ----------------------------------------------- */

            const plastic =
                this.settings.plastic / 100;

            if (plastic > 0) {

                this.blurCtx.clearRect(
                    0,
                    0,
                    width,
                    height
                );

                this.blurCtx.save();

                const blurAmount =
                    2 +
                    plastic * 6;

                this.blurCtx.filter =
                    `blur(${blurAmount}px)`;

                this.blurCtx.globalAlpha =
                    0.08 +
                    plastic * 0.30;

                this.blurCtx.drawImage(
                    this.workCanvas,
                    0,
                    0,
                    width,
                    height
                );

                this.blurCtx.restore();

                this.ctx.save();

                this.ctx.globalAlpha =
                    0.18 +
                    plastic * 0.30;

                this.ctx.drawImage(
                    this.blurCanvas,
                    0,
                    0,
                    width,
                    height
                );

                this.ctx.restore();
            }

            /* -----------------------------------------------
               DREAM GLOW
               ----------------------------------------------- */

            const glow =
                this.settings.glow / 100;

            if (glow > 0) {

                this.ctx.save();

                this.ctx.globalAlpha =
                    0.04 +
                    glow * 0.12;

                this.ctx.filter =
                    `blur(${3 + glow * 5}px)`;

                this.ctx.drawImage(
                    this.workCanvas,
                    0,
                    0,
                    width,
                    height
                );

                this.ctx.restore();
            }

            /* -----------------------------------------------
               BRIGHTNESS OVERLAY
               ----------------------------------------------- */

            const brightnessLevel =
                this.settings.brightness / 100;

            if (brightnessLevel > 0) {

                this.ctx.save();

                this.ctx.globalAlpha =
                    brightnessLevel * 0.07;

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

            /* -----------------------------------------------
               DETAIL
               ----------------------------------------------- */

            const detail =
                this.settings.detail / 100;

            if (detail > 0.05) {

                this.ctx.save();

                this.ctx.globalAlpha =
                    detail * 0.08;

                this.ctx.globalCompositeOperation =
                    "overlay";

                this.ctx.drawImage(
                    this.workCanvas,
                    0,
                    0,
                    width,
                    height
                );

                this.ctx.restore();
            }
        }

        /* =====================================================
           FULL SCREEN COVER
           ===================================================== */

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
                sourceWidth / sourceHeight;

            const targetRatio =
                targetWidth / targetHeight;

            let drawWidth;
            let drawHeight;
            let x;
            let y;

            /*
             * COVER MODE
             *
             * Kamera memenuhi layar.
             * Tidak ada ruang kosong hitam.
             */

            if (sourceRatio > targetRatio) {

                /*
                 * Video lebih lebar.
                 * Potong sedikit bagian kiri/kanan.
                 */

                drawHeight = targetHeight;

                drawWidth =
                    targetHeight * sourceRatio;

                x =
                    (targetWidth - drawWidth) / 2;

                y = 0;

            } else {

                /*
                 * Video lebih tinggi.
                 * Potong sedikit bagian atas/bawah.
                 */

                drawWidth = targetWidth;

                drawHeight =
                    targetWidth / sourceRatio;

                x = 0;

                y =
                    (targetHeight - drawHeight) / 2;
            }

            context.drawImage(
                source,
                x,
                y,
                drawWidth,
                drawHeight
            );
        }

        /* =====================================================
           AUTO LIGHT
           ===================================================== */

        calculateLight() {

            try {

                const sampleCanvas =
                    document.createElement("canvas");

                sampleCanvas.width = 64;
                sampleCanvas.height = 64;

                const sampleCtx =
                    sampleCanvas.getContext("2d", {
                        willReadFrequently: true
                    });

                sampleCtx.drawImage(
                    this.video,
                    0,
                    0,
                    64,
                    64
                );

                const imageData =
                    sampleCtx.getImageData(
                        0,
                        0,
                        64,
                        64
                    );

                const data =
                    imageData.data;

                let total = 0;

                let count = 0;

                for (
                    let i = 0;
                    i < data.length;
                    i += 16
                ) {

                    const r = data[i];

                    const g = data[i + 1];

                    const b = data[i + 2];

                    const luminance =
                        (
                            0.299 * r +
                            0.587 * g +
                            0.114 * b
                        ) / 255;

                    total += luminance;

                    count++;
                }

                if (!count) {
                    return 1;
                }

                const average =
                    total / count;

                /*
                 * Jangan terlalu terang.
                 */

                let target =
                    1.08 -
                    (
                        average * 0.22
                    );

                target =
                    Math.max(
                        0.97,
                        Math.min(
                            1.14,
                            target
                        )
                    );

                /*
                 * Smooth supaya cahaya tidak
                 * berkedip-kedip.
                 */

                return (
                    this.lightValue * 0.85
                ) + (
                    target * 0.15
                );

            } catch (error) {

                return 1;
            }
        }
    }

    /* =========================================================
       GLOBAL
       ========================================================= */

    window.DreamLikePlastic =
        DreamLikePlastic;

})();

Penting bro: CSS yang tadi juga harus tetap memakai:

object-fit: cover;
object-position: center center;

Jadi sekarang ada dua hal yang bekerja bersama:

1. "mirror = false" → gerakan kanan tetap kanan.
2. "cover" → kamera memenuhi layar dari atas sampai bawah.

Kalau setelah dipasang wajah masih terasa terlalu zoom, itu bukan mirror lagi—itu karena mode "cover" memotong bagian gambar agar layar penuh. Kita bisa lanjut bikin mode full-screen yang minim crop khusus layar HP, supaya tampilannya lebih natural seperti TikTok.
