/* =========================================================
   CHUK AN CHUKK
   SCRIPT.JS v6.0
   SOCIAL FEED + KOMENTAR UUID FIX
========================================================= */

let likedPosts = new Set();


/* =========================================================
   START APP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 CHUK AN CHUKK v6.0 START");

    if (!window.supabase) {
        console.error("❌ Supabase Client tidak ditemukan");
        return;
    }

    loadPosts();

});


/* =========================================================
   LOAD POSTS
========================================================= */

async function loadPosts() {

    const feed = document.getElementById("feed");

    if (!feed) {
        console.error("❌ Element #feed tidak ditemukan");
        return;
    }

    feed.innerHTML = `
        <div class="empty-feed">
            ⏳ Memuat postingan...
        </div>
    `;

    try {

        const { data, error } = await supabase
            .from("posts")
            .select("*")
            .order("created_at", {
                ascending: false
            });


        if (error) {

            console.error(
                "❌ LOAD POSTS ERROR:",
                error
            );

            feed.innerHTML = `
                <div class="empty-feed">
                    ❌ Gagal memuat postingan.
                    <br><br>
                    ${escapeHTML(error.message)}
                </div>
            `;

            return;
        }


        feed.innerHTML = "";


        if (!data || data.length === 0) {

            feed.innerHTML = `
                <div class="empty-feed">
                    📭 Belum ada postingan.
                </div>
            `;

            return;
        }


        console.log(
            "✅ POSTS:",
            data
        );


        data.forEach(post => {

            /* =========================================
               POST ID
            ========================================= */

            if (
                post.id === undefined ||
                post.id === null ||
                String(post.id).trim() === ""
            ) {

                console.error(
                    "❌ POST TANPA ID:",
                    post
                );

                return;
            }


            const postId =
                String(post.id).trim();


            console.log(
                "📌 POST ID:",
                postId
            );


            /* =========================================
               MEDIA
            ========================================= */

            let media = "";


            if (post.media) {

                const mediaUrl =
                    String(post.media);


                const isVideo =
                    /\.(mp4|webm|mov|m4v)(\?.*)?$/i
                    .test(mediaUrl);


                if (isVideo) {

                    media = `
                        <video
                            class="post-image"
                            src="${escapeHTML(mediaUrl)}"
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
                            src="${escapeHTML(mediaUrl)}"
                            alt="Postingan"
                            loading="lazy">
                    `;

                }

            }


            /* =========================================
               POST HTML
            ========================================= */

            feed.innerHTML += `

                <article
                    class="post"
                    data-post-id="${escapeHTML(postId)}">

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


                            <!-- LIKE -->

                            <button
                                type="button"
                                onclick="likePost(
                                    '${escapeJS(postId)}',
                                    this
                                )"
                                aria-label="Like">

                                ❤️

                            </button>


                            <!-- KOMENTAR -->

                            <button
                                type="button"
                                onclick="commentPost(
                                    '${escapeJS(postId)}'
                                )"
                                aria-label="Komentar">

                                💬

                            </button>


                            <!-- SHARE -->

                            <button
                                type="button"
                                onclick="sharePost(
                                    '${escapeJS(postId)}'
                                )"
                                aria-label="Bagikan">

                                ↗️

                            </button>


                            <!-- SAVE -->

                            <button
                                type="button"
                                onclick="savePost(
                                    '${escapeJS(postId)}'
                                )"
                                aria-label="Simpan">

                                🔖

                            </button>


                        </div>

                    </div>

                </article>

            `;

        });


    } catch (err) {

        console.error(
            "❌ SYSTEM LOAD POSTS:",
            err
        );

        feed.innerHTML = `
            <div class="empty-feed">
                ❌ System error.
                <br><br>
                ${escapeHTML(err.message)}
            </div>
        `;

    }

}


/* =========================================================
   UUID VALIDATION
========================================================= */

function isValidUUID(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return false;
    }


    const uuid =
        String(value).trim();


    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        .test(uuid);

}


/* =========================================================
   LIKE POST
========================================================= */

function likePost(postId, button) {

    if (!isValidUUID(postId)) {

        console.error(
            "❌ LIKE UUID INVALID:",
            postId
        );

        return;
    }


    if (likedPosts.has(postId)) {

        likedPosts.delete(postId);

        if (button) {
            button.classList.remove("liked");
        }

    } else {

        likedPosts.add(postId);

        if (button) {
            button.classList.add("liked");
        }

    }

}


/* =========================================================
   OPEN COMMENT
========================================================= */

async function commentPost(postId) {

    console.log(
        "💬 COMMENT POST ID:",
        postId
    );


    /* =========================================
       VALIDASI UUID
    ========================================= */

    if (!isValidUUID(postId)) {

        alert(
            "❌ ID postingan tidak valid:\n\n" +
            postId
        );

        console.error(
            "❌ UUID POST INVALID:",
            postId
        );

        return;
    }


    const uuid =
        String(postId).trim();


    /* =========================================
       HAPUS COMMENT BOX LAMA
    ========================================= */

    const oldBox =
        document.getElementById(
            "commentBox"
        );


    if (oldBox) {
        oldBox.remove();
    }


    /* =========================================
       BUAT COMMENT BOX
    ========================================= */

    const box =
        document.createElement("div");


    box.id = "commentBox";


    box.dataset.postId = uuid;


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

                    ⏳ Memuat komentar...

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


    /* =========================================
       SEND BUTTON
    ========================================= */

    const sendButton =
        document.getElementById(
            "sendCommentButton"
        );


    if (sendButton) {

        sendButton.onclick = function () {

            sendComment(uuid);

        };

    }


    /* =========================================
       INPUT
    ========================================= */

    const input =
        document.getElementById(
            "commentText"
        );


    if (input) {

        input.addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    sendComment(uuid);

                }

            }
        );


        setTimeout(() => {

            input.focus();

        }, 150);

    }


    /* =========================================
       LOAD COMMENTS
    ========================================= */

    await loadComments(uuid);

}


