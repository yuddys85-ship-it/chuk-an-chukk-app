/* =========================================================
   CHUK AN CHUKK
   SCRIPT.JS v7.0
   UUID COMMENT + LIKE + SHARE + VIDEO SOUND
========================================================= */


/* =========================================================
   STATE
========================================================= */

let likedPosts = new Set();


/* =========================================================
   START APP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 CHUK AN CHUKK v7.0 START");

    if (!window.supabase) {

        console.error(
            "❌ Supabase Client tidak ditemukan"
        );

        return;
    }

    loadSavedLikes();

    loadPosts();

});


/* =========================================================
   LOAD SAVED LIKES
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
                new Set(saved);

        }

    } catch (error) {

        console.error(
            "❌ Gagal membaca like:",
            error
        );

    }

}


/* =========================================================
   SAVE LIKES
========================================================= */

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


        feed.innerHTML = "";


        if (
            !data ||
            data.length === 0
        ) {

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

            /* =====================================
               POST ID
            ===================================== */

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


            /* =====================================
               LIKE STATE
            ===================================== */

            const isLiked =
                likedPosts.has(postId);


            /* =====================================
               MEDIA
            ===================================== */

            let media = "";


            if (post.media) {

                const mediaUrl =
                    String(post.media);


                const isVideo =
                    /\.(mp4|webm|mov|m4v)(\?.*)?$/i
                    .test(mediaUrl);


                if (isVideo) {

                    media = `

                        <div
                            class="video-wrapper"
                            style="
                                position:relative;
                                width:100%;
                                height:100%;
                            ">

                            <video
                                id="video-${escapeHTML(postId)}"
                                class="post-image"
                                src="${escapeHTML(mediaUrl)}"
                                autoplay
                                muted
                                loop
                                playsinline>
                            </video>


                            <button
                                type="button"
                                class="sound-button"
                                onclick="toggleVideoSound(
                                    '${escapeJS(postId)}'
                                )"
                                aria-label="Suara video"
                                style="
                                    position:absolute;
                                    right:18px;
                                    top:80px;
                                    z-index:20;
                                    width:48px;
                                    height:48px;
                                    border:0;
                                    border-radius:50%;
                                    background:rgba(0,0,0,.65);
                                    color:white;
                                    font-size:22px;
                                    display:flex;
                                    align-items:center;
                                    justify-content:center;
                                    cursor:pointer;
                                ">

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
                            loading="lazy">

                    `;

                }

            }


            /* =====================================
               POST HTML
            ===================================== */

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
                                class="like-button ${
                                    isLiked
                                        ? "liked"
                                        : ""
                                }"
                                onclick="likePost(
                                    '${escapeJS(postId)}',
                                    this
                                )"
                                aria-label="Like">

                                ${
                                    isLiked
                                        ? "❤️"
                                        : "🤍"
                                }

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


                            <!-- BAGIKAN -->

                            <button
                                type="button"
                                onclick="sharePost(
                                    '${escapeJS(postId)}'
                                )"
                                aria-label="Bagikan">

                                ↗️

                            </button>


                            <!-- SIMPAN -->

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


        console.log(
            "✅ FEED BERHASIL DIMUAT"
        );


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
                "🤍";

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
                "❤️";

        }


        console.log(
            "❤️ POST DISUKAI:",
            uuid
        );

    }


    saveLikes();

}


/* =========================================================
   VIDEO SOUND
========================================================= */

function toggleVideoSound(postId) {

    if (!isValidUUID(postId)) {

        console.error(
            "❌ VIDEO UUID INVALID:",
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
            "❌ Video tidak ditemukan:",
            postId
        );

        return;
    }


    const button =
        document.querySelector(
            `[onclick*="toggleVideoSound('${postId}')"]`
        );


    if (video.muted) {

        video.muted = false;

        video.volume = 1;


        if (button) {

            button.innerHTML =
                "🔊";

        }


        console.log(
            "🔊 SUARA VIDEO ON"
        );


    } else {

        video.muted = true;


        if (button) {

            button.innerHTML =
                "🔇";

        }


        console.log(
            "🔇 SUARA VIDEO OFF"
        );

    }

}


/* =========================================================
   COMMENT
========================================================= */

async function commentPost(postId) {

    console.log(
        "💬 COMMENT POST ID:",
        postId
    );


    if (!isValidUUID(postId)) {

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
        document.createElement("div");


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


    const sendButton =
        document.getElementById(
            "sendCommentButton"
        );


    if (sendButton) {

        sendButton.onclick =
            function() {

                sendComment(uuid);

            };

    }


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

                    sendComment(uuid);

                }

            }
        );


        setTimeout(
            () => input.focus(),
            150
        );

    }


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


    if (!list) return;


    if (!isValidUUID(postId)) {

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
                    Jadilah yang pertama
                    berkomentar.

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

async function sendComment(postId) {

    console.log(
        "📤 SEND COMMENT:",
        postId
    );


    if (!isValidUUID(postId)) {

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
                        String(
                            username
                        ).trim(),
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


        await loadComments(uuid);


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


            console.log(
                "✅ SHARE BERHASIL"
            );


        } else {

            await copyToClipboard(
                shareUrl
            );


            alert(
                "🔗 Link postingan berhasil disalin."
            );

        }


    } catch (error) {

        console.log(
            "Share dibatalkan:",
            error
        );

    }

}


/* =========================================================
   COPY LINK
========================================================= */

async function copyToClipboard(text) {

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
   ESCAPE HTML
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
   ESCAPE JAVASCRIPT
========================================================= */

function escapeJS(text) {

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
    "✅ CHUK AN CHUKK v7.0 READY"
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
    "🔊 VIDEO SOUND: ON"
);
