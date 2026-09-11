/* =========================================
   CHUK AN CHUKK
   LIVE + BEAUTY PRO
========================================= */

let cameraStream = null;
let currentCamera = "user";
let cameraEnabled = true;
let micEnabled = true;
let liveStarted = false;

let likes = 0;
let seconds = 0;


/* ELEMENTS */

const video = document.getElementById("camera");

const statusBox =
    document.getElementById("cameraStatus");

const startButton =
    document.getElementById("startLiveButton");

const cameraButton =
    document.getElementById("cameraButton");

const micButton =
    document.getElementById("micButton");

const flipButton =
    document.getElementById("flipButton");

const filterButton =
    document.getElementById("filterButton");

const filterPanel =
    document.querySelector(".filter-panel");

const faceGlow =
    document.getElementById("faceGlow");

const liveTime =
    document.getElementById("liveTime");

const viewerCount =
    document.getElementById("viewerCount");

const likeButton =
    document.getElementById("likeButton");

const likeCount =
    document.getElementById("likeCount");

const smoothRange =
    document.getElementById("smoothRange");

const brightnessRange =
    document.getElementById("brightnessRange");

const glowRange =
    document.getElementById("glowRange");



/* =========================================
   CAMERA
========================================= */

async function startCamera(){

    try{

        if(cameraStream){

            cameraStream
                .getTracks()
                .forEach(track => track.stop());

        }

        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video:{
                    facingMode:currentCamera,

                    width:{
                        ideal:1080
                    },

                    height:{
                        ideal:1920
                    }
                },

                audio:true

            });


        video.srcObject =
            cameraStream;

        video.muted = true;

        statusBox.textContent =
            "✅ Kamera siap";

        updateTracks();

    }catch(error){

        console.error(
            "Camera Error:",
            error
        );

        statusBox.textContent =
            "❌ Kamera tidak dapat digunakan";

        alert(
            "Kamera/mikrofon belum diizinkan.\n\n" +
            "Silakan izinkan akses kamera dan mikrofon."
        );

    }

}



/* =========================================
   TRACK CONTROL
========================================= */

function updateTracks(){

    if(!cameraStream) return;

    const videoTrack =
        cameraStream.getVideoTracks()[0];

    const audioTrack =
        cameraStream.getAudioTracks()[0];


    if(videoTrack){

        videoTrack.enabled =
            cameraEnabled;
    }

    if(audioTrack){

        audioTrack.enabled =
            micEnabled;
    }


    cameraButton.innerHTML =
        cameraEnabled
        ? "📹<small>Kamera</small>"
        : "🚫<small>Kamera</small>";


    micButton.innerHTML =
        micEnabled
        ? "🎤<small>Mic</small>"
        : "🔇<small>Mic</small>";

}



/* =========================================
   CAMERA ON/OFF
========================================= */

cameraButton.addEventListener(
    "click",
    function(){

        cameraEnabled =
            !cameraEnabled;

        updateTracks();

    }
);



/* =========================================
   MIC ON/OFF
========================================= */

micButton.addEventListener(
    "click",
    function(){

        micEnabled =
            !micEnabled;

        updateTracks();

    }
);



/* =========================================
   FLIP CAMERA
========================================= */

flipButton.addEventListener(
    "click",
    async function(){

        currentCamera =
            currentCamera === "user"
            ? "environment"
            : "user";

        await startCamera();

        if(currentCamera === "user"){

            video.style.transform =
                "scaleX(-1)";

        }else{

            video.style.transform =
                "scaleX(1)";

        }

    }
);



/* =========================================
   BEAUTY FILTER
========================================= */

function applyBeauty(){

    const smooth =
        Number(smoothRange.value);

    const brightness =
        Number(brightnessRange.value);

    const glow =
        Number(glowRange.value);


    video.style.filter = `
        brightness(${brightness}%)
        saturate(108%)
        contrast(98%)
        blur(${smooth / 100}px)
    `;


    faceGlow.style.opacity =
        glow / 100;

}



/* RANGE CONTROLS */

smoothRange.addEventListener(
    "input",
    applyBeauty
);

brightnessRange.addEventListener(
    "input",
    applyBeauty
);

glowRange.addEventListener(
    "input",
    applyBeauty
);



/* =========================================
   FILTER PRESETS
========================================= */

document
.querySelectorAll(".filter-btn")
.forEach(button => {

    button.addEventListener(
        "click",
        function(){

            document
            .querySelectorAll(".filter-btn")
            .forEach(btn =>
                btn.classList.remove("active")
            );

            this.classList.add("active");

            const filter =
                this.dataset.filter;

            setFilter(filter);

        }
    );

});



