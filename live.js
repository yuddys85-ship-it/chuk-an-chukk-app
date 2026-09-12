/* =========================================
   CHUK AN CHUKK
   LIVE CAMERA + BEAUTY FILTER
   NON-MIRROR VERSION
========================================= */

let cameraStream = null;
let currentCamera = "user";

let cameraEnabled = true;
let micEnabled = true;
let liveStarted = false;

let likes = 0;
let seconds = 0;
let timerInterval = null;


/* =========================================
   ELEMENT
========================================= */

const video = document.getElementById("camera");
const statusBox = document.getElementById("cameraStatus");
const startButton = document.getElementById("startLiveButton");

const cameraButton = document.getElementById("cameraButton");
const micButton = document.getElementById("micButton");
const flipButton = document.getElementById("flipButton");
const filterButton = document.getElementById("filterButton");

const filterPanel = document.querySelector(".filter-panel");
const faceGlow = document.getElementById("faceGlow");

const liveTime = document.getElementById("liveTime");
const viewerCount = document.getElementById("viewerCount");

const likeButton = document.getElementById("likeButton");
const likeCount = document.getElementById("likeCount");

const smoothRange = document.getElementById("smoothRange");
const brightnessRange = document.getElementById("brightnessRange");
const glowRange = document.getElementById("glowRange");



/* =========================================
   FORCE NON-MIRROR
========================================= */

function forceNormalCamera(){

    if(!video) return;

    video.style.transform = "none";
    video.style.webkitTransform = "none";

    video.removeAttribute("dir");

}



