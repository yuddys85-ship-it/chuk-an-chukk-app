/* =========================================================
   CHUK AN CHUKK — LIVE V5 FINAL
   CAMERA • FLIP • NO ZOOM • NO CROP • NO MIRROR
   BEAUTY FILTER • MIC • COMMENT • LIKE • LIVE TIMER
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
const ctx = canvas?.getContext("2d", { alpha: false });

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

function resizeCanvas() {
    if (!canvas) return;

    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = innerWidth;
    const h = innerHeight;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
}

/* =========================
   CAMERA RENDERER
========================= */

function render() {
    if (!canvas || !ctx || !video) {
        frame = requestAnimationFrame(render);
        return;
    }

    if (
        video.readyState < 2 ||
        !video.videoWidth ||
        !video.videoHeight
    ) {
        frame = requestAnimationFrame(render);
        return;
    }

    const cw = canvas.width;
    const ch = canvas.height;
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = "none";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cw, ch);

    /* NO ZOOM / NO CROP */
    const scale = Math.min(cw / vw, ch / vh);
    const w = vw * scale;
    const h = vh * scale;
    const x = (cw - w) / 2;
    const y = (ch - h) / 2;

    /* BEAUTY FILTER */
    const brightness =
        100 + filter.brightness * (autoLight ? 0.30 : 0.15);

    const saturation =
        100 + filter.glow * 0.10;

    const contrast =
        100 - filter.plastic * 0.03;

    const blur =
        filter.softFocus * 0.008;

    ctx.filter =
        `brightness(${brightness}%) ` +
        `saturate(${saturation}%) ` +
        `contrast(${contrast}%) ` +
        `blur(${blur}px)`;

    /* =====================================================
       FRONT CAMERA = FLIP ONCE
       BACK CAMERA = NORMAL
       ===================================================== */

    if (facing === "user") {
        ctx.save();

        ctx.translate(cw, 0);
        ctx.scale(-1, 1);

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

    /* SOFT GLOW */
    if (filter.glow > 0) {
        ctx.fillStyle =
            `rgba(255,255,255,${filter.glow / 100 * 0.06})`;

        ctx.fillRect(x, y, w, h);
    }

    frame = requestAnimationFrame(render);
}

function startRenderer() {
    if (frame) cancelAnimationFrame(frame);
    resizeCanvas();
    frame = requestAnimationFrame(render);
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
        setStatus("📷 Menyiapkan kamera...");

        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Camera API tidak tersedia");
        }

        stopTracks();

        let newStream;

        try {
            newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { exact: facing },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30, max: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
        } catch (_) {
            newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facing,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: true
            });
        }

        stream = newStream;
        video.srcObject = stream;

        prepareVideo();

        await new Promise(resolve => {
            if (video.readyState >= 1) {
                resolve();
            } else {
                video.addEventListener(
                    "loadedmetadata",
                    resolve,
                    { once: true }
                );
            }
        });

        await video.play().catch(() => {});

        updateTracks();
        resizeCanvas();
        startRenderer();

        setStatus("✅ Kamera siap");

        console.log(
            "CHUK CAMERA:",
            facing,
            video.videoWidth,
            video.videoHeight
        );

    } catch (error) {
        console.error("Camera error:", error);

        setStatus("❌ Kamera tidak tersedia");

        alert(
            error.name === "NotAllowedError"
                ? "Izin kamera/mikrofon ditolak. Silakan izinkan akses kamera."
                : "Kamera tidak dapat digunakan. Pastikan HTTPS dan izin kamera aktif."
        );
    }
}

function updateTracks() {
    if (!stream) return;

    const v = stream.getVideoTracks()[0];
    const a = stream.getAudioTracks()[0];

    if (v) v.enabled = cameraOn;
    if (a) a.enabled = micOn;

    if (cameraIcon)
        cameraIcon.textContent = cameraOn ? "📹" : "🚫";

    if (cameraText)
        cameraText.textContent = cameraOn ? "Camera" : "Camera Off";

    if (micIcon)
        micIcon.textContent = micOn ? "🎤" : "🔇";

    if (micText)
        micText.textContent = micOn ? "Mic" : "Mic Off";
}

function toggleCamera() {
    cameraOn = !cameraOn;
    updateTracks();
}

function toggleMic() {
    micOn = !micOn;
    updateTracks();
}

async function flipCamera() {
    facing = facing === "user"
        ? "environment"
        : "user";

    await startCamera();
}