/* =========================================================
   LOAD COMMENTS
========================================================= */

async function loadComments(postId) {

    const list =
        document.getElementById(
            "commentsList"
        );


    if (!list) {
        return;
    }


    if (!isValidUUID(postId)) {

        list.innerHTML = `

            <div class="comment-empty">

                ❌ ID postingan tidak valid.

            </div>

        `;

        console.error(
            "❌ LOAD COMMENTS UUID INVALID:",
            postId
        );

        return;
    }


    const uuid =
        String(postId).trim();


    console.log(
        "📥 LOAD COMMENTS UUID:",
        uuid
    );


    try {

        const { data, error } =
            await supabase
                .from("comments")
                .select("*")
                .eq("post_id", uuid)
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
                    Jadilah yang pertama
                    berkomentar.

                </div>

            `;

            return;
        }


        console.log(
            "✅ COMMENTS:",
            data
        );


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


    } catch (err) {

        console.error(
            "❌ SYSTEM LOAD COMMENTS:",
            err
        );


        list.innerHTML = `

            <div class="comment-empty">

                ❌ System error.
                <br><br>

                ${escapeHTML(
                    err.message
                )}

            </div>

        `;

    }

}


/* =========================================================
   SEND COMMENT
========================================================= */

async function sendComment(postId) {

    console.log(
        "📤 SEND COMMENT POST ID:",
        postId
    );


    /* =========================================
       VALIDASI UUID
    ========================================= */

    if (!isValidUUID(postId)) {

        alert(
            "❌ ID postingan tidak valid:\n\n" +
            postId
        );

        console.error(
            "❌ SEND UUID INVALID:",
            postId
        );

        return;
    }


    const uuid =
        String(postId).trim();


    /* =========================================
       INPUT
    ========================================= */

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


    /* =========================================
       BUTTON
    ========================================= */

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

        /* =====================================
           USERNAME
        ===================================== */

        const username =
            localStorage.getItem(
                "pi_username"
            ) ||
            localStorage.getItem(
                "username"
            ) ||
            "User";


        const cleanUsername =
            String(username).trim();


        console.log(
            "📝 DATA KOMENTAR:",
            {
                post_id: uuid,
                username: cleanUsername,
                comment: text
            }
        );


        /* =====================================
           INSERT COMMENT
        ===================================== */

        const { data, error } =
            await supabase
                .from("comments")
                .insert([
                    {
                        post_id: uuid,
                        username: cleanUsername,
                        comment: text
                    }
                ])
                .select();


        /* =====================================
           ERROR
        ===================================== */

        if (error) {

            console.error(
                "❌ SUPABASE COMMENT ERROR:",
                error
            );


            alert(
                "❌ Komentar gagal dikirim\n\n" +
                error.message
            );


            return;
        }


        /* =====================================
           SUCCESS
        ===================================== */

        console.log(
            "✅ KOMENTAR BERHASIL:",
            data
        );


        input.value = "";


        await loadComments(uuid);


    } catch (err) {

        console.error(
            "❌ SYSTEM COMMENT ERROR:",
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
   SHARE POST
========================================================= */

async function sharePost(postId) {

    if (!isValidUUID(postId)) {

        console.error(
            "❌ SHARE UUID INVALID:",
            postId
        );

        return;
    }


    try {

        const shareUrl =
            location.origin +
            location.pathname +
            "?post=" +
            encodeURIComponent(postId);


        if (navigator.share) {

            await navigator.share({

                title:
                    "CHUK AN CHUKK",

                text:
                    "Lihat postingan ini di Chuk an Chukk.",

                url:
                    shareUrl

            });

        } else {

            await navigator.clipboard.writeText(
                shareUrl
            );

            alert(
                "🔗 Link postingan berhasil disalin."
            );

        }


    } catch (err) {

        console.log(
            "Share dibatalkan."
        );

    }

}


/* =========================================================
   SAVE POST
========================================================= */

function savePost(postId) {

    if (!isValidUUID(postId)) {

        console.error(
            "❌ SAVE UUID INVALID:",
            postId
        );

        return;
    }


    localStorage.setItem(
        "saved_" + postId,
        "true"
    );


    alert(
        "🔖 Postingan disimpan."
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
   NOTIFICATIONS
========================================================= */

function showNotifications() {

    alert(
        "🔔 Belum ada notifikasi."
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

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


/* =========================================================
   SECURITY / HTML ESCAPE
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


/* =========================================================
   ESCAPE JAVASCRIPT STRING
========================================================= */

function escapeJS(text) {

    return String(text)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");

}


/* =========================================================
   READY
========================================================= */

console.log(
    "✅ CHUK AN CHUKK v6.0 UUID COMMENT SYSTEM READY"
);
