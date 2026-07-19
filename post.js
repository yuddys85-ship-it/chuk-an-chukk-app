/* =====================================
   CHUK AN CHUKK v3.0
   POST.JS
===================================== */

let selectedFile = null;

// ===============================
// PREVIEW FOTO / VIDEO
// ===============================

function previewMedia(event){

    const file = event.target.files[0];

    if(!file) return;

    selectedFile = file;

    const previewBox =
    document.querySelector(".preview-box");

    const url = URL.createObjectURL(file);

    if(file.type.startsWith("image")){

        previewBox.innerHTML = `
            <img id="preview"
                 src="${url}"
                 alt="Preview">
        `;

    }else{

        previewBox.innerHTML = `
            <video id="preview"
                   controls
                   autoplay
                   muted>

                <source src="${url}">

            </video>
        `;

    }

}

// ===============================
// UPLOAD POSTINGAN
// ===============================

async function uploadPost(){

    if(!selectedFile){

        alert("Silakan pilih foto atau video.");

        return;

    }

    try{

        const caption =
        document.getElementById("caption").value;

        const location =
        document.getElementById("location").value;

        const hashtags =
        document.getElementById("hashtags").value;

        const privacy =
        document.getElementById("privacy").value;

        const extension =
        selectedFile.name.split(".").pop();

        const uploadName =
        Date.now()+"."+extension;

        alert("Sedang mengupload...");

        // ===============================
        // Upload ke Storage
        // ===============================

        const { error: uploadError } =
        await supabase
        .storage
        .from("posts")
        .upload(uploadName, selectedFile);

        if(uploadError){

            console.log(uploadError);

            alert("Upload gagal.");

            return;

        }

        // ===============================
        // Ambil URL
        // ===============================

        const { data } =
        supabase
        .storage
        .from("posts")
        .getPublicUrl(uploadName);

        const mediaUrl =
        data.publicUrl;

        // ===============================
        // Simpan ke Database
        // ===============================

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

            console.log(insertError);

            alert("Data gagal disimpan.");

            return;

        }

        alert("🎉 Postingan berhasil dibuat.");

        window.location.href =
        "index.html";

    }catch(err){

        console.log(err);

        alert("Terjadi kesalahan.");

    }

}

// ===============================
// KEMBALI
// ===============================

function goBack(){

    window.location.href =
    "index.html";

}

console.log("🚀 CHUK AN CHUKK POST READY");
