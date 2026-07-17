// ==========================================
// CHUK AN CHUKK
// script.js v2.0
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Chuk an Chukk berhasil dimuat");

});

// ==========================
// HEADER
// ==========================

function searchPost(){

    alert("🔍 Fitur pencarian segera hadir.");

}

function showNotifications(){

    alert("🔔 Belum ada notifikasi.");

}

// ==========================
// POST ACTION
// ==========================

let liked = false;

function likePost(){

    liked = !liked;

    if(liked){

        alert("❤️ Kamu menyukai postingan ini.");

    }else{

        alert("🤍 Like dibatalkan.");

    }

}

function commentPost(){

    alert("💬 Fitur komentar segera hadir.");

}

function sharePost(){

    if(navigator.share){

        navigator.share({

            title:"Chuk an Chukk",

            text:"Lihat postingan ini.",

            url:window.location.href

        });

    }else{

        alert("↗️ Browser belum mendukung Share.");

    }

}

function savePost(){

    alert("🔖 Postingan disimpan.");

}

// ==========================
// BOTTOM MENU
// ==========================

function goHome(){

    alert("🏠 Home");

}

function goPost(){

    alert("➕ Halaman upload postingan akan dibuat.");

}

function goChat(){

    alert("💬 Chat segera hadir.");

}

function goProfile(){

    alert("👤 Profile segera hadir.");

}

// ==========================
// DOUBLE TAP LIKE
// ==========================

let lastTap = 0;

document.addEventListener("touchend",function(){

    let currentTime = new Date().getTime();

    let tapLength = currentTime-lastTap;

    if(tapLength<300 && tapLength>0){

        likePost();

    }

    lastTap=currentTime;

});

// ==========================
// SCROLL POST
// ==========================

window.addEventListener("wheel",(e)=>{

    if(e.deltaY>0){

        console.log("Next Post");

    }else{

        console.log("Previous Post");

    }

});

// ==========================
// APP READY
// ==========================

console.log("🚀 Chuk an Chukk Ready");
