/* ===================================
   CHUK AN CHUKK v3.1
   SCRIPT.JS
=================================== */

let likeCount = 125;
let liked = false;


/* ===========================
   APP READY
=========================== */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 CHUK AN CHUKK READY");

});


/* ===========================
   HEADER
=========================== */

function searchPost(){

    alert("🔍 Fitur pencarian segera hadir.");

}


function showNotifications(){

    alert("🔔 Belum ada notifikasi.");

}


/* ===========================
   LIKE
=========================== */

function likePost(){

    liked = !liked;

    if(liked){

        likeCount++;

        alert("❤️ Disukai");

    }else{

        likeCount--;

        alert("🤍 Like dibatalkan");

    }

}


/* ===========================
   COMMENT
=========================== */

function commentPost(){

    alert(
        "💬 Fitur komentar segera hadir."
    );

}


/* ===========================
   SHARE
=========================== */

function sharePost(){

    if(navigator.share){

        navigator.share({

            title: "CHUK AN CHUKK",

            text: "Lihat postingan ini.",

            url: location.href

        }).catch(error => {

            console.log(
                "Share dibatalkan:",
                error
            );

        });

    }else{

        alert(
            "📤 Share tidak didukung browser ini."
        );

    }

}


/* ===========================
   SAVE
=========================== */

function savePost(){

    alert(
        "🔖 Postingan disimpan."
    );

}


/* ===========================
   MENU
=========================== */

function goHome(){

    window.location.href =
        "index.html";

}


function goChat(){

    alert(
        "💬 Fitur Chat segera hadir."
    );

}


function goProfile(){

    alert(
        "👤 Fitur Profile segera hadir."
    );

}


console.log(
    "🚀 CHUK AN CHUKK v3.1 READY"
);
