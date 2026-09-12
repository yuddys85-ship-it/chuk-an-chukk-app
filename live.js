/* =========================================================
   CHUK AN CHUKK
   LIVE CAMERA CONTROLLER V2
   NON-MIRROR • NO ZOOM • CANVAS RENDERER
   ========================================================= */

"use strict";


/* =========================================================
   STATE
   ========================================================= */

let cameraStream = null;
let currentCamera = "user";

let cameraEnabled = true;
let micEnabled = true;
let liveStarted = false;

let likes = 0;
let seconds = 0;
let timerInterval = null;
let animationFrame = null;

let autoLightEnabled = true;

const filters = {
    plastic: 90,
    glow: 65,
    brightness: 35,
    softFocus: 55,
    detail: 25
};


/* =========================================================
   ELEMENTS
   ========================================================= */

const video = document.getElementById("camera");
const canvas = document.getElementById("filterCanvas");
const ctx = canvas ? canvas.getContext("2d", {
    alpha: false
}) : null;

const statusBox = document.getElementById("cameraStatus");

const startButton =
    document.getElementById("startLiveButton");

const startLiveText =
    document.getElementById("startLiveText");

const cameraButton =
    document.getElementById("cameraButton");

const cameraIcon =
    document.getElementById("cameraIcon");

const cameraText =
    document.getElementById("cameraText");

const micButton =
    document.getElementById("micButton");

const micIcon =
    document.getElementById("micIcon");

const micText =
    document.getElementById("micText");

const flipButton =
    document.getElementById("flipButton");

const bottomFlipButton =
    document.getElementById("bottomFlipButton");

const bottomMicButton =
    document.getElementById("bottomMicButton");

const filterButton =
    document.getElementById("filterButton");

const bottomFilterButton =
    document.getElementById("bottomFilterButton");

const filterPanel =
    document.getElementById("filterPanel");

const closeFilterButton =
    document.getElementById("closeFilterButton");

const dreamLikeButton =
    document.getElementById("dreamLikeButton");

const plasticSlider =
    document.getElementById("plasticSlider");

const glowSlider =
    document.getElementById("glowSlider");

const brightnessSlider =
    document.getElementById("brightnessSlider");

const softFocusSlider =
    document.getElementById("softFocusSlider");

const detailSlider =
    document.getElementById("detailSlider");

const plasticValue =
    document.getElementById("plasticValue");

const glowValue =
    document.getElementById("glowValue");

const brightnessValue =
    document.getElementById("brightnessValue");

const softFocusValue =
    document.getElementById("softFocusValue");

const detailValue =
    document.getElementById("detailValue");

const autoLightButton =
    document.getElementById("autoLightButton");

const commentButton =
    document.getElementById("commentButton");

const commentInputArea =
    document.getElementById("commentInputArea");

const commentInput =
    document.getElementById("commentInput");

const sendCommentButton =
    document.getElementById("sendCommentButton");

const commentsList =
    document.getElementById("commentsList");

const likeButton =
    document.getElementById("likeButton");

const likeCount =
    document.getElementById("likeCount");

const viewerCount =
    document.getElementById("viewerCount");

const liveTimer =
    document.getElementById("liveTimer");

const lightStatus =
    document.getElementById("lightStatus");

const followButton =
    document.getElementById("followButton");

const closeLiveButton =
    document.getElementById("closeLiveButton");


/* =========================================================
   VIDEO SOURCE MUST NEVER BE VISIBLE
   Canvas is the only visible camera.
   ========================================================= */

function prepareVideo() {

    if (!video) return;

    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;

    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    video.style.transform = "none";
    video.style.webkitTransform = "none";
    video.style.filter = "none";

}


/* =========================================================
   CAMERA STATUS
   ========================================================= */

function setCameraStatus(message) {

    if (statusBox) {
        statusBox.textContent = message;
    }

}


/* =========================================================
   CANVAS SIZE
   ========================================================= */

