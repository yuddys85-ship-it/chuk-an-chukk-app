/* ===================================
   CHUK AN CHUKK v5.1
   SOCIAL FEED + KOMENTAR
=================================== */

/* ===================================
   SUPABASE CLIENT
=================================== */

const db = window.chukSupabase;

if (!db) {
    console.error("❌ Supabase Client tidak ditemukan.");
}

/* ===================================
   LIKE
=================================== */

let likedPosts = new Set();

/* ===================================
   APP READY
=================================== */

document.addEventListener("DOMContentLoaded", () => {
    loadPosts();
});

/* ===================================
   LOAD POSTS
=================================== */

async function loadPosts() {

    const feed = document.getElementById("feed");

    if (!feed) return;

    if (!db) {
        feed.innerHTML = `
            <div class="empty-feed">
                ❌ Supabase belum terhubung.
            </div>
        `;
        return;
    }

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

    feed.innerHTML = "";

    if (!data || data.length === 0) {

        feed.innerHTML = `
            <div class="empty-feed">
                Belum ada postingan.
            </div>
        `;

        return;
    }

    data.forEach(post => {

        let media = "";

        if (post.media) {

            const isVideo =
                /\.(mp4|webm|mov|m4v)$/i
                .test(post.media);

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

                        <h3>
                            @${escapeHTML(
                                post.username ||
                                "ChukOfficial"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                post.caption || ""
                            )}
                        </p>

                    </div>

                    <div class="post-actions">

                        <button
                            type="button"
                            onclick="likePost('${post.id}', this)"
                            aria-label="Like">
                            ❤️
                        </button>

                        <button
                            type="button"
                            onclick="commentPost('${post.id}')"
                            aria-label="Komentar">
                            💬
                        </button>

                        <button
                            type="button"
                            onclick="sharePost('${post.id}')"
                            aria-label="Bagikan">
                            ↗️
                        </button>

                        <button
                            type="button"
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

/* ===================================
   LIKE POST
=================================== */

function likePost(postId, button) {

    if (likedPosts.has(postId)) {

        likedPosts.delete(postId);

        button.classList.remove("liked");

    } else {

        likedPosts.add(postId);

        button.classList.add("liked");
    }
}

/* ===================================
   BUKA KOMENTAR
=================================== */

function commentPost(postId) {

    const oldBox =
        document.getElementById("commentBox");

    if (oldBox) {
        oldBox.remove();
    }

    const box =
        document.createElement("div");

    box.id = "commentBox";
    box.className = "comment-box";

    box.innerHTML = `

        <div class="comment-panel">

            <div class="comment-header">

                <strong>
                    💬 Komentar
                </strong>

                <button
                    type="button"
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

            <form
                class="comment-input"
                onsubmit="
                    event.preventDefault();
                    sendComment('${postId}');
                ">

                <input
                    id="commentText"
                    type="text"
                    placeholder="Tulis komentar..."
                    maxlength="500"
                    autocomplete="off"
                    enterkeyhint="send">

                <button
                    type="submit">

                    Kirim

                </button>

            </form>

        </div>
    `;

    document.body.appendChild(box);

    loadComments(postId);

    setTimeout(() => {

        const input =
            document.getElementById(
                "commentText"
            );

        if (input) {
            input.focus();
        }

    }, 300);
}

/* ===================================
   LOAD COMMENTS
=================================== */

async function loadComments(postId) {

    const list =
        document.getElementById(
            "commentsList"
        );

    if (!list) return;

    if (!db) {

        list.innerHTML = `
            <div class="comment-empty">
                ❌ Supabase belum terhubung.
            </div>
        `;

        return;
    }

    const { data, error } =
        await db
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", {
            ascending: true
        });

    if (error) {

        console.error(
            "LOAD COMMENT ERROR:",
            error
        );

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

    list.innerHTML =
        data.map(comment => `

            <div class="comment-item">

                <div class="comment-avatar">
                    👤
                </div>

                <div class="comment-content">

                    <strong>
                        @${escapeHTML(
                            comment.username ||
                            "User"
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            comment.comment ||
                            ""
                        )}
                    </p>

                </div>

            </div>

        `).join("");
}

/* ===================================
   KIRIM KOMENTAR
=================================== */

async function sendComment(postId) {

    const input =
        document.getElementById(
            "commentText"
        );

    if (!input) return;

    const text =
        input.value.trim();

    if (!text) {

        input.focus();

        return;
    }

    if (!db) {

        alert(
            "❌ Supabase belum terhubung."
        );

        return;
    }

    const button =
        document.querySelector(
            "#commentBox .comment-input button"
        );

    if (button) {

        button.disabled = true;
        button.textContent =
            "Mengirim...";

    }

    try {

        const username =
            localStorage.getItem(
                "pi_username"
            ) || "User";

        console.log(
            "📤 Mengirim komentar:",
            {
                post_id: postId,
                username: username,
                comment: text
            }
        );

        const { data, error } =
            await db
            .from("comments")
            .insert([{

                post_id: postId,

                username: username,

                comment: text

            }])
            .select();

        if (error) {

            console.error(
                "❌ COMMENT ERROR:",
                error
            );

            alert(
                "❌ Komentar gagal dikirim\n\n" +
                error.message
            );

            return;
        }

        console.log(
            "✅ KOMENTAR BERHASIL:",
            data
        );

        input.value = "";

        await loadComments(postId);

    } catch (error) {

        console.error(
            "❌ SYSTEM COMMENT ERROR:",
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

/* ===================================
   TUTUP KOMENTAR
=================================== */

function closeComments() {

    const box =
        document.getElementById(
            "commentBox"
        );

    if (box) {
        box.remove();
    }
}

/* ===================================
   SHARE
=================================== */

async function sharePost(postId) {

    if (navigator.share) {

        try {

            await navigator.share({

                title:
                    "CHUK AN CHUKK",

                text:
                    "Lihat postingan ini di Chuk an Chukk.",

                url:
                    location.href

            });

        } catch (error) {

            console.log(
                "Share dibatalkan."
            );

        }

    } else {

        alert(
            "Share tidak didukung oleh HP ini."
        );
    }
}

/* ===================================
   SAVE
=================================== */

function savePost(postId) {

    localStorage.setItem(
        "saved_" + postId,
        "true"
    );

    alert(
        "🔖 Postingan disimpan."
    );
}

/* ===================================
   SEARCH
=================================== */

function searchPost() {

    alert(
        "🔍 Fitur pencarian segera hadir."
    );
}

/* ===================================
   NOTIFICATION
=================================== */

function showNotifications() {

    alert(
        "🔔 Belum ada notifikasi."
    );
}

/* ===================================
   MENU
=================================== */

function goHome() {

    location.href =
        "index.html";
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

/* ===================================
   SECURITY
=================================== */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(text);

    return div.innerHTML;
}

/* ===================================
   READY
=================================== */

console.log(
    "🚀 CHUK AN CHUKK v5.1 READY"
);
console.log(
    "🗄️ Database client:",
    !!db
);
