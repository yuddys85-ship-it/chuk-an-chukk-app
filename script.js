// ======================================
// CHUK AN CHUKK
// Pi Network Script
// ======================================

// Inisialisasi Pi SDK
Pi.init({
    version: "2.0",
    sandbox: true
});

let currentUser = null;

// Login dengan Pi
async function loginPi() {

    try {

        const scopes = ["username"];

        const auth = await Pi.authenticate(scopes);

        currentUser = auth.user;

        console.log("Login berhasil:", currentUser);

        document.querySelector(".login-btn").style.display = "none";

        document.getElementById("profile").innerHTML = `
            <div class="about-card">
                <h3>👋 Selamat Datang</h3>
                <p><strong>${currentUser.username}</strong></p>
                <p>Login berhasil ke Pi Network.</p>

                <br>

                <button class="login-btn" onclick="logoutPi()">
                    Logout
                </button>
            </div>
        `;

    }

    catch(error){

        console.error(error);

        alert("Login dibatalkan atau gagal.");

    }

}

// Logout
function logoutPi(){

    location.reload();

}

// Exchange Demo
function exchange(){

    alert("Fitur Exchange masih dalam pengembangan.");

}

// Cek Browser Pi
window.onload = function(){

    if(typeof Pi === "undefined"){

        alert("Silakan buka aplikasi ini melalui Pi Browser.");

    }

};
