// =======================================
// CHUK AN CHUKK
// script.js
// =======================================

// Inisialisasi Pi SDK
document.addEventListener("DOMContentLoaded", () => {

    if (typeof Pi === "undefined") {

        alert("Silakan buka aplikasi melalui Pi Browser.");

        return;

    }

    Pi.init({

        version: "2.0",

        sandbox: true

    });

});

let currentUser = null;

// LOGIN PI
async function loginPi() {

    try {

        const scopes = ["username"];

        const auth = await Pi.authenticate(scopes);

        currentUser = auth.user;

        document.getElementById("profile").innerHTML = `

        <div class="card">

            <h3>👋 Selamat Datang</h3>

            <p><strong>${currentUser.username}</strong></p>

            <p>Login Pi Network berhasil.</p>

            <button class="exchange-btn"
                    onclick="logoutPi()">

                Logout

            </button>

        </div>

        `;

        document.querySelector(".login-btn").style.display = "none";

    }

    catch(error){

        console.log(error);

        alert("Login dibatalkan atau gagal.");

    }

}

// LOGOUT
function logoutPi(){

    location.reload();

}

// EXCHANGE DEMO
function exchange(){

    alert(
        "Fitur Exchange Chuk → Pi akan tersedia pada versi berikutnya."
    );

}

// NOTIFIKASI
function showMessage(message){

    alert(message);

}

//
