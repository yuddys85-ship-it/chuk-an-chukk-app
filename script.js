/* =========================================================
   CHUK AN CHUKK
   SCRIPT.JS
   SOCIAL FEED VERSION
   ========================================================= */

let likedPosts = new Set();

let commentCounts = {};

let shareCounts = {};

let savedPosts = new Set();


/* =========================================================
   START
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 CHUK AN CHUKK SOCIAL FEED START");

    if (!window.supabase) {

        console.error(
            "❌ Supabase Client tidak ditemukan"
        );

        const feed = document.getElementById("feed");

        if (feed) {
            feed.innerHTML = `
                <div class="empty-feed">
                    ❌ Supabase tidak terhubung.
                </div>
            `;
        }

        return;
    }


    loadSavedLikes();

    loadSavedPosts();

    loadShareCounts();

    loadPosts();

});


/* =========================================================
   UUID VALIDATOR
   ========================================================= */

function isValidUUID(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return false;
    }

    const uuid = String(value).trim();

    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

}


/* =========================================================
   LIKE STORAGE
   ========================================================= */

function loadSavedLikes() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "chuk_liked_posts"
                ) || "[]"
            );

        if (Array.isArray(saved)) {

            likedPosts =
                new Set(
                    saved.map(item =>
                        String(item)
                    )
                );

        }

    } catch (error) {

        console.error(
            "❌ Gagal membaca like:",
            error
        );

    }

}


function saveLikes() {

    try {

        localStorage.setItem(
            "chuk_liked_posts",
            JSON.stringify(
                Array.from(likedPosts)
            )
        );

    } catch (error) {

        console.error(
            "❌ Gagal menyimpan like:",
            error
        );

    }

}


/* =========================================================
   SAVED POSTS
   ========================================================= */

function loadSavedPosts() {

    try {

        const saved = [];

        for (
            let i = 0;
            i < localStorage.length;
            i++
        ) {

            const key =
                localStorage.key(i);

            if (
                key &&
                key.startsWith("saved_")
            ) {

                saved.push(
                    key.replace(
                        "saved_",
                        ""
                    )
                );

            }

        }

        savedPosts =
            new Set(saved);

    } catch (error) {

        console.error(
            "❌ Gagal membaca saved posts:",
            error
        );

    }

}


/* =========================================================
   SHARE COUNTS
   ========================================================= */

function loadShareCounts() {

    try {

        const saved =
            JSON.parse(
                localStorage.getItem(
                    "chuk_share_counts"
                ) || "{}"
            );

        if (
            saved &&
            typeof saved === "object"
        ) {

            shareCounts = saved;

        }

    } catch (error) {

        console.error(
            "❌ Gagal membaca share count:",
            error
        );

    }

}


function saveShareCounts() {

    try {

        localStorage.setItem(
            "chuk_share_counts",
            JSON.stringify(
                shareCounts
            )
        );

    } catch (error) {

        console.error(
            "❌ Gagal menyimpan share count:",
            error
        );

    }

}


/* =========================================================
   LOAD POSTS
   ========================================================= */

