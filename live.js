/* =========================================================
   CHUK AN CHUKK — LIVE V2
   CAMERA • FLIP • NO ZOOM • NO CROP • NO MIRROR
   REAL FACE BEAUTY FILTER • MIC • COMMENT • LIKE • LIVE
   ========================================================= */

"use strict";

/* =========================
   STATE
========================= */

let stream = null;
let facing = "user";
let cameraOn = true;
let micOn = true;
let liveOn = false;

let likes = 0;
let seconds = 0;
let timer = null;
let frame = null;

let autoLight = true;

/* Face detection */
let faceResult = null;
let detectCounter = 0;
let lastFaceTime = 0;

/* Filter values */
const filter = {
    plastic: 90,
    glow: 65,
    brightness: 35,
    softFocus: 55,
    detail: 25
};

/* =========================
   ELEMENTS
========================= */

const $ = id => document.getElementById(id);

const video = $("camera");
const canvas = $("filterCanvas");
const ctx = canvas?.getContext("2d", {
    alpha: false
});

const status = $("cameraStatus");
const startBtn = $("startLiveButton");
const startText = $("startLiveText");
const viewer = $("viewerCount");

const cameraBtn = $("cameraButton");
const cameraIcon = $("cameraIcon");
const cameraText = $("cameraText");

const micBtn = $("micButton");
const micIcon = $("micIcon");
const micText = $("micText");

const flipBtn = $("flipButton");
const bottomFlip = $("bottomFlipButton");
const bottomMic = $("bottomMicButton");

const filterBtn = $("filterButton");
const bottomFilter = $("bottomFilterButton");
const filterPanel = $("filterPanel");
const closeFilter = $("closeFilterButton");
const dreamBtn = $("dreamLikeButton");

const commentBtn = $("commentButton");
const commentArea = $("commentInputArea");
const commentInput = $("commentInput");
const sendComment = $("sendCommentButton");
const comments = $("commentsList");

const likeBtn = $("likeButton");
const likeCount = $("likeCount");

const timerBox = $("liveTimer");
const followBtn = $("followButton");
const closeBtn = $("closeLiveButton");

const autoLightBtn = $("autoLightButton");
const lightStatus = $("lightStatus");

/* =========================
   BASIC
========================= */

function setStatus(text) {
    if (status) status.textContent = text;
}

function prepareVideo() {

    if (!video) return;

    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    /* Video hanya sumber kamera */
    video.style.transform = "none";
    video.style.webkitTransform = "none";
    video.style.filter = "none";
}

/* =========================
   CANVAS
========================= */

function resizeCanvas() {

    if (!canvas) return;

    const dpr =
        Math.min(window.devicePixelRatio || 1, 2);

    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width =
        Math.round(w * dpr);

    canvas.height =
        Math.round(h * dpr);

    canvas.style.width =
        w + "px";

    canvas.style.height =
        h + "px";
}

/* =========================
   FACE LANDMARK
========================= */

function detectFace() {

    const landmarker =
        window.ChukFaceLandmarker;

    if (!landmarker || !video) return;

    if (
        video.readyState < 2 ||
        !video.videoWidth ||
        !video.videoHeight
    ) {
        return;
    }

    /*
     * Jangan deteksi setiap frame.
     * 1 dari 3 frame cukup untuk menjaga
     * performa HP tetap ringan.
     */
    detectCounter++;

    if (detectCounter % 3 !== 0) {
        return;
    }

    const now =
        performance.now();

    if (now <= lastFaceTime) {
        return;
    }

    lastFaceTime = now;

    try {

        faceResult =
            landmarker.detectForVideo(
                video,
                now
            );

        if (
            window.ChukBeauty &&
            faceResult?.faceLandmarks?.length
        ) {

            window.ChukBeauty.set(
                "faceDetected",
                true
            );

        } else if (window.ChukBeauty) {

            window.ChukBeauty.set(
                "faceDetected",
                false
            );
        }

    } catch (error) {

        /*
         * Jangan hentikan kamera jika
         * Face Landmarker gagal.
         */
        console.warn(
            "Face detection:",
            error
        );
    }
}

/* =========================
   MAP FACE TO CANVAS
========================= */

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

    return source.map(point => {

        /*
         * Kamera depan sudah dibalik pada canvas.
         * Landmark juga harus ikut dibalik.
         */
        const px =
            facing === "user"
                ? 1 - point.x
                : point.x;

        return {
            x: (x + px * w) / canvas.width,
            y: (y + point.y * h) / canvas.height,
            z: point.z || 0
        };

    });
}

/* =========================
   BEAUTY FILTER V2
========================= */

