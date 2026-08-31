/* =========================================
   CHUK AN CHUKK v5.0
   SOCIAL FEED + KOMENTAR
   SUPABASE FIX
========================================= */

const db = window.chukSupabase;

let likedPosts = new Set();
let currentCommentPostId = null;

/* =========================================
   APP READY
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    if (!db) {
        console.error("❌ Supabase client tidak ditemukan.");
        return;
    }

    loadPosts();

});


/* =========================================
   LOAD POSTS
========================================= */

async function loadPosts() {

    const feed = document.getElementById("feed");

    if (!feed) return;

    const { data, error } = await db
        .from("posts")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {

        console.error("POST ERROR:", error);

        feed.innerHTML = `
            <div class="empty-feed">
                Belum ada postingan.
            </div>
        `;

        return;
    }

    if (!data || data.length === 0) {

        feed.innerHTML = `
            <div class="empty-feed">
                Belum ada postingan.
            </div>
        `;

        return;
    }

    feed.innerHTML = "";

    data.forEach(function (post) {

        let media = "";

        if (post.media) {

            const isVideo =
                /\.(mp4|webm|mov|m4v)$/i.test(post.media);

            if (isVideo) {

                media = `
                    <video
                        class="post-image"
                        src="${escapeHTML(post.media)}"
                        autoplay
                        muted
                        loop
                        playsinline>
                    </video>
                `;

            } else {

                media = `
                    <img
                        class="post-image"
                        src="${escapeHTML(post.media)}"
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


/* =========================================
   LIKE
========================================= */

function likePost(postId, button) {

    if (!postId || !button) return;

    if (likedPosts.has(postId)) {

        likedPosts.delete(postId);
        button.classList.remove("liked");

    } else {

        likedPosts.add(postId);
        button.classList.add("liked");

    }
}


/* =========================================
   BUKA KOMENTAR
========================================= */

async function commentPost(postId) {

    if (!postId || postId === "undefined") {

        alert("❌ ID postingan tidak ditemukan.");
        return;
    }

    currentCommentPostId = postId;

    closeComments();

    const box = document.createElement("div");

    box.id = "commentBox";

    box.innerHTML = `

        <div class="comment-panel">

            <div class="comment-header">

                <strong>💬 Komentar</strong>

                <button
                    class="comment-close"
                    onclick="closeComments()">
                    ✕
                </button>

            </div>

            <div
                id="commentsList"
                class="comments-list">

                <div class="comment-loading">
                    Memuat komentar...
                </div>

            </div>

            <div class="comment-input">

                <input
                    id="commentText"
                    type="text"
                    placeholder="Tulis komentar..."
                    autocomplete="off"
                    enterkeyhint="send">

                <button
                    type="button"
                    onclick="sendComment('${postId}')">
                    Kirim
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(box);

    await loadComments(postId);

    const input =
        document.getElementById("commentText");

    if (input) {

        setTimeout(function () {

            input.focus();

        }, 150);

        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendComment(postId);
                }
            }
        );
    }
}


/* =========================================
   LOAD COMMENTS
========================================= */

async function loadComments(postId) {

    const list =
        document.getElementById("commentsList");

    if (!list) return;

    if (!postId || postId === "undefined") {

        list.innerHTML = `
            <div class="comment-empty">
                ID postingan tidak ditemukan.
            </div>
        `;

        return;
    }

    const { data, error } = await db
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", {
            ascending: true
        });

    if (error) {

        console.error("LOAD COMMENT ERROR:", error);

        list.innerHTML = `
            <div class="comment-empty">
                Gagal memuat komentar.
            </div>
        `;

        return;
    }

    if (!data || data.length === 0) {

        list.innerHTML = `
            <div class="comment-empty">
                Belum ada komentar.<br>
                Jadilah yang pertama berkomentar.
            </div>
        `;

        return;
    }

    list.innerHTML = data.map(function (comment) {

        return `

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

        `;

    }).join("");
}


/* =========================================
   KIRIM KOMENTAR
========================================= */

async function sendComment(postId) {

    const input =
        document.getElementById("commentText");

    if (!input) return;

    if (!postId || postId === "undefined") {

        alert(
            "❌ ID postingan tidak ditemukan."
        );

        return;
    }

    const text =
        input.value.trim();

    if (!text) {

        input.focus();

        return;
    }

    const button =
        document.querySelector(
            "#commentBox .comment-input button"
        );

    if (button) {

        button.disabled = true;
        button.textContent = "Mengirim...";

    }

    try {

        const username =
            localStorage.getItem("pi_username") ||
            "User";

        console.log(
            "📤 Mengirim komentar:",
            {
                post_id: postId,
                username: username,
                comment: text
            }
        );

        const { error } = await db
            .from("comments")
            .insert({

                post_id: postId,

                username: username,

                comment: text

            });

        if (error) {

            console.error(
                "COMMENT ERROR:",
                error
            );

            alert(
                "❌ Komentar gagal dikirim\n\n" +
                error.message
            );

            return;
        }

        console.log(
            "✅ KOMENTAR BERHASIL"
        );

        input.value = "";

        await loadComments(postId);

    } catch (error) {

        console.error(
            "SYSTEM COMMENT ERROR:",
            error
        );

        alert(
            "❌ System error\n\n" +
            error.message
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent = "Kirim";

        }
    }
}


/* =========================================
   CLOSE KOMENTAR
========================================= */

function closeComments() {

    const box =
        document.getElementById("commentBox");

    if (box) {

        box.remove();

    }

    currentCommentPostId = null;
}


/* =========================================
   SHARE
========================================= */

async function sharePost(postId) {

    try {

        if (navigator.share) {

            await navigator.share({

                title: "CHUK AN CHUKK",

                text:
                    "Lihat postingan ini di Chuk an Chukk.",

                url: location.href

            });

        } else {

            alert(
                "Share tidak didukung oleh HP ini."
            );

        }

    } catch (error) {

        console.log("Share dibatalkan.");

    }
}


/* =========================================
   SAVE
========================================= */

function savePost(postId) {

    if (!postId) return;

    localStorage.setItem(
        "saved_" + postId,
        "true"
    );

    alert("🔖 Postingan disimpan.");

}


/* =========================================
   SEARCH
========================================= */

function searchPost() {

    alert(
        "🔍 Fitur pencarian segera hadir."
    );

}


/* =========================================
   NOTIFICATION
========================================= */

function showNotifications() {

    alert(
        "🔔 Belum ada notifikasi."
    );

}


/* =========================================
   MENU
========================================= */

function goHome() {

    location.href = "index.html";

}


function goChat() {

    alert(
        "💬 Chat segera hadir."
    );

}


function goProfile() {

    alert(
        "👤 Profile segera hadir."
    );

}


/* =========================================
   SECURITY
========================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text);

    return div.innerHTML;
}


/* =========================================
   READY
========================================= */

console.log(
    "🚀 CHUK AN CHUKK v5.0 READY"
);

console.log(
    "Supabase:",
    db ? "CONNECTED ✅" : "NOT CONNECTED ❌"
);
