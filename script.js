// ==========================
// GLOBAL STATE
// ==========================
let currentUser = null;
let unlockedChuk = 10000;
let lockedChuk = 5000;

// ==========================
// LOGIN PI
// ==========================
function login() {
  Pi.authenticate(["username"], function(auth) {
    currentUser = auth.user;

    document.getElementById("username").innerText = currentUser.username;
    document.getElementById("userArea").classList.remove("hidden");

    showNotif("Login berhasil: " + currentUser.username);

    loadWallet();
  }, function(error) {
    console.error(error);
    alert("Login gagal");
  });
}

// ==========================
// LOAD WALLET
// ==========================
function loadWallet() {
  document.getElementById("unlocked").innerText = unlockedChuk;
  document.getElementById("locked").innerText = lockedChuk;
}

// ==========================
// EXCHANGE CHUK → PI
// ==========================
function exchange() {
  if (unlockedChuk < 10000) {
    alert("Saldo tidak cukup");
    return;
  }

  let confirmTx = confirm("Tukar 10,000 Chuk → 1 Pi ?");

  if (!confirmTx) return;

  unlockedChuk -= 10000;
  updateWallet();

  addHistory("Exchange 10,000 Chuk → 1 Pi");

  showNotif("Exchange berhasil (Testnet)");
}

// ==========================
// UPDATE WALLET
// ==========================
function updateWallet() {
  document.getElementById("unlocked").innerText = unlockedChuk;
  document.getElementById("locked").innerText = lockedChuk;
}

// ==========================
// HISTORY TRANSACTION
// ==========================
function addHistory(text) {
  let history = JSON.parse(localStorage.getItem("history")) || [];

  history.push({
    text: text,
    time: new Date().toLocaleString()
  });

  localStorage.setItem("history", JSON.stringify(history));

  renderHistory();
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  let container = document.getElementById("history");

  if (!container) return;

  container.innerHTML = "";

  history.reverse().forEach(item => {
    let div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <p>${item.text}</p>
      <small>${item.time}</small>
    `;
    container.appendChild(div);
  });
}

// ==========================
// NOTIFICATION SYSTEM
// ==========================
function showNotif(message) {
  let notif = document.createElement("div");
  notif.innerText = message;

  notif.style.position = "fixed";
  notif.style.bottom = "20px";
  notif.style.left = "50%";
  notif.style.transform = "translateX(-50%)";
  notif.style.background = "#000";
  notif.style.color = "#fff";
  notif.style.padding = "10px 20px";
  notif.style.borderRadius = "8px";
  notif.style.zIndex = "999";

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.remove();
  }, 3000);
}

// ==========================
// AUTO LOAD
// ==========================
window.onload = function() {
  renderHistory();
};
