"use strict";

/* =========================================================
   CHUK AN CHUKK
   PROFILE SYSTEM
   PI USERNAME + DISPLAY NAME + AVATAR
   ========================================================= */

const sb = window.chukSupabase;

/* =========================================================
   PROFILE STORAGE
   ========================================================= */

const PROFILE_KEY = "chukUserProfile";

/* =========================================================
   AMBIL PROFIL TERSIMPAN
   ========================================================= */

function getSavedProfile() {

    try {

        const saved =
            localStorage.getItem(PROFILE_KEY);

        if (!saved) return null;

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "❌ Gagal membaca profil:",
            error
        );

        return null;
    }
}

/* =========================================================
   SIMPAN PROFIL
   ========================================================= */

function saveProfile(profile) {

    try {

        localStorage.setItem(
            PROFILE_KEY,
            JSON.stringify(profile)
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Gagal menyimpan profil:",
            error
        );

        return false;
    }
}

/* =========================================================
   PROFIL USER
   ========================================================= */

function getPiUser() {

    /*
       Mengambil user dari beberapa kemungkinan
       sumber yang sudah digunakan aplikasi.
    */

    if (window.currentUser) {
        return window.currentUser;
    }

    try {

        const savedUser =
            localStorage.getItem("currentUser");

        if (savedUser) {
            return JSON.parse(savedUser);
        }

    } catch (error) {

        console.warn(
            "⚠️ currentUser tidak bisa dibaca"
        );
    }

    return null;
}

/* =========================================================
   TAMPILKAN PROFIL
   ========================================================= */

function displayProfile() {

    const usernameElement =
        document.getElementById("username");

    const avatarElement =
        document.getElementById("avatar");

    const savedProfile =
        getSavedProfile();

    const piUser =
        getPiUser();

    /* =====================================================
       USERNAME PI NETWORK
       ===================================================== */

    let piUsername = "";

    if (piUser) {

        piUsername =
            piUser.username ||
            piUser.piUsername ||
            "";
    }

    /* =====================================================
       NAMA TAMPILAN
       ===================================================== */

    let displayName =
        savedProfile &&
        savedProfile.displayName
            ? savedProfile.displayName
            : piUsername;

    if (!displayName) {
        displayName = "CHUK USER";
    }

    /* =====================================================
       FOTO
       ===================================================== */

    let avatar =
        savedProfile &&
        savedProfile.avatar
            ? savedProfile.avatar
            : "assets/logo.png";

    /* =====================================================
       TAMPILKAN
       ===================================================== */

    if (usernameElement) {

        usernameElement.textContent =
            displayName;
    }

    if (avatarElement) {

        avatarElement.src =
            avatar;

        avatarElement.onerror = () => {

            avatarElement.src =
                "assets/logo.png";
        };
    }

    /* =====================================================
       SIMPAN PROFIL AWAL
       ===================================================== */

    if (!savedProfile) {

        saveProfile({

            piUsername: piUsername,

            displayName: displayName,

            avatar: avatar
        });
    }
}

/* =========================================================
   EDIT PROFILE
   ========================================================= */

function editProfile() {

    const oldProfile =
        getSavedProfile() || {};

    const oldName =
        oldProfile.displayName ||
        document.getElementById("username")?.textContent ||
        "CHUK USER";

    /* =====================================================
       NAMA BARU
       ===================================================== */

    const newName =
        prompt(
            "Masukkan nama tampilan:",
            oldName
        );

    if (newName === null) {
        return;
    }

    const cleanName =
        newName.trim();

    if (!cleanName) {

        alert(
            "Nama tidak boleh kosong."
        );

        return;
    }

    /* =====================================================
       PROFILE LAMA
       ===================================================== */

    const profile =
        getSavedProfile() || {};

    profile.displayName =
        cleanName;

    if (!profile.avatar) {

        profile.avatar =
            "assets/logo.png";
    }

    /* =====================================================
       SIMPAN
       ===================================================== */

    if (!saveProfile(profile)) {

        alert(
            "Profil gagal disimpan."
        );

        return;
    }

    /* =====================================================
       UPDATE LAYAR
       ===================================================== */

    const usernameElement =
        document.getElementById("username");

    if (usernameElement) {

        usernameElement.textContent =
            cleanName;
    }

    alert(
        "✅ Nama profil berhasil diubah."
    );
}

/* =========================================================
   GANTI FOTO
   ========================================================= */

function changeAvatar() {

    const input =
        document.getElementById("avatarInput");

    if (!input) return;

    input.click();
}

/* =========================================================
   PROSES FOTO
   ========================================================= */

function handleAvatarChange(event) {

    const file =
        event.target.files?.[0];

    if (!file) return;

    /* =====================================================
       VALIDASI
       ===================================================== */

    if (!file.type.startsWith("image/")) {

        alert(
            "Pilih file gambar."
        );

        return;
    }

    /* =====================================================
       BATAS FILE
       ===================================================== */

    if (file.size > 2 * 1024 * 1024) {

        alert(
            "Ukuran foto maksimal 2 MB."
        );

        return;
    }

    const reader =
        new FileReader();

    reader.onload = () => {

        const avatar =
            reader.result;

        const profile =
            getSavedProfile() || {};

        profile.avatar =
            avatar;

        if (!profile.displayName) {

            profile.displayName =
                document.getElementById(
                    "username"
                )?.textContent ||
                "CHUK USER";
        }

        if (!saveProfile(profile)) {

            alert(
                "Foto gagal disimpan."
            );

            return;
        }

        const avatarElement =
            document.getElementById("avatar");

        if (avatarElement) {

            avatarElement.src =
                avatar;
        }

        alert(
            "✅ Foto profil berhasil diubah."
        );
    };

    reader.readAsDataURL(file);
}

/* =========================================================
   LOAD POSTS
   ========================================================= */

async function loadProfile() {

    displayProfile();

    if (!sb) {

        console.warn(
            "⚠️ Supabase belum tersedia"
        );

        return;
    }

    const { data, error } =
        await sb
            .from("posts")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        console.error(error);

        return;
    }

    const posts =
        data || [];

    const postCount =
        document.getElementById(
            "postCount"
        );

    if (postCount) {

        postCount.textContent =
            posts.length;
    }

    const box =
        document.getElementById(
            "myPosts"
        );

    if (!box) return;

    if (!posts.length) {

        box.innerHTML =
            "<p style='padding:20px;text-align:center'>Belum ada postingan.</p>";

        return;
    }

    box.innerHTML =
        posts.map(post => {

            const media =
                String(
                    post.media || ""
                );

            if (
                /\.(mp4|webm|mov|avi|mkv)(\?|$)/i
                    .test(media)
            ) {

                return `
                    <video
                        src="${media}"
                        controls
                        playsinline
                    ></video>
                `;
            }

            return `
                <img
                    src="${media}"
                    loading="lazy"
                    alt="Postingan"
                >
            `;

        }).join("");
}

/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        displayProfile();

        loadProfile();

        const avatar =
            document.getElementById(
                "avatar"
            );

        if (avatar) {

            avatar.addEventListener(
                "click",
                changeAvatar
            );
        }

        const avatarInput =
            document.getElementById(
                "avatarInput"
            );

        if (avatarInput) {

            avatarInput.addEventListener(
                "change",
                handleAvatarChange
            );
        }
    }
);
