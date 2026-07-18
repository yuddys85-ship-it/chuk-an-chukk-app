/* ===================================
   CHUK AN CHUKK v2.0
=================================== */

let likeCount = 125;
let liked = false;

/* ===========================
   APP READY
=========================== */

document.addEventListener("DOMContentLoaded", () => {

    loadPosts();

});

/* ===========================
   LOAD POST
=========================== */

function loadPosts(){

    const feed = document.getElementById("feed");

    if(!feed) return;

    const savedPost = localStorage.getItem("lastPost");

    if(savedPost){

        const post = JSON.parse(savedPost);

        feed.innerHTML = `
        <div class="post">

            <img src="assets/post.jpg"
                 class="post-image">

            <div class="gradient"></div>

            <div class="post-overlay">

                <div class="post-info">

                    <h3>@ChukOfficial</h3>

                    <p>${post.caption}</p>

                </div>

                <div class="post-actions">

                    <button onclick="likePost()">❤️</button>

                    <button onclick="commentPost()">💬</button>

                    <button onclick="sharePost()">↗️</button>

                    <button onclick="savePost()">🔖</button>

                </div>

            </div>

        </div>
        `;

    }

}

/* ===========================
   HEADER
=========================== */

function searchPost(){

    alert("🔍 Segera hadir");

}

function showNotifications(){

    alert("🔔 Belum ada notifikasi");

}

/* ===========================
   LIKE
=========================== */

function likePost(){

    liked=!liked;

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

    alert("💬 Fitur komentar segera hadir.");

}

/* ===========================
   SHARE
=========================== */

function sharePost(){

    if(navigator.share){

        navigator.share({

            title:"Chuk an Chukk",

            text:"Lihat postingan ini",

            url:location.href

        });

    }else{

        alert("Share tidak didukung.");

    }

}

/* ===========================
   SAVE
=========================== */

function savePost(){

    alert("🔖 Disimpan");

}

/* ===========================
   MENU
=========================== */

function goHome(){

    location.href="index.html";

}

function goChat(){

    alert("Chat segera hadir.");

}

function goProfile(){

    alert("Profile segera hadir.");

}

console.log("CHUK AN CHUKK v2 READY");
