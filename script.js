/* =========================================
   CHUK AN CHUKK v5.0
   SOCIAL FEED + KOMENTAR FIX
========================================= */

let likedPosts = new Set();

/* =========================================
   APP READY
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadPosts();
});

/* =========================================
   LOAD POSTS
========================================= */

async function loadPosts() {

    const feed = document.getElementById("feed");

    if (!feed) return;

    const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {

        console.error("LOAD POSTS ERROR:", error);

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

        /* ===============================
           PASTIKAN ID POST ADA
        =============================== */

        if (
            post.id === undefined ||
            post.id === null
        ) {
            console.error(
                "POST TANPA ID:",
                post
            );
            return;
        }

        const postId = String(post.id);

        /* ===============================
           MEDIA
        =============================== */

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

        /* ===============================
           POST
        =============================== */

        feed.innerHTML += `

            <article
                class="post"
                data-post-id="${postId}">

                ${media}

                <div class="gradient"></div>

                <div class="post-overlay">

                    <div class="post-info">

                        <h3>
                            @ChukOfficial
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
                            onclick="likePost('${postId}', this)"
                            aria-label="Like">
                            ❤️
                        </button>

                        <button
                            type="button"
                            onclick="commentPost('${postId}')"
                            aria-label="Komentar">
                            💬
                        </button>

                        <button
                            type="button"
                            onclick="sharePost('${postId}')"
                            aria-label="Bagikan">
                            ↗️
                        </button>

                        <button
                            type="button"
                            onclick="savePost('${postId}')"
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

    if (!postId) return;

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

    console.log(
        "COMMENT POST ID:",
        postId
    );

    /* ===============================
       CEK ID
    =============================== */

    if (
        postId === undefined ||
        postId === null ||
        postId === "" ||
        postId === "undefined"
    ) {

        alert(
            "❌ ID postingan tidak ditemukan."
        );

        console.error(
            "postId tidak ditemukan:",
            postId
        );

        return;
    }

    /* Karena post_id di database bigint */
    if (!/^\d+$/.test(String(postId))) {

        alert(
            "❌ ID postingan tidak valid: " +
            postId
        );

        console.error(
            "ID post bukan bigint:",
            postId
        );

        return;
    }

    /* Hapus komentar lama */
    const oldBox =
        document.getElementById("commentBox");

    if (oldBox) {
        oldBox.remove();
    }

    /* ===============================
       BUAT COMMENT BOX
    =============================== */

    const box =
        document.createElement("div");

    box.id = "commentBox";

    box.innerHTML = `

        <div class="comment-panel">

            <div class="comment-header">

                <strong>
                    Komentar
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

            <div class="comment-input">

                <input
                    id="commentText"
                    type="text"
                    placeholder="Tulis komentar..."
                    autocomplete="off"
                    enterkeyhint="send">

                <button
                    id="sendCommentButton"
                    type="button">
                    Kirim
                </button>

            </div>

        </div>

    `;

    document.body.appendChild(box);

    /* ===============================
       SIMPAN ID PADA BOX
    =============================== */

    box.dataset.postId =
        String(postId);

    /* ===============================
       BUTTON KIRIM
    =============================== */

    const sendButton =
        document.getElementById(
            "sendCommentButton"
        );

    if (sendButton) {

        sendButton.onclick = function () {

            sendComment(
                String(postId)
            );

        };
    }

    /* ===============================
       ENTER UNTUK KIRIM
    =============================== */

    const input =
        document.getElementById(
            "commentText"
        );

    if (input) {

        input.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    sendComment(
                        String(postId)
                    );
                }
            }
        );

        setTimeout(() => {
            input.focus();
        }, 150);
    }

    /* ===============================
       LOAD KOMENTAR
    =============================== */

    await loadComments(
        String(postId)
    );
}

/* =========================================
   LOAD COMMENTS
========================================= */

async function loadComments(postId) {

    const list =
        document.getElementById(
            "commentsList"
        );

    if (!list) return;

    if (
        !postId ||
        postId === "undefined"
    ) {

        list.innerHTML = `
            <div class="comment-empty">
                ID postingan tidak ditemukan.
            </div>
        `;

        return;
    }

    console.log(
        "LOAD COMMENTS POST ID:",
        postId
    );

    const { data, error } =
        await supabase
            .from("comments")
            .select("*")
            .eq(
                "post_id",
                String(postId)
            )
            .order(
                "created_at",
                { ascending: true }
            );

    if (error) {

        console.error(
            "LOAD COMMENTS ERROR:",
            error
        );

        list.innerHTML = `
            <div class="comment-empty">
                Gagal memuat komentar.
            </div>
        `;

        return;
    }

    if (
        !data ||
        data.length === 0
    ) {

        list.innerHTML = `
            <div class="comment-empty">
                Belum ada komentar.<br>
                Jadilah yang pertama berkomentar.
            </div>
        `;

        return;
    }

    list.innerHTML =
        data.map(comment => {

            return `

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

            `;

        }).join("");
}

/* =========================================
   SEND COMMENT
========================================= */

async function sendComment(postId) {

    console.log(
        "SEND COMMENT POST ID:",
        postId
    );

    /* ===============================
       CEK ID
    =============================== */

    if (
        postId === undefined ||
        postId === null ||
        postId === "" ||
        postId === "undefined"
    ) {

        alert(
            "❌ ID postingan tidak ditemukan."
        );

        return;
    }

    /* post_id harus BIGINT */
    if (!/^\d+$/.test(String(postId))) {

        alert(
            "❌ ID postingan tidak valid."
        );

        console.error(
            "POST ID INVALID:",
            postId
        );

        return;
    }

    const input =
        document.getElementById(
            "commentText"
        );

    if (!input) {

        alert(
            "❌ Kolom komentar tidak ditemukan."
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
        document.getElementById(
            "sendCommentButton"
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
            ) ||
            "User";

        console.log(
            "DATA KOMENTAR:",
            {
                post_id: postId,
                username: username,
                comment: text
            }
        );

        /* ===============================
           INSERT KE SUPABASE
        =============================== */

        const { data, error } =
            await supabase
                .from("comments")
                .insert({

                    post_id:
                        Number(postId),

                    username:
                        username,

                    comment:
                        text

                })
                .select();

        if (error) {

            console.error(
                "SUPABASE COMMENT ERROR:",
                error
            );

            alert(
                "❌ Komentar gagal dikirim\n\n" +
                error.message
            );

            return;
        }

        console.log(
            "KOMENTAR BERHASIL:",
            data
        );

        /* ===============================
           KOSONGKAN INPUT
        =============================== */

        input.value = "";

        /* ===============================
           TAMPILKAN KOMENTAR BARU
        =============================== */

        await loadComments(
            String(postId)
        );

    } catch (err) {

        console.error(
            "SYSTEM COMMENT ERROR:",
            err
        );

        alert(
            "❌ System error\n\n" +
            err.message
        );

    } finally {

        if (button) {

            button.disabled = false;
            button.textContent =
                "Kirim";
        }
    }
}

/* =========================================
   CLOSE COMMENTS
========================================= */

function closeComments() {

    const box =
        document.getElementById(
            "commentBox"
        );

    if (box) {

        box.remove();
    }
}

/* =========================================
   SHARE
========================================= */

async function sharePost(postId) {

    if (navigator.share) {

        try {

            await navigator.share({

                title:
                    "CHUK AN CHUKK",

                text:
                    "Lihat postingan ini di Chuk an Chukk.",

                url:
                    location.href +
                    "?post=" +
                    encodeURIComponent(
                        postId
                    )

            });

        } catch (e) {

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

/* =========================================
   SAVE
========================================= */

function savePost(postId) {

    localStorage.setItem(
        "saved_" + postId,
        "true"
    );

    alert(
        "🔖 Postingan disimpan."
    );
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
