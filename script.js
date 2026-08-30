/* ===================================
   CHUK AN CHUKK v4.0
   SOCIAL FEED + KOMENTAR
=================================== */

let likedPosts = new Set();

/* ===========================
   APP READY
=========================== */

document.addEventListener("DOMContentLoaded", () => {
    loadPosts();
});

/* ===========================
   LOAD POSTS
=========================== */

async function loadPosts(){

    const feed = document.getElementById("feed");

    if(!feed) return;

    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at",{ascending:false});

    if(error){

        console.error(error);

        feed.innerHTML = `
            <div class="empty-feed">
                Belum ada postingan.
            </div>
        `;

        return;
    }

    feed.innerHTML = "";

    if(!data || data.length === 0){

        feed.innerHTML = `
            <div class="empty-feed">
                Belum ada postingan.
            </div>
        `;

        return;
    }

    data.forEach(post => {

        let media = "";

        if(post.media){

            const isVideo =
                /\.(mp4|webm|mov|m4v)$/i.test(post.media);

            if(isVideo){

                media = `
                    <video
                        class="post-image"
                        src="${post.media}"
                        autoplay
                        muted
                        loop
                        playsinline>
                    </video>
                `;

            }else{

                media = `
                    <img
                        class="post-image"
                        src="${post.media}"
                        alt="Postingan"
                        loading="lazy">
                `;
            }
        }

        feed.innerHTML += `

            <article class="post">

                ${media}

                <div class="gradient"></div>

                <div class="post-overlay">

                    <div class="post-info">

                        <h3>@ChukOfficial</h3>

                        <p>
                            ${escapeHTML(post.caption || "")}
                        </p>

                    </div>

                    <div class="post-actions">

                        <button
                            onclick="likePost('${post.id}', this)"
                            aria-label="Like">
                            ❤️
                        </button>

                        <button
                            onclick="commentPost('${post.id}')"
                            aria-label="Komentar">
                            💬
                        </button>

                        <button
                            onclick="sharePost('${post.id}')"
                            aria-label="Bagikan">
                            ↗️
                        </button>

                        <button
                            onclick="savePost('${post.id}')"
                            aria-label="Simpan">
                            🔖
                        </button>

                    </div>

                </div>

            </article>

        `;
    });
}

/* ===========================
   LIKE
=========================== */

function likePost(postId, button){

    if(likedPosts.has(postId)){

        likedPosts.delete(postId);

        button.classList.remove("liked");

    }else{

        likedPosts.add(postId);

        button.classList.add("liked");

    }
}

/* ===========================
   KOMENTAR
=========================== */

async function sendComment(postId){

    const input = document.getElementById("commentText");

    if(!input) return;

    const text = input.value.trim();

    if(!text){
        alert("Tulis komentar terlebih dahulu.");
        return;
    }

    const button = document.querySelector(".comment-input button");

    if(button){
        button.disabled = true;
        button.textContent = "Mengirim...";
    }

    try{

        const username =
            localStorage.getItem("pi_username") ||
            "User";

        console.log("Mengirim komentar:", {
            post_id: postId,
            username: username,
            comment: text
        });

        const { data, error } = await supabase
            .from("comments")
            .insert([{
                post_id: postId,
                username: username,
                comment: text
            }])
            .select();

        if(error){

            console.error("COMMENT ERROR:", error);

            alert(
                "❌ Komentar gagal dikirim\n\n" +
                error.message
            );

            return;
        }

        console.log("COMMENT BERHASIL:", data);

        input.value = "";

        alert("✅ Komentar berhasil dikirim!");

        await loadComments(postId);

    }catch(err){

        console.error("SYSTEM COMMENT ERROR:", err);

        alert(
            "❌ System error\n\n" +
            err.message
        );

    }finally{

        if(button){

            button.disabled = false;
            button.textContent = "Kirim";

        }

    }
/* ===========================
   LOAD COMMENTS
=========================== */

async function loadComments(postId){

    const list =
        document.getElementById("commentsList");

    if(!list) return;

    const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at",{ascending:true});

    if(error){

        console.error(error);

        list.innerHTML = `
            <div class="comment-empty">
                Belum ada komentar.
            </div>
        `;

        return;
    }

    if(!data || data.length === 0){

        list.innerHTML = `
            <div class="comment-empty">
                Belum ada komentar.<br>
                Jadilah yang pertama berkomentar.
            </div>
        `;

        return;
    }

    list.innerHTML = data.map(comment => `

        <div class="comment-item">

            <div class="comment-avatar">
                👤
            </div>

            <div class="comment-content">

                <strong>
                    @${escapeHTML(
                        comment.username || "User"
                    )}
                </strong>

                <p>
                    ${escapeHTML(
                        comment.comment || ""
                    )}
                </p>

            </div>

        </div>

    `).join("");
}

/* ===========================
   SEND COMMENT
=========================== */

async function sendComment(postId){

    const input =
        document.getElementById("commentText");

    if(!input) return;

    const text = input.value.trim();

    if(!text){

        input.focus();

        return;
    }

    const username =
        localStorage.getItem("pi_username") ||
        "User";

    const { error } = await supabase
        .from("comments")
        .insert({

            post_id: postId,

            username: username,

            comment: text

        });

    if(error){

        console.error(error);

        alert(
            "❌ Komentar gagal dikirim."
        );

        return;
    }

    input.value = "";

    loadComments(postId);
}

/* ===========================
   CLOSE COMMENTS
=========================== */

function closeComments(){

    const box =
        document.getElementById("commentBox");

    if(box){

        box.remove();

    }
}

/* ===========================
   SHARE
=========================== */

async function sharePost(postId){

    if(navigator.share){

        try{

            await navigator.share({

                title:"CHUK AN CHUKK",

                text:"Lihat postingan ini di Chuk an Chukk.",

                url:location.href

            });

        }catch(e){}

    }else{

        alert("Share tidak didukung oleh HP ini.");

    }
}

/* ===========================
   SAVE
=========================== */

function savePost(postId){

    localStorage.setItem(
        "saved_" + postId,
        "true"
    );

    alert("🔖 Postingan disimpan.");

}

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

/* ===========================
   SECURITY
=========================== */

function escapeHTML(text){

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

console.log(
    "🚀 CHUK AN CHUKK v4.0 READY"
);
