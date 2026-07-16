// =====================================
// CHUK AN CHUKK
// script.js
// =====================================

// Jalankan saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", function () {

    console.log("Chuk an Chukk Ready");

});

// ======================
// Pencarian
// ======================

function searchPost() {

    alert("Fitur pencarian segera hadir.");

}

// ======================
// Notifikasi
// ======================

function showNotifications() {

    alert("Belum ada notifikasi.");

}

// ======================
// Like
// ======================

function likePost() {

    alert("❤️ Postingan disukai.");

}

// ======================
// Komentar
// ======================

function commentPost() {

    alert("💬 Fitur komentar segera hadir.");

}

// ======================
// Bagikan
// ======================

function sharePost() {

    if (navigator.share) {

        navigator.share({

            title: "Chuk an Chukk",

            text: "Lihat postingan ini.",

            url: window.location.href

        });

    } else {

        alert("Browser belum mendukung fitur Share.");

    }

}

// ======================
// Simpan
// ======================

function savePost() {

    alert("🔖 Postingan disimpan.");

}

// ======================
// Bottom Navigation
// ======================

function goHome() {

    alert("Home");

}

function goPost() {

    alert("Halaman Upload akan dibuat.");

}

function goChat() {

    alert("Chat akan segera hadir.");

}

function goProfile() {

    alert("Profile akan segera hadir.");

}