/* =========================================
   START CAMERA
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
                    facingMode:{
                        ideal:currentCamera
                    },

                    width:{
                        ideal:1280
                    },

                    height:{
                        ideal:720
                    },

                    frameRate:{
                        ideal:30,
                        max:30
                    }
                },

                audio:{
                    echoCancellation:true,
                    noiseSuppression:true,
                    autoGainControl:true
                }

            });


        video.srcObject =
            cameraStream;


        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;


        /* WAJIB NON-MIRROR */

        forceNormalCamera();


        try{

            await video.play();

        }catch(error){

            console.log(
                "Video autoplay:",
                error
            );

        }


        statusBox.textContent =
            "✅ Kamera siap";


        updateTracks();


    }catch(error){

        console.error(
            "❌ CAMERA ERROR:",
            error
        );

        statusBox.textContent =
            "❌ Kamera tidak tersedia";


        alert(
            "Kamera atau mikrofon belum diizinkan.\n\n" +
            "Izinkan akses kamera dan mikrofon di browser."
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


    if(cameraButton){

        cameraButton.innerHTML =
            cameraEnabled
            ? "📹<small>Kamera</small>"
            : "🚫<small>Kamera</small>";

    }


    if(micButton){

        micButton.innerHTML =
            micEnabled
            ? "🎤<small>Mic</small>"
            : "🔇<small>Mic</small>";

    }

}



/* =========================================
   CAMERA ON / OFF
========================================= */

if(cameraButton){

    cameraButton.addEventListener(
        "click",
        function(){

            cameraEnabled =
                !cameraEnabled;

            updateTracks();

        }
    );

}



/* =========================================
   MIC ON / OFF
========================================= */

if(micButton){

    micButton.addEventListener(
        "click",
        function(){

            micEnabled =
                !micEnabled;

            updateTracks();

        }
    );

}



/* =========================================
   FLIP CAMERA
========================================= */

if(flipButton){

    flipButton.addEventListener(
        "click",
        async function(){

            currentCamera =
                currentCamera === "user"
                ? "environment"
                : "user";


            await startCamera();


            /* TETAP NORMAL */

            forceNormalCamera();

        }
    );

}



/* =========================================
   BEAUTY FILTER
========================================= */

function applyBeauty(){

    if(!video) return;


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


    if(faceGlow){

        faceGlow.style.opacity =
            glow / 100;

    }


    /* Filter tidak boleh mengubah mirror */

    forceNormalCamera();

}



/* =========================================
   RANGE
========================================= */

if(smoothRange){

    smoothRange.addEventListener(
        "input",
        applyBeauty
    );

}

if(brightnessRange){

    brightnessRange.addEventListener(
        "input",
        applyBeauty
    );

}

if(glowRange){

    glowRange.addEventListener(
        "input",
        applyBeauty
    );

}



/* =========================================
   FILTER BUTTONS
========================================= */

document
.querySelectorAll(".filter-btn")
.forEach(button => {

    button.addEventListener(
        "click",
        function(){

            document
            .querySelectorAll(".filter-btn")
            .forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            this.classList.add(
                "active"
            );


            setFilter(
                this.dataset.filter
            );

        }
    );

});



/* =========================================
   FILTER PRESETS
========================================= */

function setFilter(filter){

    if(!video) return;


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


    if(faceGlow){

        faceGlow.style.opacity =
            Number(glowRange.value) / 100;

    }


    forceNormalCamera();

}



/* =========================================
   FILTER PANEL
========================================= */

if(filterButton){

    filterButton.addEventListener(
        "click",
        function(){

            if(filterPanel){

                filterPanel.classList.toggle(
                    "show"
                );

            }

        }
    );

}



/* =========================================
   RESET FILTER
========================================= */

const resetFilter =
    document.getElementById(
        "resetFilter"
    );


if(resetFilter){

    resetFilter.addEventListener(
        "click",
        function(){

            smoothRange.value = 0;
            brightnessRange.value = 100;
            glowRange.value = 0;


            video.style.filter =
                "none";


            if(faceGlow){

                faceGlow.style.opacity =
                    0;

            }


            document
            .querySelectorAll(".filter-btn")
            .forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            const beautyButton =
                document.querySelector(
                    '[data-filter="beauty"]'
                );


            if(beautyButton){

                beautyButton.classList.add(
                    "active"
                );

            }


            forceNormalCamera();

        }
    );

}



/* =========================================
   START / STOP LIVE
========================================= */

if(startButton){

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


                seconds = 0;

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

}



/* =========================================
   TIMER
========================================= */

function startTimer(){

    clearInterval(
        timerInterval
    );


    timerInterval =
        setInterval(
            function(){

                seconds++;


                const minutes =
                    Math.floor(
                        seconds / 60
                    );


                const secs =
                    seconds % 60;


                if(liveTime){

                    liveTime.textContent =
                        String(minutes)
                        .padStart(2,"0")
                        +
                        ":" +
                        String(secs)
                        .padStart(2,"0");

                }

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


    if(startButton){

        startButton.classList.remove(
            "live-active"
        );


        startButton.innerHTML =
            "🔴<small>Mulai Live</small>";

    }


    if(statusBox){

        statusBox.textContent =
            "📷 Kamera siap";

    }


    if(viewerCount){

        viewerCount.textContent =
            "0";

    }

}



/* =========================================
   LIKE
========================================= */

if(likeButton){

    likeButton.addEventListener(
        "click",
        function(){

            likes++;


            if(likeCount){

                likeCount.textContent =
                    likes;

            }

        }
    );

}



/* =========================================
   CLOSE LIVE
========================================= */

const closeLive =
    document.getElementById(
        "closeLive"
    );


if(closeLive){

    closeLive.addEventListener(
        "click",
        function(){

            stopCamera();

            window.location.href =
                "index.html";

        }
    );

}



/* =========================================
   STOP CAMERA
========================================= */

function stopCamera(){

    if(cameraStream){

        cameraStream
            .getTracks()
            .forEach(track => {

                track.stop();

            });


        cameraStream = null;

    }


    if(video){

        video.srcObject = null;

    }

}



/* =========================================
   PAGE EXIT
========================================= */

window.addEventListener(
    "beforeunload",
    function(){

        stopCamera();

    }
);



/* =========================================
   INIT
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function(){

        /* Pastikan video selalu normal */

        forceNormalCamera();


        /* Beauty default */

        if(smoothRange){
            smoothRange.value = 35;
        }

        if(brightnessRange){
            brightnessRange.value = 105;
        }

        if(glowRange){
            glowRange.value = 20;
        }


        applyBeauty();


        /* Start camera */

        await startCamera();


        /* Force sekali lagi */

        forceNormalCamera();

    }
);