function updateBeautyEngine() {

    if (!window.ChukBeauty) {
        return;
    }

    /*
     * Plastic → Smooth Skin
     */
    window.ChukBeauty.set(
        "smooth",
        filter.plastic
    );

    /*
     * Glow → Face Glow
     */
    window.ChukBeauty.set(
        "glow",
        filter.glow
    );

    /*
     * Soft Focus juga membantu
     * smoothing kulit.
     */
    const combinedSmooth =
        Math.min(
            100,
            filter.plastic * 0.65 +
            filter.softFocus * 0.35
        );

    window.ChukBeauty.set(
        "smooth",
        combinedSmooth
    );

    /*
     * Brightness.
     */
    window.ChukBeauty.set(
        "brightness",
        filter.brightness
    );

    /*
     * Detail.
     */
    window.ChukBeauty.set(
        "detail",
        filter.detail
    );

    /*
     * Sedikit warmth agar kulit
     * tidak terlihat terlalu pucat.
     */
    window.ChukBeauty.set(
        "warmth",
        4
    );
}

/* =========================
   CAMERA RENDERER
========================= */

function render() {

    if (!canvas || !ctx || !video) {

        frame =
            requestAnimationFrame(render);

        return;
    }

    if (
        video.readyState < 2 ||
        !video.videoWidth ||
        !video.videoHeight
    ) {

        frame =
            requestAnimationFrame(render);

        return;
    }

    const cw = canvas.width;
    const ch = canvas.height;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

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

    ctx.filter = "none";

    ctx.fillStyle = "#000";

    ctx.fillRect(
        0,
        0,
        cw,
        ch
    );

    /*
     * NO ZOOM
     * NO CROP
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

    /* =========================
       GLOBAL LIGHT CORRECTION
    ========================= */

    const brightness =
        100 +
        filter.brightness *
        (autoLight ? 0.30 : 0.15);

    const saturation =
        100 +
        filter.glow * 0.08;

    const contrast =
        100 -
        filter.plastic * 0.015;

    /*
     * Global blur dibuat sangat kecil.
     * Smoothing utama dilakukan khusus wajah.
     */
    const blur =
        Math.min(
            0.7,
            filter.softFocus * 0.004
        );

    ctx.filter =
        `brightness(${brightness}%) ` +
        `saturate(${saturation}%) ` +
        `contrast(${contrast}%) ` +
        `blur(${blur}px)`;

    /* =========================
       CAMERA DRAW
    ========================= */

    if (facing === "user") {

        /*
         * FRONT CAMERA
         * Tetap menggunakan metode V5
         * yang sudah berhasil.
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
         * BACK CAMERA NORMAL
         */

        ctx.drawImage(
            video,
            x,
            y,
            w,
            h
        );
    }

    ctx.filter = "none";

    /* =========================
       FACE DETECTION
    ========================= */

    detectFace();

    /* =========================
       BEAUTY V2
    ========================= */

    if (
        window.ChukBeauty &&
        faceResult?.faceLandmarks?.length
    ) {

        updateBeautyEngine();

        const landmarks =
            getCanvasFaceLandmarks(
                x,
                y,
                w,
                h
            );

        if (landmarks) {

            /*
             * Beauty engine menerima
             * landmark yang sudah disesuaikan
             * dengan posisi canvas.
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

    /* =========================
       SOFT FACE GLOW
    ========================= */

    /*
     * Glow tambahan tetap kecil agar
     * wajah tidak terlihat seperti putih
     * berlebihan.
     */

    if (
        filter.glow > 0 &&
        faceResult?.faceLandmarks?.length &&
        window.ChukBeauty
    ) {

        const landmarks =
            getCanvasFaceLandmarks(
                x,
                y,
                w,
                h
            );

        if (landmarks) {

            window.ChukBeauty.applyFaceGlow(
                ctx,
                landmarks,
                cw,
                ch
            );
        }
    }

    /*
     * Fallback glow sangat tipis.
     */
    if (
        filter.glow > 0 &&
        !faceResult?.faceLandmarks?.length
    ) {

        ctx.fillStyle =
            `rgba(255,255,255,${filter.glow / 100 * 0.025})`;

        ctx.fillRect(
            x,
            y,
            w,
            h
        );
    }

    frame =
        requestAnimationFrame(render);
}

function startRenderer() {

    if (frame) {
        cancelAnimationFrame(frame);
    }

    resizeCanvas();

    frame =
        requestAnimationFrame(render);
}

function stopRenderer() {

    if (frame) {

        cancelAnimationFrame(frame);

        frame = null;
    }
}

/* =========================
   CAMERA
========================= */

function stopTracks() {

    if (!stream) return;

    stream.getTracks().forEach(track => {

        try {
            track.stop();
        } catch (_) {}

    });

    stream = null;
}

async function startCamera() {

    try {

        setStatus(
            "📷 Menyiapkan kamera..."
        );

        if (
            !navigator.mediaDevices?.getUserMedia
        ) {

            throw new Error(
                "Camera API tidak tersedia"
            );
        }

        stopTracks();

        let newStream;

        try {

            newStream =
                await navigator.mediaDevices.getUserMedia({

                    video: {

                        facingMode: {
                            exact: facing
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

        } catch (_) {

            newStream =
                await navigator.mediaDevices.getUserMedia({

                    video: {

                        facingMode: facing,

                        width: {
                            ideal: 1280
                        },

                        height: {
                            ideal: 720
                        }
                    },

                    audio: true
                });
        }

        stream = newStream;

        video.srcObject =
            stream;

        prepareVideo();

        await new Promise(resolve => {

            if (
                video.readyState >= 1
            ) {

                resolve();

            } else {

                video.addEventListener(
                    "loadedmetadata",
                    resolve,
                    {
                        once: true
                    }
                );
            }
        });

        await video.play()
            .catch(() => {});

        updateTracks();

        resizeCanvas();

        startRenderer();

        setStatus(
            "✅ Kamera siap"
        );

        console.log(
            "CHUK CAMERA V2:",
            facing,
            video.videoWidth,
            video.videoHeight
        );

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        setStatus(
            "❌ Kamera tidak tersedia"
        );

        alert(
            error.name ===
            "NotAllowedError"

                ? "Izin kamera/mikrofon ditolak. Silakan izinkan akses kamera."

                : "Kamera tidak dapat digunakan. Pastikan HTTPS dan izin kamera aktif."
        );
    }
}

function updateTracks() {

    if (!stream) return;

    const v =
        stream.getVideoTracks()[0];

    const a =
        stream.getAudioTracks()[0];

    if (v)
        v.enabled = cameraOn;

    if (a)
        a.enabled = micOn;

    if (cameraIcon)
        cameraIcon.textContent =
            cameraOn
                ? "📹"
                : "🚫";

    if (cameraText)
        cameraText.textContent =
            cameraOn
                ? "Camera"
                : "Camera Off";

    if (micIcon)
        micIcon.textContent =
            micOn
                ? "🎤"
                : "🔇";

    if (micText)
        micText.textContent =
            micOn
                ? "Mic"
                : "Mic Off";
}

function toggleCamera() {

    cameraOn =
        !cameraOn;

    updateTracks();
}

function toggleMic() {

    micOn =
        !micOn;

    updateTracks();
}

async function flipCamera() {

    facing =
        facing === "user"
            ? "environment"
            : "user";

    /*
     * Reset face result setelah flip.
     */
    faceResult = null;

    await startCamera();
}

/* =========================
   FILTER SLIDERS
========================= */

const sliders = {

    plastic:
        $("plasticSlider"),

    glow:
        $("glowSlider"),

    brightness:
        $("brightnessSlider"),

    softFocus:
        $("softFocusSlider"),

    detail:
        $("detailSlider")
};

const values = {

    plastic:
        $("plasticValue"),

    glow:
        $("glowValue"),

    brightness:
        $("brightnessValue"),

    softFocus:
        $("softFocusValue"),

    detail:
        $("detailValue")
};

function updateFilters() {

    Object.keys(sliders)
        .forEach(key => {

            if (!sliders[key])
                return;

            filter[key] =
                Number(
                    sliders[key].value
                );

            if (values[key]) {

                values[key].textContent =
                    filter[key];
            }
        });

    updateBeautyEngine();
}

Object.values(sliders)
    .forEach(slider => {

        slider?.addEventListener(
            "input",
            updateFilters
        );
    });

/* =========================
   DREAM LIKE V2
========================= */

dreamBtn?.addEventListener(
    "click",
    () => {

        if (sliders.plastic)
            sliders.plastic.value = 82;

        if (sliders.glow)
            sliders.glow.value = 58;

        if (sliders.brightness)
            sliders.brightness.value = 32;

        if (sliders.softFocus)
            sliders.softFocus.value = 68;

        if (sliders.detail)
            sliders.detail.value = 28;

        updateFilters();

        if (window.ChukBeauty) {

            window.ChukBeauty.beauty();
        }
    }
);

/* =========================
   FILTER PANEL
========================= */

function openFilter() {

    filterPanel?.classList.add(
        "show"
    );
}

function hideFilter() {

    filterPanel?.classList.remove(
        "show"
    );
}

filterBtn?.addEventListener(
    "click",
    openFilter
);

bottomFilter?.addEventListener(
    "click",
    openFilter
);

closeFilter?.addEventListener(
    "click",
    hideFilter
);

/* =========================
   AUTO LIGHT
========================= */

autoLightBtn?.addEventListener(
    "click",
    () => {

        autoLight =
            !autoLight;

        autoLightBtn.textContent =
            autoLight
                ? "ON"
                : "OFF";

        autoLightBtn.classList.toggle(
            "active",
            autoLight
        );

        autoLightBtn.setAttribute(
            "aria-pressed",
            String(autoLight)
        );

        if (lightStatus) {

            lightStatus.textContent =
                autoLight
                    ? "💡 Auto Light"
                    : "💡 Auto Light OFF";
        }
    }
);

/* =========================
   COMMENTS
========================= */

function addComment() {

    if (
        !commentInput ||
        !comments
    ) return;

    const text =
        commentInput.value.trim();

    if (!text) return;

    const item =
        document.createElement(
            "div"
        );

    item.className =
        "live-comment";

    const name =
        document.createElement(
            "strong"
        );

    name.textContent =
        "You ";

    item.appendChild(name);

    item.appendChild(
        document.createTextNode(text)
    );

    comments.appendChild(item);

    commentInput.value = "";

    comments.scrollTop =
        comments.scrollHeight;
}

sendComment?.addEventListener(
    "click",
    addComment
);

commentInput?.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {

            e.preventDefault();

            addComment();
        }
    }
);

commentBtn?.addEventListener(
    "click",
    () => {

        commentArea?.classList.toggle(
            "show"
        );

        if (
            commentArea?.classList.contains(
                "show"
            )
        ) {

            setTimeout(
                () =>
                    commentInput?.focus(),
                100
            );
        }
    }
);

/* =========================
   LIKE
========================= */

likeBtn?.addEventListener(
    "click",
    () => {

        likes++;

        if (likeCount)
            likeCount.textContent =
                likes;
    }
);

/* =========================
   FOLLOW
========================= */

followBtn?.addEventListener(
    "click",
    () => {

        const active =
            followBtn.classList.toggle(
                "following"
            );

        followBtn.textContent =
            active
                ? "Following"
                : "Follow";
    }
);

/* =========================
   LIVE
========================= */

function startLive() {

    liveOn = true;

    seconds = 0;

    startBtn?.classList.add(
        "live-active"
    );

    if (startText)
        startText.textContent =
            "Stop Live";

    setStatus(
        "🔴 CHUK AN CHUKK LIVE"
    );

    if (viewer) {

        viewer.textContent =
            String(
                Math.floor(
                    Math.random() * 8
                ) + 1
            );
    }

    clearInterval(timer);

    timer =
        setInterval(
            () => {

                seconds++;

                const min =
                    String(
                        Math.floor(
                            seconds / 60
                        )
                    ).padStart(
                        2,
                        "0"
                    );

                const sec =
                    String(
                        seconds % 60
                    ).padStart(
                        2,
                        "0"
                    );

                if (timerBox) {

                    timerBox.textContent =
                        `${min}:${sec}`;
                }

            },
            1000
        );
}

function stopLive() {

    liveOn = false;

    clearInterval(timer);

    timer = null;

    startBtn?.classList.remove(
        "live-active"
    );

    if (startText)
        startText.textContent =
            "Mulai Live";

    if (timerBox)
        timerBox.textContent =
            "00:00";

    if (viewer)
        viewer.textContent =
            "0";

    setStatus(
        "📷 Kamera siap"
    );
}

startBtn?.addEventListener(
    "click",
    () => {

        liveOn
            ? stopLive()
            : startLive();
    }
);

/* =========================
   BUTTONS
========================= */

cameraBtn?.addEventListener(
    "click",
    toggleCamera
);

micBtn?.addEventListener(
    "click",
    toggleMic
);

bottomMic?.addEventListener(
    "click",
    toggleMic
);

flipBtn?.addEventListener(
    "click",
    flipCamera
);

bottomFlip?.addEventListener(
    "click",
    flipCamera
);

/* =========================
   CLOSE
========================= */

closeBtn?.addEventListener(
    "click",
    () => {

        stopLive();

        stopRenderer();

        stopTracks();

        window.location.href =
            "index.html";
    }
);

/* =========================
   RESIZE
========================= */

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

/* =========================
   CLEANUP
========================= */

window.addEventListener(
    "beforeunload",
    () => {

        clearInterval(timer);

        stopRenderer();

        stopTracks();
    }
);

/* =========================
   START
========================= */

async function init() {

    prepareVideo();

    resizeCanvas();

    updateFilters();

    startRenderer();

    await startCamera();
}

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init,
        {
            once: true
        }
    );

} else {

    init();
}

console.log(
    "✅ CHUK AN CHUKK LIVE V2 — FACE FILTER READY"
);