async function loadPosts() {

    const feed =
        document.getElementById("feed");


    if (!feed) {

        console.error(
            "❌ Element #feed tidak ditemukan"
        );

        return;
    }


    feed.innerHTML = `
        <div class="empty-feed">
            ⏳ Memuat postingan...
        </div>
    `;


    try {

        /*
        ==========================================
        AMBIL POSTINGAN
        ==========================================
        */

        const {
            data,
            error
        } = await supabase
            .from("posts")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "❌ LOAD POSTS ERROR:",
                error
            );

            feed.innerHTML = `
                <div class="empty-feed">
                    ❌ Gagal memuat postingan.
                    <br><br>
                    ${escapeHTML(
                        error.message
                    )}
                </div>
            `;

            return;
        }


        /*
        ==========================================
        POST KOSONG
        ==========================================
        */

        if (
            !data ||
            data.length === 0
        ) {

            feed.innerHTML = `
                <div class="empty-feed">
                    📭 Belum ada postingan.
                    <br><br>
                    Jadilah yang pertama membuat postingan.
                </div>
            `;

            return;
        }


        /*
        ==========================================
        HITUNG KOMENTAR
        ==========================================
        */

        await loadCommentCounts();


        /*
        ==========================================
        RENDER
        ==========================================
        */

        feed.innerHTML = "";


        data.forEach(post => {

            if (
                !post.id ||
                !isValidUUID(post.id)
            ) {

                console.error(
                    "❌ POST ID INVALID:",
                    post
                );

                return;
            }


            const postId =
                String(post.id).trim();


            const isLiked =
                likedPosts.has(postId);


            const isSaved =
                savedPosts.has(postId);


            /*
            ======================================
            USERNAME
            ======================================
            */

            const username =
                post.username ||
                post.user_name ||
                post.author ||
                "ChukOfficial";


            /*
            ======================================
            CAPTION
            ======================================
            */

            const caption =
                post.caption || "";


            /*
            ======================================
            WAKTU
            ======================================
            */

            const timeText =
                formatPostTime(
                    post.created_at
                );


            /*
            ======================================
            MEDIA
            ======================================
            */

            let media = "";


            if (post.media) {

                const mediaUrl =
                    String(post.media);


                const isVideo =
                    /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(
                        mediaUrl
                    );


                if (isVideo) {

                    media = `
                        <div
                            class="video-wrapper"
                        >

                            <video
                                id="video-${escapeHTML(postId)}"
                                class="post-image"
                                src="${escapeHTML(mediaUrl)}"
                                autoplay
                                muted
                                loop
                                playsinline
                                preload="metadata"
                            ></video>


                            <button
                                type="button"
                                class="sound-button"
                                data-sound-post="${escapeHTML(postId)}"
                                onclick="toggleVideoSound('${escapeJS(postId)}')"
                                aria-label="Suara video"
                            >
                                🔇
                            </button>

                        </div>
                    `;

                } else {

                    media = `
                        <img
                            class="post-image"
                            src="${escapeHTML(mediaUrl)}"
                            alt="Postingan"
                            loading="lazy"
                        >
                    `;

                }

            }


            /*
            ======================================
            JUMLAH KOMENTAR
            ======================================
            */

            const commentCount =
                commentCounts[postId] || 0;


            /*
            ======================================
            JUMLAH SHARE
            ======================================
            */

            const shareCount =
                getShareCount(
                    post,
                    postId
                );


            /*
            ======================================
            JUMLAH LIKE
            ======================================
            */

            const likeCount =
                getLikeCount(
                    post,
                    postId
                );


            /*
            ======================================
            CARD POST
            ======================================
            */

            feed.innerHTML += `

                <article
                    class="post"
                    data-post-id="${escapeHTML(postId)}"
                >

                    <!-- =========================
                         POST HEADER + CAPTION
                         ========================= -->

                    <div class="post-overlay">

                        <div class="post-info">

                            <div
                                class="post-user"
                                style="
                                    display:flex;
                                    align-items:center;
                                    gap:10px;
                                    margin-bottom:8px;
                                "
                            >

                                <div
                                    class="post-avatar"
                                    style="
                                        width:42px;
                                        height:42px;
                                        min-width:42px;
                                        border-radius:50%;
                                        background:#e4e6eb;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        font-size:21px;
                                    "
                                >
                                    👤
                                </div>


                                <div>

                                    <h3>
                                        @${escapeHTML(username)}
                                    </h3>

                                    <div
                                        style="
                                            color:#65676b;
                                            font-size:12px;
                                            margin-top:2px;
                                        "
                                    >
                                        ${escapeHTML(timeText)}
                                        · 🌐
                                    </div>

                                </div>

                            </div>


                            ${
                                caption
                                ? `
                                    <p>
                                        ${escapeHTML(caption)}
                                    </p>
                                `
                                : ""
                            }

                        </div>

                    </div>


                    <!-- =========================
                         MEDIA
                         ========================= -->

                    ${media}


                    <!-- =========================
                         STATISTICS
                         ========================= -->

                    <div
                        class="post-stats"
                        style="
                            width:100%;
                            min-height:42px;
                            padding:8px 14px;
                            display:flex;
                            align-items:center;
                            justify-content:space-between;
                            gap:10px;
                            background:#fff;
                            color:#65676b;
                            font-size:14px;
                            border-bottom:1px solid #eee;
                        "
                    >

                        <span>
                            👍 ${likeCount}
                        </span>

                        <span
                            style="
                                margin-left:auto;
                            "
                        >
                            ${commentCount}
                            komentar
                            &nbsp;&nbsp;
                            ${shareCount}
                            dibagikan
                        </span>

                    </div>


                    <!-- =========================
                         ACTION BUTTONS
                         ========================= -->

                    <div class="post-actions">

                        <button
                            type="button"
                            class="${isLiked ? "liked" : ""}"
                            onclick="likePost(
                                '${escapeJS(postId)}',
                                this
                            )"
                            aria-label="Suka"
                        >
                            ${isLiked ? "❤️" : "👍"}
                            <span>Suka</span>
                        </button>


                        <button
                            type="button"
                            onclick="commentPost(
                                '${escapeJS(postId)}'
                            )"
                            aria-label="Komentar"
                        >
                            💬
                            <span>Komentar</span>
                        </button>


                        <button
                            type="button"
                            onclick="sharePost(
                                '${escapeJS(postId)}'
                            )"
                            aria-label="Bagikan"
                        >
                            ↗️
                            <span>Bagikan</span>
                        </button>


                        <button
                            type="button"
                            onclick="savePost(
                                '${escapeJS(postId)}'
                            )"
                            aria-label="Simpan"
                        >
                            ${isSaved ? "🔖" : "🔖"}
                            <span>Simpan</span>
                        </button>

                    </div>

                </article>

            `;

        });


    } catch (error) {

        console.error(
            "❌ SYSTEM LOAD POSTS:",
            error
        );


        feed.innerHTML = `
            <div class="empty-feed">
                ❌ System error.
                <br><br>
                ${escapeHTML(
                    error.message
                )}
            </div>
        `;

    }

}