/* =========================
   FILTER
========================= */

const sliders = {
    plastic: $("plasticSlider"),
    glow: $("glowSlider"),
    brightness: $("brightnessSlider"),
    softFocus: $("softFocusSlider"),
    detail: $("detailSlider")
};

const values = {
    plastic: $("plasticValue"),
    glow: $("glowValue"),
    brightness: $("brightnessValue"),
    softFocus: $("softFocusValue"),
    detail: $("detailValue")
};

function updateFilters() {
    Object.keys(sliders).forEach(key => {
        if (!sliders[key]) return;

        filter[key] = Number(sliders[key].value);

        if (values[key])
            values[key].textContent = filter[key];
    });
}

Object.values(sliders).forEach(slider => {
    slider?.addEventListener("input", updateFilters);
});

dreamBtn?.addEventListener("click", () => {
    sliders.plastic.value = 90;
    sliders.glow.value = 65;
    sliders.brightness.value = 35;
    sliders.softFocus.value = 55;
    sliders.detail.value = 25;

    updateFilters();
});

/* =========================
   FILTER PANEL
========================= */

function openFilter() {
    filterPanel?.classList.add("show");
}

function hideFilter() {
    filterPanel?.classList.remove("show");
}

filterBtn?.addEventListener("click", openFilter);
bottomFilter?.addEventListener("click", openFilter);
closeFilter?.addEventListener("click", hideFilter);

/* =========================
   AUTO LIGHT
========================= */

autoLightBtn?.addEventListener("click", () => {
    autoLight = !autoLight;

    autoLightBtn.textContent =
        autoLight ? "ON" : "OFF";

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
});

/* =========================
   COMMENTS
========================= */

function addComment() {
    if (!commentInput || !comments) return;

    const text = commentInput.value.trim();
    if (!text) return;

    const item = document.createElement("div");
    item.className = "live-comment";

    const name = document.createElement("strong");
    name.textContent = "You ";

    item.appendChild(name);
    item.appendChild(
        document.createTextNode(text)
    );

    comments.appendChild(item);

    commentInput.value = "";
    comments.scrollTop = comments.scrollHeight;
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

commentBtn?.addEventListener("click", () => {
    commentArea?.classList.toggle("show");

    if (
        commentArea?.classList.contains("show")
    ) {
        setTimeout(
            () => commentInput?.focus(),
            100
        );
    }
});

/* =========================
   LIKE
========================= */

likeBtn?.addEventListener("click", () => {
    likes++;
    if (likeCount)
        likeCount.textContent = likes;
});

/* =========================
   FOLLOW
========================= */

followBtn?.addEventListener("click", () => {
    const active =
        followBtn.classList.toggle("following");

    followBtn.textContent =
        active ? "Following" : "Follow";
});

/* =========================
   LIVE
========================= */

function startLive() {
    liveOn = true;
    seconds = 0;

    startBtn?.classList.add("live-active");

    if (startText)
        startText.textContent = "Stop Live";

    setStatus("🔴 CHUK AN CHUKK LIVE");

    if (viewer)
        viewer.textContent =
            String(Math.floor(Math.random() * 8) + 1);

    clearInterval(timer);

    timer = setInterval(() => {
        seconds++;

        const min =
            String(Math.floor(seconds / 60))
                .padStart(2, "0");

        const sec =
            String(seconds % 60)
                .padStart(2, "0");

        if (timerBox)
            timerBox.textContent =
                `${min}:${sec}`;
    }, 1000);
}

function stopLive() {
    liveOn = false;

    clearInterval(timer);
    timer = null;

    startBtn?.classList.remove("live-active");

    if (startText)
        startText.textContent = "Mulai Live";

    if (timerBox)
        timerBox.textContent = "00:00";

    if (viewer)
        viewer.textContent = "0";

    setStatus("📷 Kamera siap");
}

startBtn?.addEventListener("click", () => {
    liveOn ? stopLive() : startLive();
});

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

closeBtn?.addEventListener("click", () => {
    stopLive();
    stopRenderer();
    stopTracks();

    window.location.href = "index.html";
});

/* =========================
   RESIZE
========================= */

window.addEventListener(
    "resize",
    resizeCanvas
);

window.addEventListener(
    "orientationchange",
    () => setTimeout(resizeCanvas, 300)
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

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        init,
        { once: true }
    );
} else {
    init();
}

console.log("✅ CHUK AN CHUKK LIVE V5 FINAL");