function resizeCanvas() {

    if (!canvas) return;

    const width =
        window.innerWidth || 360;

    const height =
        window.innerHeight || 640;

    const dpr =
        Math.min(window.devicePixelRatio || 1, 2);

    canvas.width =
        Math.floor(width * dpr);

    canvas.height =
        Math.floor(height * dpr);

    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";

}


/* =========================================================
   DRAW CAMERA
   IMPORTANT:
   - contain
   - no crop
   - no zoom
   - no mirror
   ========================================================= */

function drawCamera() {

    if (
        !canvas ||
        !ctx ||
        !video ||
        video.readyState < 2
    ) {

        animationFrame =
            requestAnimationFrame(drawCamera);

        return;

    }


    const sourceWidth =
        video.videoWidth;

    const sourceHeight =
        video.videoHeight;


    if (
        !sourceWidth ||
        !sourceHeight
    ) {

        animationFrame =
            requestAnimationFrame(drawCamera);

        return;

    }


    const canvasWidth =
        canvas.width;

    const canvasHeight =
        canvas.height;


    /* Clear */

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = "#000";
    ctx.fillRect(
        0,
        0,
        canvasWidth,
        canvasHeight
    );


    /* =====================================================
       CONTAIN MODE
       Seluruh kamera terlihat.
       Tidak ada crop.
       ===================================================== */

    const scale =
        Math.min(
            canvasWidth / sourceWidth,
            canvasHeight / sourceHeight
        );


    const drawWidth =
        sourceWidth * scale;

    const drawHeight =
        sourceHeight * scale;


    const x =
        (canvasWidth - drawWidth) / 2;

    const y =
        (canvasHeight - drawHeight) / 2;


    /* =====================================================
       FILTER
       ===================================================== */

    const brightness =
        autoLightEnabled
            ? Math.max(
                100,
                100 + filters.brightness * 0.35
            )
            : 100 + filters.brightness * 0.20;


    const saturation =
        100 + filters.glow * 0.12;


    const contrast =
        100 - filters.plastic * 0.04;


    const blur =
        filters.softFocus * 0.012;


    ctx.filter =
        `brightness(${brightness}%) ` +
        `saturate(${saturation}%) ` +
        `contrast(${contrast}%) ` +
        `blur(${blur}px)`;


    /* =====================================================
       CRITICAL:
       JANGAN gunakan scale(-1, 1).
       Kamera ditampilkan NORMAL.
       ===================================================== */

    ctx.drawImage(
        video,
        x,
        y,
        drawWidth,
        drawHeight
    );


    ctx.filter = "none";


    /* =====================================================
       SOFT GLOW OVERLAY
       ===================================================== */

    if (filters.glow > 0) {

        const glowAlpha =
            (filters.glow / 100) * 0.08;

        ctx.fillStyle =
            `rgba(255,255,255,${glowAlpha})`;

        ctx.fillRect(
            x,
            y,
            drawWidth,
            drawHeight
        );

    }


    animationFrame =
        requestAnimationFrame(drawCamera);

}


/* =========================================================
   START RENDERER
   ========================================================= */

function startRenderer() {

    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

    }

    resizeCanvas();

    animationFrame =
        requestAnimationFrame(drawCamera);

}


/* =========================================================
   STOP RENDERER
   ========================================================= */

function stopRenderer() {

    if (animationFrame) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;

    }

}


/* =========================================================
   START CAMERA
   ========================================================= */

