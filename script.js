// =====================================
// CHUK AN CHUKK
// POST SCRIPT
// =====================================

let selectedFile = null;

// Preview Foto / Video
function previewMedia(event){

    const file = event.target.files[0];

    if(!file) return;

    selectedFile = file;

    const preview = document.getElementById("preview");

    const url = URL.createObjectURL(file);

    if(file.type.startsWith("image")){

        preview.outerHTML = `
            <img
                id="preview"
                src="${url}"
                alt="Preview">
        `;

    }else{

        preview.outerHTML = `
            <video
                id="preview"
                src="${url}"
                controls
                autoplay
                muted
                style="width:100%;height:100%;object-fit:cover;border-radius:15px;">
            </video>
        `;

    }

}

// Upload Postingan
function uploadPost(){

    const caption =
    document.getElementById("caption").value;

    if(!selectedFile){

        alert("Pilih foto atau video terlebih dahulu.");

        return;

    }

    const post = {

        caption: caption,

        fileName: selectedFile.name,

        date: new Date().toLocaleString()

    };

    localStorage.setItem(
        "lastPost",
        JSON.stringify(post)
    );

    alert("Postingan berhasil dibuat.");

    window.location.href="index.html";

}
