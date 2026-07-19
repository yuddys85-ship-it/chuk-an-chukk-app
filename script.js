/* ===================================
   CHUK AN CHUKK v3.0
   SCRIPT.JS
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
   LOAD POST DARI SUPABASE
=========================== */

async function loadPosts(){

    const feed = document.getElementById("feed");

    if(!feed) return;

    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("id",{ascending:false});

    if(error){

        console.log(error);

        feed.innerHTML="<h2 style='text-align:center;padding:50px;'>Belum ada postingan.</h2>";

        return;

    }

    feed.innerHTML="";

    data.forEach(post=>{

        let media="";

        if(post.media){

            if(
                post.media.endsWith(".mp4") ||
                post.media.endsWith(".webm") ||
                post.media.endsWith(".mov")
            ){

                media=`
                <video
                class="post-image"
                controls
                autoplay
                muted
                loop>

                <source src="${post.media}">

                </video>
                `;

            }else{

                media=`
                <img
                src="${post.media}"
                class="post-image"
                alt="Postingan">
                `;

            }

        }

        feed.innerHTML += `

        <div class="post">

            ${media}

            <div class="gradient"></div>

            <div class="post-overlay">

                <div class="post-info">

                    <h3>@ChukOfficial</h3>

                    <p>${post.caption || ""}</p>

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

    });

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

            title:"CHUK AN CHUKK",

            text:"Lihat postingan ini.",

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

    alert("🔖 Postingan disimpan.");

}

/* ===========================
   MENU
=========================== */

function goHome(){

    location.href="index.html";

}

function goChat(){

    alert("💬 Chat segera hadir.");

}

function goProfile(){

    alert("👤 Profile segera hadir.");

}

console.log("🚀 CHUK AN CHUKK v3.0 READY");