async function startCamera() {

    try {

        setCameraStatus(
            "📷 Menyiapkan kamera..."
        );


        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            throw new Error(
                "getUserMedia tidak tersedia"
            );

        }


        /* Stop kamera lama */

        stopCameraTracks();


        /* =================================================
           CAMERA CONSTRAINTS
           ================================================= */

        const constraints = {

            video: {

                facingMode: {
                    exact: currentCamera
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

        };


        try {

            cameraStream =
                await navigator.mediaDevices
                    .getUserMedia(constraints);

        } catch (firstError) {

            console.warn(
                "Exact camera gagal, mencoba fallback...",
                firstError
            );


            cameraStream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {
                            facingMode: currentCamera,
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


        /* Hubungkan stream */

        video.srcObject =
            cameraStream;


        prepareVideo();


        /* Tunggu metadata */

        await new Promise(resolve => {

            if (video.readyState >= 1) {

                resolve();

                return;

            }


            video.addEventListener(
                "loadedmetadata",
                resolve,
                {
                    once: true
                }
            );

        });


        try {

            await video.play();

        } catch (playError) {

            console.warn(
                "Video play:",
                playError
            );

        }


        /* Canvas */

        resizeCanvas();
        startRenderer();


        setCameraStatus(
            "✅ Kamera siap"
        );


        updateTracks();

    } catch (error) {

        console.error(
            "CHUK CAMERA ERROR:",
            error
        );


        setCameraStatus(
            "❌ Kamera tidak tersedia"
        );


        if (error.name === "NotAllowedError") {

            alert(
                "Izin kamera/mikrofon ditolak.\n\n" +
                "Silakan izinkan Kamera dan Mikrofon " +
                "untuk Chuk an Chukk."
            );

        } else {

            alert(
                "Kamera tidak dapat digunakan.\n\n" +
                "Pastikan halaman dibuka melalui HTTPS " +
                "dan kamera tidak sedang digunakan aplikasi lain."
            );

        }

    }

}


/* =========================================================
   STOP CAMERA TRACKS
   ========================================================= */

function stopCameraTracks() {

    if (!cameraStream) return;


    cameraStream
        .getTracks()
        .forEach(track => {

            try {
                track.stop();
            } catch (error) {
                console.warn(error);
            }

        });


    cameraStream = null;

}


/* =========================================================
   STOP CAMERA
   ========================================================= */

function stopCamera() {

    stopRenderer();

    stopCameraTracks();


    if (video) {

        video.srcObject = null;

    }

}


/* =========================================================
   TRACK STATE
   ========================================================= */

function updateTracks() {

    if (!cameraStream) return;


    const videoTrack =
        cameraStream.getVideoTracks()[0];

    const audioTrack =
        cameraStream.getAudioTracks()[0];


    if (videoTrack) {

        videoTrack.enabled =
            cameraEnabled;

    }


    if (audioTrack) {

        audioTrack.enabled =
            micEnabled;

    }


    if (cameraIcon) {

        cameraIcon.textContent =
            cameraEnabled
                ? "📹"
                : "🚫";

    }


    if (cameraText) {

        cameraText.textContent =
            cameraEnabled
                ? "Camera"
                : "Camera Off";

    }


    if (micIcon) {

        micIcon.textContent =
            micEnabled
                ? "🎤"
                : "🔇";

    }


    if (micText) {

        micText.textContent =
            micEnabled
                ? "Mic"
                : "Mic Off";

    }

}


/* =========================================================
   TOGGLE CAMERA
   ========================================================= */

function toggleCamera() {

    cameraEnabled =
        !cameraEnabled;

    updateTracks();

}


/* =========================================================
   TOGGLE MIC
   ========================================================= */

function toggleMic() {

    micEnabled =
        !micEnabled;

    updateTracks();

}


/* =========================================================
   CAMERA BUTTON
   ========================================================= */

if (cameraButton) {

    cameraButton.addEventListener(
        "click",
        toggleCamera
    );

}


/* =========================================================
   MIC BUTTON
   ========================================================= */

if (micButton) {

    micButton.addEventListener(
        "click",
        toggleMic
    );

}


/* =========================================================
   BOTTOM MIC
   ========================================================= */

if (bottomMicButton) {

    bottomMicButton.addEventListener(
        "click",
        toggleMic
    );

}


/* =========================================================
   FLIP CAMERA
   ========================================================= */

async function flipCamera() {

    currentCamera =
        currentCamera === "user"
            ? "environment"
            : "user";


    await startCamera();

}


if (flipButton) {

    flipButton.addEventListener(
        "click",
        flipCamera
    );

}


if (bottomFlipButton) {

    bottomFlipButton.addEventListener(
        "click",
        flipCamera
    );

}


/* =========================================================
   FILTER VALUES
   ========================================================= */

function updateFilterValues() {

    if (plasticSlider) {

        filters.plastic =
            Number(plasticSlider.value);

    }

    if (glowSlider) {

        filters.glow =
            Number(glowSlider.value);

    }

    if (brightnessSlider) {

        filters.brightness =
            Number(brightnessSlider.value);

    }

    if (softFocusSlider) {

        filters.softFocus =
            Number(softFocusSlider.value);

    }

    if (detailSlider) {

        filters.detail =
            Number(detailSlider.value);

    }


    if (plasticValue) {

        plasticValue.textContent =
            filters.plastic;

    }

    if (glowValue) {

        glowValue.textContent =
            filters.glow;

    }

    if (brightnessValue) {

        brightnessValue.textContent =
            filters.brightness;

    }

    if (softFocusValue) {

        softFocusValue.textContent =
            filters.softFocus;

    }

    if (detailValue) {

        detailValue.textContent =
            filters.detail;

    }

}


/* =========================================================
   SLIDERS
   ========================================================= */

[
    plasticSlider,
    glowSlider,
    brightnessSlider,
    softFocusSlider,
    detailSlider

].forEach(slider => {

    if (!slider) return;


    slider.addEventListener(
        "input",
        updateFilterValues
    );

});


/* =========================================================
   DREAM LIKE PRESET
   ========================================================= */

if (dreamLikeButton) {

    dreamLikeButton.addEventListener(
        "click",
        function() {

            filters.plastic = 90;
            filters.glow = 65;
            filters.brightness = 35;
            filters.softFocus = 55;
            filters.detail = 25;


            if (plasticSlider) {
                plasticSlider.value = 90;
            }

            if (glowSlider) {
                glowSlider.value = 65;
            }

            if (brightnessSlider) {
                brightnessSlider.value = 35;
            }

            if (softFocusSlider) {
                softFocusSlider.value = 55;
            }

            if (detailSlider) {
                detailSlider.value = 25;
            }


            updateFilterValues();

        }
    );

}


/* =========================================================
   FILTER PANEL OPEN
   ========================================================= */

function openFilterPanel() {

    if (!filterPanel) return;

    filterPanel.classList.add("show");

}


function closeFilterPanel() {

    if (!filterPanel) return;

    filterPanel.classList.remove("show");

}


if (filterButton) {

    filterButton.addEventListener(
        "click",
        openFilterPanel
    );

}


if (bottomFilterButton) {

    bottomFilterButton.addEventListener(
        "click",
        openFilterPanel
    );

}


if (closeFilterButton) {

    closeFilterButton.addEventListener(
        "click",
        closeFilterPanel
    );

}


/* =========================================================
   AUTO LIGHT
   ========================================================= */

if (autoLightButton) {

    autoLightButton.addEventListener(
        "click",
        function() {

            autoLightEnabled =
                !autoLightEnabled;


            autoLightButton.textContent =
                autoLightEnabled
                    ? "ON"
                    : "OFF";


            autoLightButton.classList.toggle(
                "active",
                autoLightEnabled
            );


            autoLightButton.setAttribute(
                "aria-pressed",
                String(autoLightEnabled)
            );


            if (lightStatus) {

                lightStatus.textContent =
                    autoLightEnabled
                        ? "💡 Auto Light"
                        : "💡 Auto Light OFF";

            }

        }
    );

}


/* =========================================================
   COMMENTS
   ========================================================= */

function addComment() {

    if (!commentInput || !commentsList) {
        return;
    }


    const text =
        commentInput.value.trim();


    if (!text) return;


    const comment =
        document.createElement("div");


    comment.className =
        "live-comment";


    comment.innerHTML =
        `<strong>You</strong> ${escapeHTML(text)}`;


    commentsList.appendChild(comment);


    commentInput.value = "";


    commentsList.scrollTop =
        commentsList.scrollHeight;

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


if (sendCommentButton) {

    sendCommentButton.addEventListener(
        "click",
        addComment
    );

}


if (commentInput) {

    commentInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                addComment();

            }

        }
    );

}


/* =========================================================
   COMMENT PANEL
   ========================================================= */

if (commentButton) {

    commentButton.addEventListener(
        "click",
        function() {

            if (!commentInputArea) return;


            const visible =
                commentInputArea.classList.contains("show");


            commentInputArea.classList.toggle(
                "show",
                !visible
            );


            if (!visible && commentInput) {

                setTimeout(
                    () => commentInput.focus(),
                    100
                );

            }

        }
    );

}


/* =========================================================
   FOLLOW
   ========================================================= */

if (followButton) {

    followButton.addEventListener(
        "click",
        function() {

            const following =
                followButton.classList.toggle(
                    "following"
                );


            followButton.textContent =
                following
                    ? "Following"
                    : "Follow";

        }
    );

}


/* =========================================================
   LIKE
   ========================================================= */

if (likeButton) {

    likeButton.addEventListener(
        "click",
        function() {

            likes++;

            if (likeCount) {

                likeCount.textContent =
                    likes;

            }

        }
    );

}


/* =========================================================
   START LIVE
   ========================================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        function() {

            if (liveStarted) {

                stopLive();

            } else {

                startLive();

            }

        }
    );

}


function startLive() {

    liveStarted = true;

    seconds = 0;


    startButton.classList.add(
        "live-active"
    );


    if (startLiveText) {

        startLiveText.textContent =
            "Stop Live";

    }


    statusBox.textContent =
        "🔴 CHUK AN CHUKK LIVE";


    viewerCount.textContent =
        String(
            Math.floor(
                Math.random() * 8
            ) + 1
        );


    startTimer();

}


function stopLive() {

    liveStarted = false;


    clearInterval(
        timerInterval
    );


    timerInterval = null;


    if (startButton) {

        startButton.classList.remove(
            "live-active"
        );

    }


    if (startLiveText) {

        startLiveText.textContent =
            "Mulai Live";

    }


    if (statusBox) {

        statusBox.textContent =
            "📷 Kamera siap";

    }


    if (viewerCount) {

        viewerCount.textContent =
            "0";

    }

}


/* =========================================================
   TIMER
   ========================================================= */

function startTimer() {

    clearInterval(
        timerInterval
    );


    updateTimer();


    timerInterval =
        setInterval(
            updateTimer,
            1000
        );

}


function updateTimer() {

    seconds++;


    const minutes =
        Math.floor(
            seconds / 60
        );


    const secs =
        seconds % 60;


    if (liveTimer) {

        liveTimer.textContent =
            String(minutes)
                .padStart(2, "0")
            +
            ":"
            +
            String(secs)
                .padStart(2, "0");

    }

}


/* =========================================================
   CLOSE LIVE
   ========================================================= */

if (closeLiveButton) {

    closeLiveButton.addEventListener(
        "click",
        function() {

            stopLive();

            stopCamera();

            window.location.href =
                "index.html";

        }
    );

}


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    resizeCanvas
);

window.addEventListener(
    "orientationchange",
    function() {

        setTimeout(
            resizeCanvas,
            250
        );

    }
);


/* =========================================================
   PAGE EXIT
   ========================================================= */

window.addEventListener(
    "beforeunload",
    function() {

        clearInterval(
            timerInterval
        );

        stopCamera();

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initLive() {

    prepareVideo();

    resizeCanvas();

    updateFilterValues();

    startRenderer();

    await startCamera();

}


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initLive
    );

} else {

    initLive();

}
