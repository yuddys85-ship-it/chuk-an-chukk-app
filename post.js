/* =====================================
   CHUK AN CHUKK v3.0
   SUPABASE POST
===================================== */

let selectedFile = null;

// ===============================
// PREVIEW FOTO / VIDEO
// ===============================

function previewMedia(event){

    const file = event.target.files[0];

    if(!file) return;

    selectedFile = file;

    const preview = document.getElementById("preview");

    const url = URL.createObjectURL(file);

    if(file.type.startsWith("image")){

        preview.outerHTML =
        `<img id="preview"
        src="${url}"
        alt="Preview">`;

    }else{

        preview.outerHTML =
        `<video id="preview"
        controls
        autoplay
        muted>

        <source src="${url}">

        </video>`;

    }

}

// ===============================
// UPLOAD KE SUPABASE
// ===============================

async function uploadPost(){

    if(!selectedFile){

        alert("Silakan pilih foto atau video.");

        return;

    }

    const caption =
    document.getElementById("caption").value;

    const location =
    document.getElementById("location").value;

    const hashtags =
    document.getElementById("hashtags").value;

    const privacy =
    document.getElementById("privacy").value;

    const fileName =
    Date.now()+"_"+selectedFile.name;

    alert("Sedang upload...");
       // Upload ke Storage

    const { error: uploadError } =
    await supabase
    .storage
    .from("posts")
    .upload(fileName, selectedFile);

    if(uploadError){

        alert("Upload gagal.");

        console.log(uploadError);

        return;

    }

    // Ambil URL publik

    const { data: publicData } =
    supabase
    .storage
    .from("posts")
    .getPublicUrl(fileName);

    const mediaUrl =
    publicData.publicUrl;

    // Simpan ke Database

    const { error: insertError } =
    await supabase
    .from("posts")
    .insert([{

        media: mediaUrl,

        caption: caption,

        location: location,

        hashtags: hashtags,

        privacy: privacy

    }]);

    if(insertError){

        alert("Data gagal disimpan.");

        console.log(insertError);

        return;

    }

    alert("🎉 Postingan berhasil dibuat.");

    window.location.href="index.html";

}
