/* =========================================================
   CHUK AN CHUKK
   LIVE CAMERA V4
   NO MIRROR • NO ZOOM • NO CROP
   CANVAS CAMERA ENGINE
   NO DREAM-LIKE-FILTER.JS
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


/* =========================================================
   FILTER STATE
   ========================================================= */

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

const video =
    document.getElementById("camera");

const canvas =
    document.getElementById("filterCanvas");

const ctx =
    canvas
        ? canvas.getContext("2d", {
            alpha: false
        })
        : null;

const statusBox =
    document.getElementById("cameraStatus");

const startButton =
    document.getElementById("startLiveButton");

const startLiveText =
    document.getElementById("startLiveText");

const viewerCount =
    document.getElementById("viewerCount");

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

const lightStatus =
    document.getElementById("lightStatus");

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

const liveTimer =
    document.getElementById("liveTimer");

const followButton =
    document.getElementById("followButton");

const closeLiveButton =
    document.getElementById("closeLiveButton");


/* =========================================================
   PREPARE VIDEO
   VIDEO HANYA SUMBER KAMERA
   ========================================================= */

function prepareVideo() {

    if (!video) return;

    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    video.setAttribute(
        "playsinline",
        ""
    );

    video.setAttribute(
        "webkit-playsinline",
        ""
    );

    /*
     * Penting:
     * Video tidak boleh membalik atau memberi filter.
     */

    video.style.transform = "none";
    video.style.webkitTransform = "none";
    video.style.filter = "none";

}


/* =========================================================
   STATUS
   ========================================================= */