/* =========================================================
   COMMENT COUNTS
   ========================================================= */

async function loadCommentCounts() {

    commentCounts = {};


    try {

        const {
            data,
            error
        } = await supabase
            .from("comments")
            .select("post_id");


        if (error) {

            console.warn(
                "⚠️ Comment count tidak tersedia:",
                error.message
            );

            return;
        }


        if (!data) return;


        data.forEach(row => {

            if (!row.post_id) return;


            const id =
                String(row.post_id).trim();


            commentCounts[id] =
                (commentCounts[id] || 0) + 1;

        });


    } catch (error) {

        console.warn(
            "⚠️ Gagal menghitung komentar:",
            error
        );

    }

}


/* =========================================================
   LIKE COUNT
   ========================================================= */

function getLikeCount(
    post,
    postId
) {

    /*
    Jika database nanti punya kolom:
    likes / like_count / likes_count
    otomatis akan digunakan.
    */

    const value =
        post.like_count ??
        post.likes_count ??
        post.likes;


    if (
        typeof value === "number"
    ) {

        return value;

    }


    /*
    Untuk sementara:
    like lokal user = 1
    */

    return likedPosts.has(postId)
        ? 1
        : 0;

}


/* =========================================================
   SHARE COUNT
   ========================================================= */

function getShareCount(
    post,
    postId
) {

    const databaseValue =
        post.share_count ??
        post.shares_count ??
        post.shares;


    if (
        typeof databaseValue === "number"
    ) {

        return databaseValue;

    }


    return Number(
        shareCounts[postId] || 0
    );

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatPostTime(
    createdAt
) {

    if (!createdAt) {

        return "Baru saja";

    }


    const date =
        new Date(createdAt);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Baru saja";

    }


    const now =
        new Date();


    const diff =
        Math.floor(
            (
                now.getTime() -
                date.getTime()
            ) / 1000
        );


    if (diff < 60) {

        return "Baru saja";

    }


    if (diff < 3600) {

        return (
            Math.floor(
                diff / 60
            ) +
            " mnt"
        );

    }


    if (diff < 86400) {

        return (
            Math.floor(
                diff / 3600
            ) +
            " jam"
        );

    }


    if (diff < 604800) {

        return (
            Math.floor(
                diff / 86400
            ) +
            " hari"
        );

    }


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   LIKE
   ========================================================= */

function likePost(
    postId,
    button
) {

    if (
        !isValidUUID(postId)
    ) {

        console.error(
            "❌ LIKE UUID INVALID:",
            postId
        );

        return;
    }


    const uuid =
        String(postId).trim();


    if (
        likedPosts.has(uuid)
    ) {

        likedPosts.delete(uuid);


        if (button) {

            button.classList.remove(
                "liked"
            );

            button.innerHTML =
                "👍 <span>Suka</span>";

        }


        console.log(
            "💔 LIKE DIBATALKAN:",
            uuid
        );


    } else {

        likedPosts.add(uuid);


        if (button) {

            button.classList.add(
                "liked"
            );

            button.innerHTML =
                "❤️ <span>Suka</span>";

        }


        console.log(
            "❤️ POST DISUKAI:",
            uuid
        );

    }


    saveLikes();


    /*
    Update statistik tanpa reload
    */

    updatePostLikeStat(
        uuid
    );

}


/* =========================================================
   UPDATE LIKE STAT
   ========================================================= */

function updatePostLikeStat(
    postId
) {

    const post =
        document.querySelector(
            `.post[data-post-id="${postId}"]`
        );


    if (!post) return;


    const stats =
        post.querySelector(
            ".post-stats"
        );


    if (!stats) return;


    const count =
        likedPosts.has(postId)
            ? 1
            : 0;


    const spans =
        stats.querySelectorAll(
            "span"
        );


    if (spans[0]) {

        spans[0].textContent =
            "👍 " + count;

    }

}


/* =========================================================
   VIDEO SOUND
   ========================================================= */

async function toggleVideoSound(
    postId
) {

    console.log(
        "🔊 SOUND BUTTON:",
        postId
    );


    if (
        !isValidUUID(postId)
    ) {

        console.error(
            "❌ UUID VIDEO INVALID:",
            postId
        );

        return;
    }


    const video =
        document.getElementById(
            "video-" + postId
        );


    if (!video) {

        console.error(
            "❌ VIDEO TIDAK DITEMUKAN:",
            postId
        );

        return;
    }


    const button =
        document.querySelector(
            `[data-sound-post="${postId}"]`
        );


    try {

        if (video.muted) {

            video.muted = false;

            video.volume = 1.0;

            await video.play();


            if (button) {

                button.textContent =
                    "🔊";

            }


            console.log(
                "🔊 SUARA VIDEO ON"
            );


        } else {

            video.muted = true;


            if (button) {

                button.textContent =
                    "🔇";

            }


            console.log(
                "🔇 SUARA VIDEO OFF"
            );

        }


    } catch (error) {

        console.error(
            "❌ VIDEO SOUND ERROR:",
            error
        );


        alert(
            "⚠️ Suara video belum bisa diaktifkan.\n\n" +
            "Coba tekan tombol 🔊 sekali lagi."
        );

    }

}


/* =========================================================
   COMMENTS
   ========================================================= */

async function commentPost(
    postId
) {

    if (
        !isValidUUID(postId)
    ) {

        alert(
            "❌ ID postingan tidak valid:\n\n" +
            postId
        );

        return;
    }


    const uuid =
        String(postId).trim();


    const oldBox =
        document.getElementById(
            "commentBox"
        );


    if (oldBox) {

        oldBox.remove();

    }


    const box =
        document.createElement(
            "div"
        );


    box.id =
        "commentBox";


    box.dataset.postId =
        uuid;


    box.innerHTML = `

        <div class="comment-panel">

            <div class="comment-header">

                <strong>
                    Komentar
                </strong>

                <button
                    type="button"
                    class="comment-close"
                    onclick="closeComments()"
                >
                    ✕
                </button>

            </div>


            <div
                id="commentsList"
                class="comments-list"
            >

                <div class="comment-loading">
                    ⏳ Memuat komentar...
                </div>

            </div>


            <div class="comment-input">

                <input
                    id="commentText"
                    type="text"
                    placeholder="Tulis komentar..."
                    autocomplete="off"
                    enterkeyhint="send"
                >


                <button
                    id="sendCommentButton"
                    type="button"
                >
                    Kirim
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        box
    );


    const sendButton =
        document.getElementById(
            "sendCommentButton"
        );


    if (sendButton) {

        sendButton.onclick =
            function () {

                sendComment(
                    uuid
                );

            };

    }


    const input =
        document.getElementById(
            "commentText"
        );


    if (input) {

        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    sendComment(
                        uuid
                    );

                }

            }
        );


        setTimeout(
            () => input.focus(),
            150
        );

    }


    await loadComments(
        uuid
    );

}


/* =========================================================
   LOAD COMMENTS
   ========================================================= */

async function loadComments(
    postId
) {

    const list =
        document.getElementById(
            "commentsList"
        );


    if (!list) return;


    if (
        !isValidUUID(postId)
    ) {

        list.innerHTML = `
            <div class="comment-empty">
                ❌ ID postingan tidak valid.
            </div>
        `;

        return;
    }


    const uuid =
        String(postId).trim();


    try {

        const {
            data,
            error
        } = await supabase
            .from("comments")
            .select("*")
            .eq(
                "post_id",
                uuid
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "❌ LOAD COMMENTS ERROR:",
                error
            );


            list.innerHTML = `
                <div class="comment-empty">
                    ❌ Gagal memuat komentar.
                    <br><br>
                    ${escapeHTML(
                        error.message
                    )}
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
                    💬 Belum ada komentar.
                    <br>
                    Jadilah yang pertama berkomentar.
                </div>
            `;

            return;
        }


        list.innerHTML =
            data.map(
                comment => `

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

                `
            ).join("");


    } catch (error) {

        console.error(
            "❌ SYSTEM LOAD COMMENTS:",
            error
        );

    }

}


/* =========================================================
   SEND COMMENT
   ========================================================= */

async function sendComment(
    postId
) {

    console.log(
        "📤 SEND COMMENT:",
        postId
    );


    if (
        !isValidUUID(postId)
    ) {

        alert(
            "❌ ID postingan tidak valid:\n\n" +
            postId
        );

        return;
    }


    const uuid =
        String(postId).trim();


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
            localStorage.getItem(
                "username"
            ) ||
            "User";


        const {
            data,
            error
        } = await supabase
            .from("comments")
            .insert([
                {
                    post_id: uuid,
                    username:
                        String(username).trim(),
                    comment: text
                }
            ])
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


        /*
        Update jumlah komentar
        */

        commentCounts[uuid] =
            (
                commentCounts[uuid] ||
                0
            ) + 1;


        updatePostCommentStat(
            uuid
        );


        await loadComments(
            uuid
        );


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

            button.textContent =
                "Kirim";

        }

    }

}


/* =========================================================
   UPDATE COMMENT STAT
   ========================================================= */

function updatePostCommentStat(
    postId
) {

    const post =
        document.querySelector(
            `.post[data-post-id="${postId}"]`
        );


    if (!post) return;


    const stats =
        post.querySelector(
            ".post-stats"
        );


    if (!stats) return;


    const spans =
        stats.querySelectorAll(
            "span"
        );


    if (
        spans.length < 2
    ) {
        return;
    }


    const commentCount =
        commentCounts[postId] || 0;


    const shareCount =
        shareCounts[postId] || 0;


    spans[1].textContent =
        `${commentCount} komentar    ${shareCount} dibagikan`;

}


/* =========================================================
   SHARE
   ========================================================= */

async function sharePost(
    postId
) {

    if (
        !isValidUUID(postId)
    ) {

        console.error(
            "❌ SHARE UUID INVALID:",
            postId
        );

        return;
    }


    const shareUrl =
        location.origin +
        location.pathname +
        "?post=" +
        encodeURIComponent(
            postId
        );


    try {

        if (
            navigator.share
        ) {

            await navigator.share({

                title:
                    "CHUK AN CHUKK",

                text:
                    "Lihat postingan ini di CHUK AN CHUKK.",

                url:
                    shareUrl

            });


        } else {

            const copied =
                await copyToClipboard(
                    shareUrl
                );


            if (copied) {

                alert(
                    "🔗 Link postingan berhasil disalin."
                );

            }

        }


        /*
        Tambah share count
        */

        shareCounts[postId] =
            Number(
                shareCounts[postId] ||
                0
            ) + 1;


        saveShareCounts();


        updatePostShareStat(
            postId
        );


        console.log(
            "✅ SHARE BERHASIL"
        );


    } catch (error) {

        console.log(
            "Share dibatalkan:",
            error
        );

    }

}


/* =========================================================
   UPDATE SHARE STAT
   ========================================================= */

function updatePostShareStat(
    postId
) {

    const post =
        document.querySelector(
            `.post[data-post-id="${postId}"]`
        );


    if (!post) return;


    const stats =
        post.querySelector(
            ".post-stats"
        );


    if (!stats) return;


    const spans =
        stats.querySelectorAll(
            "span"
        );


    if (
        spans.length < 2
    ) {
        return;
    }


    const comments =
        commentCounts[postId] ||
        0;


    const shares =
        shareCounts[postId] ||
        0;


    spans[1].textContent =
        `${comments} komentar    ${shares} dibagikan`;

}


/* =========================================================
   COPY CLIPBOARD
   ========================================================= */

async function copyToClipboard(
    text
) {

    try {

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                text
            );

            return true;

        }


        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            text;


        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";


        document.body.appendChild(
            textarea
        );


        textarea.focus();

        textarea.select();


        const success =
            document.execCommand(
                "copy"
            );


        textarea.remove();


        return success;


    } catch (error) {

        console.error(
            "❌ COPY ERROR:",
            error
        );

        return false;

    }

}


/* =========================================================
   SAVE POST
   ========================================================= */

function savePost(
    postId
) {

    if (
        !isValidUUID(postId)
    ) {

        console.error(
            "❌ SAVE UUID INVALID:",
            postId
        );

        return;
    }


    const key =
        "saved_" + postId;


    localStorage.setItem(
        key,
        "true"
    );


    savedPosts.add(
        postId
    );


    alert(
        "🔖 Postingan disimpan."
    );


    console.log(
        "🔖 POST DISIMPAN:",
        postId
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

function searchPost() {

    alert(
        "🔍 Fitur pencarian segera hadir."
    );

}


/* =========================================================
   NOTIFICATION
   ========================================================= */

function showNotifications() {

    alert(
        "🔔 Belum ada notifikasi."
    );

}


/* =========================================================
   HOME
   ========================================================= */

function goHome() {

    location.href =
        "index.html";

}


/* =========================================================
   CHAT
   ========================================================= */

function goChat() {

    alert(
        "💬 Chat segera hadir."
    );

}

/* =========================================================
   PROFILE
   ========================================================= */

async function loginWithPi() {

    const status =
        document.getElementById("piLoginStatus");

    const button =
        document.getElementById("piLoginButton");

    try {

        if (!status || !button) {

            throw new Error(
                "Elemen tombol login tidak ditemukan."
            );

        }

        status.textContent =
            "Menghubungkan ke Pi...";

        button.disabled = true;

        /* =========================================
           CEK PI SDK
        ========================================= */

        console.log(
            "🔵 LOGIN: cek window.Pi..."
        );

        if (
            typeof window.Pi === "undefined"
        ) {

            throw new Error(
                "Pi SDK tidak tersedia."
            );

        }

        console.log(
            "🟢 LOGIN: window.Pi tersedia"
        );

        console.log(
            "Pi object:",
            window.Pi
        );


        /* =========================================
           PI AUTHENTICATE
        ========================================= */

        console.log(
            "🟡 PI AUTHENTICATE: mulai..."
        );

        const authPromise =
            window.Pi.authenticate(
                ["username"],
                function (incompletePayment) {

                    console.log(
                        "⚠️ INCOMPLETE PAYMENT:",
                        incompletePayment
                    );

                }
            );


        console.log(
            "🟡 PI AUTHENTICATE: menunggu respons Pi..."
        );


        /* =========================================
           TIMEOUT DIAGNOSTIK
        ========================================= */

        const authTimeout =
            new Promise(
                (_, reject) => {

                    setTimeout(
                        () => {

                            reject(
                                new Error(
                                    "⏱️ Timeout: Pi.authenticate() tidak memberikan respons dalam 30 detik."
                                )
                            );

                        },
                        30000
                    );

                }
            );


        const auth =
            await Promise.race([
                authPromise,
                authTimeout
            ]);


        /* =========================================
           AUTH BERHASIL
        ========================================= */

        console.log(
            "🟢 PI AUTHENTICATE: berhasil!",
            auth
        );


        if (!auth) {

            throw new Error(
                "Pi tidak mengembalikan data login."
            );

        }


        const accessToken =
            auth.accessToken;


        if (!accessToken) {

            throw new Error(
                "Pi tidak memberikan accessToken."
            );

        }


        console.log(
            "🟢 Access token Pi diterima."
        );


        /* =========================================
           VERIFIKASI BACKEND
        ========================================= */

        status.textContent =
            "Memverifikasi akun Pi...";


        const verifyResponse =
            await fetch(
                "/api/verify",
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${accessToken}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const verified =
            await verifyResponse.json();


        if (
            !verifyResponse.ok ||
            !verified.success
        ) {

            throw new Error(
                verified.error ||
                "Verifikasi akun Pi gagal."
            );

        }


        console.log(
            "🟢 Pi user terverifikasi:",
            verified.user
        );


        /* =========================================
           SIMPAN USER
        ========================================= */

        piLoginUser =
            verified.user;

        window.currentUser =
            verified.user;


        localStorage.setItem(
            "currentUser",
            JSON.stringify(
                verified.user
            )
        );


        sessionStorage.setItem(
            "piAuthenticated",
            "true"
        );


        status.textContent =
            `Login berhasil sebagai @${verified.user.username}`;


        /* =========================================
           MASUK APLIKASI
        ========================================= */

        showChukApp();


    } catch (error) {

        console.error(
            "❌ Pi login error:",
            error
        );


        status.textContent =
            error.message ||
            "Login Pi gagal. Coba lagi.";


        button.disabled = false;

    }

}

/* =========================================================
   CHUK PROFILE — HOME
   ========================================================= */

async function loadCurrentChukProfile() {

    try {

        const piUser =
            window.currentUser ||
            JSON.parse(
                localStorage.getItem("currentUser") || "null"
            );

        if (!piUser) {

            console.log(
                "ℹ️ User Pi belum login"
            );

            return null;
        }

        const piUserId =
            piUser.uid ||
            piUser.userId ||
            piUser.id;

        if (!piUserId) {

            console.warn(
                "⚠️ Pi User ID tidak ditemukan"
            );

            return null;
        }

        const {
            data,
            error
        } = await supabase
            .from("profiles")
            .select(
                "id, pi_user_id, public_username, display_name, avatar_url, bio"
            )
            .eq(
                "pi_user_id",
                String(piUserId)
            )
            .maybeSingle();

        if (error) {

            console.error(
                "❌ PROFILE LOAD ERROR:",
                error
            );

            return null;
        }

        if (!data) {

            console.log(
                "ℹ️ Profil CHUK belum dibuat"
            );

            return null;
        }

        console.log(
            "✅ PROFIL CHUK DITEMUKAN:",
            data
        );

        return data;

    } catch (error) {

        console.error(
            "❌ PROFILE SYSTEM ERROR:",
            error
        );

        return null;
    }
}

/* =========================================================
   CLOSE COMMENTS
   ========================================================= */

function closeComments() {

    const box =
        document.getElementById(
            "commentBox"
        );


    if (box) {

        box.remove();

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


/* =========================================================
   ESCAPE JAVASCRIPT
   ========================================================= */

function escapeJS(
    text
) {

    return String(text)

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        )

        .replace(
            /\n/g,
            "\\n"
        )

        .replace(
            /\r/g,
            "\\r"
        );

}


/* =========================================================
   READY
   ========================================================= */

console.log(
    "✅ CHUK AN CHUKK SOCIAL FEED READY"
);

console.log(
    "💬 UUID COMMENTS: ON"
);

console.log(
    "❤️ LIKE: ON"
);

console.log(
    "↗️ SHARE: ON"
);

console.log(
    "🔖 SAVE: ON"
);

console.log(
    "🔊 VIDEO SOUND: ON"
);


/* -----------------------------------------------------
   INIT PI SDK
----------------------------------------------------- */

function initChukPi() {

    console.log("🔵 PI SDK CHECK MULAI");

    console.log(
        "window.Pi:",
        window.Pi
    );

    if (typeof window.Pi === "undefined") {

        console.error(
            "❌ PI SDK TIDAK TERSEDIA"
        );

        setPiLoginStatus(
            "❌ Pi SDK tidak tersedia."
        );

        return false;
    }

    try {

        console.log(
            "🟡 Menjalankan Pi.init()..."
        );

        window.Pi.init({
            version: "2.0",
            sandbox: true
        });

        console.log(
            "🟢 PI SDK INIT BERHASIL"
        );

        console.log(
            "Pi object:",
            window.Pi
        );

        setPiLoginStatus(
            "Pi SDK siap. Silakan login."
        );

        return true;

    } catch (error) {

        console.error(
            "❌ PI SDK INIT ERROR:",
            error
        );

        setPiLoginStatus(
            "❌ Pi SDK error: " +
            (error.message || error)
        );

        return false;
    }
}

/* -----------------------------------------------------
   STATUS LOGIN
----------------------------------------------------- */

function setPiLoginStatus(message) {

    const status =
        document.getElementById("piLoginStatus");

    if (status) {
        status.textContent = message;
    }
}



/* -----------------------------------------------------
   TAMPILKAN APP
----------------------------------------------------- */

function showChukApp() {

    const loginGate =
        document.getElementById("piLoginGate");

    const app =
        document.getElementById("chukApp");

    if (loginGate) {
        loginGate.style.display = "none";
    }

    if (app) {
        app.style.display = "block";
    }


    const username =
        document.getElementById("loggedUsername");

    const userBox =
        document.getElementById("loggedUser");


    if (
        username &&
        piLoginUser &&
        piLoginUser.username
    ) {

        username.textContent =
            "@" + piLoginUser.username;

    }


    if (userBox) {
        userBox.classList.add("visible");
    }


    /*
       Feed tetap dijalankan.
       Kalau fungsi loadPosts tersedia,
       kita panggil lagi setelah login.
    */

    if (
        typeof loadPosts === "function" &&
        window.supabase
    ) {

        loadPosts();

    }
}


/* -----------------------------------------------------
   LOGOUT
----------------------------------------------------- */

function logoutChuk() {

    piLoginUser = null;

    window.currentUser = null;

    localStorage.removeItem(
        "currentUser"
    );


    const app =
        document.getElementById("chukApp");

    const loginGate =
        document.getElementById("piLoginGate");

    const userBox =
        document.getElementById("loggedUser");

    const button =
        document.getElementById("piLoginButton");


    if (app) {
        app.style.display = "none";
    }

    if (loginGate) {
        loginGate.style.display = "flex";
    }

    if (userBox) {
        userBox.classList.remove("visible");
    }

    if (button) {

        button.disabled = false;

        button.textContent =
            "Login with Pi";
    }


    setPiLoginStatus(
        "Silakan login kembali dengan Pi."
    );


    console.log(
        "✅ CHUK logout"
    );
}


/* -----------------------------------------------------
   CEK SESSION
----------------------------------------------------- */

function restoreChukPiSession() {

    try {

        const saved =
            localStorage.getItem(
                "currentUser"
            );

        if (!saved) {

            console.log(
                "ℹ️ Belum ada session Pi."
            );

            return false;
        }


        const user =
            JSON.parse(saved);


        if (!user || !user.username) {

            localStorage.removeItem(
                "currentUser"
            );

            return false;
        }


        piLoginUser = user;

        window.currentUser = user;


        console.log(
            "✅ Session Pi dipulihkan:",
            user.username
        );


        showChukApp();

        return true;


    } catch (error) {

        console.error(
            "❌ Session error:",
            error
        );

        localStorage.removeItem(
            "currentUser"
        );

        return false;
    }
}


/* =====================================================
   START PI LOGIN
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🔐 CHUK Pi Login System"
        );


        initChukPi();


        const loginButton =
            document.getElementById(
                "piLoginButton"
            );


        if (loginButton) {

            loginButton.addEventListener(
                "click",
                loginWithPi
            );

        }


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutChuk
            );

        }


        /*
           Pulihkan session kalau sebelumnya
           sudah login.
        */

        restoreChukPiSession();

    }
);