function setFilter(filter){

    switch(filter){

        case "beauty":

            smoothRange.value = 35;
            brightnessRange.value = 105;
            glowRange.value = 20;

            video.style.filter = `
                brightness(105%)
                saturate(108%)
                contrast(98%)
                blur(.35px)
            `;

            break;


        case "smooth":

            smoothRange.value = 70;
            brightnessRange.value = 103;
            glowRange.value = 10;

            video.style.filter = `
                brightness(103%)
                saturate(105%)
                contrast(97%)
                blur(.7px)
            `;

            break;


        case "glow":

            smoothRange.value = 35;
            brightnessRange.value = 110;
            glowRange.value = 65;

            video.style.filter = `
                brightness(110%)
                saturate(112%)
                contrast(96%)
                blur(.3px)
            `;

            break;


        case "warm":

            smoothRange.value = 25;
            brightnessRange.value = 105;
            glowRange.value = 15;

            video.style.filter = `
                brightness(105%)
                saturate(125%)
                sepia(18%)
                contrast(98%)
            `;

            break;


        case "cool":

            smoothRange.value = 20;
            brightnessRange.value = 105;
            glowRange.value = 10;

            video.style.filter = `
                brightness(105%)
                saturate(110%)
                hue-rotate(12deg)
                contrast(98%)
            `;

            break;


        case "dramatic":

            smoothRange.value = 0;
            brightnessRange.value = 100;
            glowRange.value = 0;

            video.style.filter = `
                contrast(125%)
                saturate(120%)
            `;

            break;


        case "bw":

            smoothRange.value = 10;
            brightnessRange.value = 105;
            glowRange.value = 0;

            video.style.filter = `
                grayscale(100%)
                brightness(105%)
                contrast(108%)
            `;

            break;

    }

    faceGlow.style.opacity =
        Number(glowRange.value) / 100;

}



/* =========================================
   FILTER PANEL
========================================= */

filterButton.addEventListener(
    "click",
    function(){

        filterPanel.classList.toggle("show");

    }
);



/* =========================================
   RESET
========================================= */

document
.getElementById("resetFilter")
.addEventListener(
    "click",
    function(){

        smoothRange.value = 0;
        brightnessRange.value = 100;
        glowRange.value = 0;

        video.style.filter =
            "none";

        faceGlow.style.opacity = 0;

        document
        .querySelectorAll(".filter-btn")
        .forEach(btn =>
            btn.classList.remove("active")
        );

        document
        .querySelector('[data-filter="beauty"]')
        .classList.add("active");

    }
);



/* =========================================
   START / STOP LIVE
========================================= */

startButton.addEventListener(
    "click",
    function(){

        liveStarted =
            !liveStarted;


        if(liveStarted){

            startButton.classList.add(
                "live-active"
            );

            startButton.innerHTML =
                "⏹️<small>Stop Live</small>";

            statusBox.textContent =
                "🔴 CHUK AN CHUKK LIVE";

            startTimer();

            viewerCount.textContent =
                Math.floor(
                    Math.random() * 8
                ) + 1;

        }else{

            stopLive();

        }

    }
);



/* =========================================
   TIMER
========================================= */

let timerInterval = null;

function startTimer(){

    clearInterval(
        timerInterval
    );

    timerInterval =
        setInterval(
            function(){

                seconds++;

                const minutes =
                    Math.floor(seconds / 60);

                const secs =
                    seconds % 60;

                liveTime.textContent =
                    String(minutes).padStart(2,"0")
                    + ":" +
                    String(secs).padStart(2,"0");

            },
            1000
        );

}



/* =========================================
   STOP LIVE
========================================= */

function stopLive(){

    liveStarted = false;

    clearInterval(
        timerInterval
    );

    startButton.classList.remove(
        "live-active"
    );

    startButton.innerHTML =
        "🔴<small>Mulai Live</small>";

    statusBox.textContent =
        "📷 Kamera siap";

    viewerCount.textContent =
        "0";

}



/* =========================================
   LIKE
========================================= */

likeButton.addEventListener(
    "click",
    function(){

        likes++;

        likeCount.textContent =
            likes;

    }
);



/* =========================================
   CLOSE
========================================= */

document
.getElementById("closeLive")
.addEventListener(
    "click",
    function(){

        if(cameraStream){

            cameraStream
                .getTracks()
                .forEach(track =>
                    track.stop()
                );

        }

        window.location.href =
            "index.html";

    }
);



/* =========================================
   INIT
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function(){

        await startCamera();

        applyBeauty();

    }
);
