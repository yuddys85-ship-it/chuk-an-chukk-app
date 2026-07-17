/* =====================================
   CHUK AN CHUKK
   post.js v1.0
===================================== */

let selectedFile = null;

// ===============================
// Preview Foto / Video
// ===============================

function previewMedia(event){

    const file = event.target.files[0];

    if(!file) return;

    selectedFile = file;

    const previewBox = document.querySelector(".preview-box");

    const url = URL.createObjectURL(file);

    if(file.type.startsWith("image")){

        previewBox.innerHTML = `
            <img src="${url}" alt="Preview">
        `;

    }else if(file.type.startsWith("video")){

        previewBox.innerHTML = `
            <video controls autoplay muted>
                <source src="${url}">
            </video>
        `;

    }

}

// ===============================
// Upload Postingan
// ===============================

function uploadPost(){

    if(!selectedFile){

        alert("Silakan pilih foto atau video terlebih dahulu.");

        return;

    }

    const postData = {

        caption: document.getElementById("caption").value,

        location: document.getElementById("location").value,

        hashtags: document.getElementById("hashtags").value,

        privacy: document.getElementById("privacy").value,

        fileName: selectedFile.name,

        createdAt: new Date().toLocaleString()

    };

    localStorage.setItem(
        "lastPost",
        JSON.stringify(postData)
    );

    alert("🎉 Postingan berhasil dibuat.");

    window.location.href = "index.html";

}

// ===============================
// Kembali
// ===============================

function goBack(){

    window.location.href = "index.html";

}

console.log("CHUK AN CHUKK POST READY");