function setStatus(text) {

    if (statusBox) {

        statusBox.textContent =
            text;

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
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        Math.round(
            width * dpr
        );

    canvas.height =
        Math.round(
            height * dpr
        );

    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";

}


/* =========================================================
   RENDER CAMERA
   ========================================================= */

function renderCamera() {

    if (
        !canvas ||
        !ctx ||
        !video
    ) {

        animationFrame =
            requestAnimationFrame(
                renderCamera
            );

        return;

    }


    if (
        video.readyState < 2 ||
        !video.videoWidth ||
        !video.videoHeight
    ) {

        animationFrame =
            requestAnimationFrame(
                renderCamera
            );

        return;

    }


    const cw =
        canvas.width;

    const ch =
        canvas.height;

    const vw =
        video.videoWidth;

    const vh =
        video.videoHeight;


    /* =====================================================
       RESET CANVAS
       ===================================================== */

    ctx.setTransform(
        1,
        0,
        0,
        1,
        0,
        0
    );

    ctx.filter = "none";

    ctx.fillStyle =
        "#000000";

    ctx.fillRect(
        0,
        0,
        cw,
        ch
    );


    /* =====================================================
       CONTAIN
       NO ZOOM
       NO CROP
       ===================================================== */

    const scale =
        Math.min(
            cw / vw,
            ch / vh
        );


    const drawWidth =
        vw * scale;

    const drawHeight =
        vh * scale;


    const x =
        (cw - drawWidth) / 2;

    const y =
        (ch - drawHeight) / 2;


    /* =====================================================
       FILTER
       ===================================================== */

    const brightness =
        autoLightEnabled
            ? 100 +
              filters.brightness * 0.30
            : 100 +
              filters.brightness * 0.15;


    const saturation =
        100 +
        filters.glow * 0.10;


    const contrast =
        100 -
        filters.plastic * 0.03;


    const blur =
        filters.softFocus * 0.008;


    ctx.filter =
        "brightness(" +
        brightness +
        "%) " +

        "saturate(" +
        saturation +
        "%) " +

        "contrast(" +
        contrast +
        "%) " +

        "blur(" +
        blur +
        "px)";


    /* =====================================================
       DRAW RAW CAMERA FRAME
       
       IMPORTANT:
       TIDAK ADA scale(-1,1)
       TIDAK ADA translate horizontal

       Kamera depan = normal
       Kamera belakang = normal
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
       SOFT GLOW
       ===================================================== */

    if (
        filters.glow > 0
    ) {

        const alpha =
            (
                filters.glow /
                100
            ) * 0.06;


        ctx.fillStyle =
            "rgba(255,255,255," +
            alpha +
            ")";


        ctx.fillRect(
            x,
            y,
            drawWidth,
            drawHeight
        );

    }


    animationFrame =
        requestAnimationFrame(
            renderCamera
        );

}


/* =========================================================
   START RENDERER
   ========================================================= */

function startRenderer() {

    stopRenderer();

    resizeCanvas();

    animationFrame =
        requestAnimationFrame(
            renderCamera
        );

}


/* =========================================================
   STOP RENDERER
   ========================================================= */

function stopRenderer() {

    if (
        animationFrame !== null
    ) {

        cancelAnimationFrame(
            animationFrame
        );

        animationFrame = null;

    }

}


/* =========================================================
   STOP CAMERA TRACKS
   ========================================================= */

function stopCameraTracks() {

    if (!cameraStream) return;


    cameraStream
        .getTracks()
        .forEach(
            track => {

                try {

                    track.stop();

                } catch (error) {

                    console.warn(
                        error
                    );

                }

            }
        );


    cameraStream = null;

}


/* =========================================================
   START CAMERA
   ========================================================= */

async function startCamera() {

    try {

        setStatus(
            "📷 Menyiapkan kamera..."
        );


        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            throw new Error(
                "Camera API tidak tersedia"
            );

        }


        stopCameraTracks();


        let stream;


        /* =================================================
           REQUEST CAMERA
           ================================================= */

        try {

            stream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {

                            facingMode: {
                                exact:
                                    currentCamera
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

        } catch (error) {

            console.warn(
                "Exact camera gagal:",
                error
            );


            stream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {

                            facingMode:
                                currentCamera,

                            width: {
                                ideal: 1280
                            },

                            height: {
                                ideal: 720
                            }

                        },

                        audio: {

                            echoCancellation: true,

                            noiseSuppression: true,

                            autoGainControl: true

                        }

                    });

        }


        cameraStream =
            stream;


        video.srcObject =
            cameraStream;


        prepareVideo();


        /* =================================================
           WAIT VIDEO
           ================================================= */

        await new Promise(
            resolve => {

                if (
                    video.readyState >= 1
                ) {

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

            }
        );


        try {

            await video.play();

        } catch (error) {

            console.warn(
                "Video play:",
                error
            );

        }


        updateTracks();

        resizeCanvas();

        startRenderer();


        setStatus(
            "✅ Kamera siap"
        );


        console.log(
            "📷 CAMERA:",
            currentCamera
        );


        console.log(
            "📐 VIDEO:",
            video.videoWidth,
            "x",
            video.videoHeight
        );


    } catch (error) {

        console.error(
            "❌ CHUK CAMERA ERROR:",
            error
        );


        setStatus(
            "❌ Kamera tidak tersedia"
        );


        if (
            error.name ===
            "NotAllowedError"
        ) {

            alert(
                "Akses kamera/mikrofon ditolak.\n\n" +
                "Silakan izinkan kamera dan mikrofon."
            );

        } else {

            alert(
                "Kamera tidak dapat digunakan.\n\n" +
                "Pastikan Chuk an Chukk dibuka melalui HTTPS."
            );

        }

    }

}


/* =========================================================
   STOP CAMERA
   ========================================================= */

function stopCamera() {

    stopRenderer();

    stopCameraTracks();


    if (video) {

        video.srcObject =
            null;

    }

}


/* =========================================================
   UPDATE TRACKS
   ========================================================= */

function updateTracks() {

    if (!cameraStream) return;


    const videoTrack =
        cameraStream
            .getVideoTracks()[0];

    const audioTrack =
        cameraStream
            .getAudioTracks()[0];


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
   CAMERA TOGGLE
   ========================================================= */

function toggleCamera() {

    cameraEnabled =
        !cameraEnabled;

    updateTracks();

}


if (cameraButton) {

    cameraButton.addEventListener(
        "click",
        toggleCamera
    );

}


/* =========================================================
   MIC TOGGLE
   ========================================================= */

function toggleMic() {

    micEnabled =
        !micEnabled;

    updateTracks();

}


if (micButton) {

    micButton.addEventListener(
        "click",
        toggleMic
    );

}


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
            Number(
                plasticSlider.value
            );

    }


    if (glowSlider) {

        filters.glow =
            Number(
                glowSlider.value
            );

    }


    if (brightnessSlider) {

        filters.brightness =
            Number(
                brightnessSlider.value
            );

    }


    if (softFocusSlider) {

        filters.softFocus =
            Number(
                softFocusSlider.value
            );

    }


    if (detailSlider) {

        filters.detail =
            Number(
                detailSlider.value
            );

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
   FILTER SLIDERS
   ========================================================= */

[
    plasticSlider,
    glowSlider,
    brightnessSlider,
    softFocusSlider,
    detailSlider

].forEach(
    slider => {

        if (!slider) return;


        slider.addEventListener(
            "input",
            updateFilterValues
        );

    }
);


/* =========================================================
   DREAM LIKE PRESET
   ========================================================= */

if (dreamLikeButton) {

    dreamLikeButton.addEventListener(
        "click",
        function() {

            if (plasticSlider) {

                plasticSlider.value =
                    90;

            }

            if (glowSlider) {

                glowSlider.value =
                    65;

            }

            if (brightnessSlider) {

                brightnessSlider.value =
                    35;

            }

            if (softFocusSlider) {

                softFocusSlider.value =
                    55;

            }

            if (detailSlider) {

                detailSlider.value =
                    25;

            }


            updateFilterValues();

        }
    );

}


/* =========================================================
   FILTER PANEL
   ========================================================= */

function openFilter() {

    if (!filterPanel) return;

    filterPanel.classList.add(
        "show"
    );

}


function closeFilter() {

    if (!filterPanel) return;

    filterPanel.classList.remove(
        "show"
    );

}


if (filterButton) {

    filterButton.addEventListener(
        "click",
        openFilter
    );

}


if (bottomFilterButton) {

    bottomFilterButton.addEventListener(
        "click",
        openFilter
    );

}


if (closeFilterButton) {

    closeFilterButton.addEventListener(
        "click",
        closeFilter
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
                String(
                    autoLightEnabled
                )
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

function escapeHTML(text) {

    const element =
        document.createElement(
            "div"
        );

    element.textContent =
        String(text);

    return element.innerHTML;

}


function addComment() {

    if (
        !commentInput ||
        !commentsList
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


    item.innerHTML =
        "<strong>You</strong> " +
        escapeHTML(text);


    commentsList.appendChild(
        item
    );


    commentInput.value = "";


    commentsList.scrollTop =
        commentsList.scrollHeight;

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

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                addComment();

            }

        }
    );

}


/* =========================================================
   COMMENT BUTTON
   ========================================================= */

if (commentButton) {

    commentButton.addEventListener(
        "click",
        function() {

            if (!commentInputArea)
                return;


            commentInputArea.classList.toggle(
                "show"
            );


            if (
                commentInputArea.classList.contains(
                    "show"
                ) &&
                commentInput
            ) {

                setTimeout(
                    function() {

                        commentInput.focus();

                    },
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

            const active =
                followButton.classList.toggle(
                    "following"
                );


            followButton.textContent =
                active
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

    liveStarted =
        true;

    seconds =
        0;


    startButton.classList.add(
        "live-active"
    );


    if (startLiveText) {

        startLiveText.textContent =
            "Stop Live";

    }


    setStatus(
        "🔴 CHUK AN CHUKK LIVE"
    );


    if (viewerCount) {

        viewerCount.textContent =
            String(
                Math.floor(
                    Math.random() * 8
                ) + 1
            );

    }


    startTimer();

}


/* =========================================================
   STOP LIVE
   ========================================================= */

function stopLive() {

    liveStarted =
        false;


    clearInterval(
        timerInterval
    );


    timerInterval =
        null;


    if (startButton) {

        startButton.classList.remove(
            "live-active"
        );

    }


    if (startLiveText) {

        startLiveText.textContent =
            "Mulai Live";

    }


    setStatus(
        "📷 Kamera siap"
    );


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


    seconds =
        0;


    if (liveTimer) {

        liveTimer.textContent =
            "00:00";

    }


    timerInterval =
        setInterval(
            function() {

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
                            .padStart(
                                2,
                                "0"
                            )
                        +
                        ":"
                        +
                        String(secs)
                            .padStart(
                                2,
                                "0"
                            );

                }

            },
            1000
        );

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
    function() {

        resizeCanvas();

    }
);


window.addEventListener(
    "orientationchange",
    function() {

        setTimeout(
            resizeCanvas,
            300
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


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initLive
    );

} else {

    initLive();

}


/* =========================================================
   READY
   ========================================================= */

console.log(
    "✅ CHUK AN CHUKK LIVE V4 READY"
);

console.log(
    "📷 CAMERA: NO MIRROR"
);

console.log(
    "🔍 CAMERA: NO ZOOM"
);

console.log(
    "✂️ CAMERA: NO CROP"
);

console.log(
    "🎨 FILTER ENGINE: LIVE.JS"
);
