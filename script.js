/* ===================================
   CHUK AN CHUKK v1.0
=================================== */

let likeCount = 125;
let liked = false;

// ====================
// APP READY
// ====================

document.addEventListener("DOMContentLoaded", () => {

    console.log("CHUK AN CHUKK READY");

});

// ====================
// HEADER
// ====================

function searchPost(){

    alert("🔍 Fitur pencarian akan segera hadir.");

}

function showNotifications(){

    alert("🔔 Belum ada notifikasi.");

}

// ====================
// LIKE
// ====================

function likePost(){

    if(!liked){

        liked = true;
        likeCount++;

        alert("❤️ Postingan disukai");

    }else{

        liked = false;
        likeCount--;

        alert("🤍 Like dibatalkan");

    }

}

// ====================
// COMMENT
// ====================

function commentPost(){

    alert("💬 Fitur komentar segera hadir.");

}

// ====================
// SHARE
// ====================

function sharePost(){

    if(navigator.share){

        navigator.share({

            title:"Chuk an Chukk",

            text:"Lihat postingan ini.",

            url:window.location.href

        });

    }else{

        alert("Browser belum mendukung Share.");

    }

}

// ====================
// SAVE
// ====================

function savePost(){

    alert("🔖 Postingan disimpan.");

}

// ====================
// MENU
// ====================

function goHome(){

    window.location.href="index.html";

}

function goChat(){

    alert("💬 Halaman Chat akan dibuat.");

}

function goProfile(){

    alert("👤 Halaman Profile akan dibuat.");

}

// ====================
// DOUBLE TAP LIKE
// ====================

let lastTap = 0;

document.addEventListener("touchend",function(){

    let currentTime = new Date().getTime();

    let tapLength = currentTime-lastTap;

    if(tapLength<300 && tapLength>0){

        likePost();

    }

    lastTap=currentTime;

});

// ====================
// SCROLL
// ====================

window.addEventListener("wheel",(e)=>{

    if(e.deltaY>0){

        console.log("Next Feed");

    }else{

        console.log("Previous Feed");

    }

});

console.log("🚀 Chuk an Chukk v1.0 Loaded");
