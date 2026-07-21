/* =====================================
   CHUK AN CHUKK
   POST.JS
===================================== */

let selectedFile = null;

// ==========================
// Preview Foto / Video
// ==========================

function previewMedia(event) {

    selectedFile = event.target.files[0];

    if (!selectedFile) return;

    const preview = document.getElementById("preview");

    const url = URL.createObjectURL(selectedFile);

    if (selectedFile.type.startsWith("image/")) {

        preview.outerHTML = `
        <img
            id="preview"
            src="${url}"
            style="
            width:100%;
            max-height:350px;
            object-fit:cover;
            border-radius:12px;
        ">`;

    } else {

        preview.outerHTML = `
        <video
            id="preview"
            controls
            style="
            width:100%;
            max-height:350px;
            border-radius:12px;
        ">
            <source src="${url}">
        </video>`;

    }

}

// ==========================
// Upload Post
// ==========================

async function uploadPost() {

    if (!selectedFile) {

        alert("❌ Pilih foto atau video terlebih dahulu.");

        return;

    }

    try {

        const caption =
        document.getElementById("caption").value.trim();

        const location =
        document.getElementById("location").value.trim();

        const hashtags =
        document.getElementById("hashtags").value.trim();

        const privacy =
        document.getElementById("privacy").value;

        const extension =
        selectedFile.name.split(".").pop();

        const uploadName =
        Date.now() + "." + extension;

        alert("⏳ Upload ke Storage...");

        // ==========================
        // Upload Storage
        // ==========================

        const { error: uploadError } =
        await supabase.storage
        .from("posts")
        .upload(uploadName, selectedFile);

        if (uploadError) {

            console.error(uploadError);

            alert("❌ STORAGE ERROR\n\n" + uploadError.message);

            return;

        }

        // ==========================
        // Public URL
        // ==========================

        const { data } =
        supabase.storage
        .from("posts")
        .getPublicUrl(uploadName);

        const mediaUrl =
        data.publicUrl;

        console.log(mediaUrl);

        alert("✅ Upload Storage Berhasil");

        // ==========================
        // Insert Database
        // ==========================

        const { data: insertData, error: dbError } =
        await supabase
        .from("posts")
        .insert([{

            media: mediaUrl,

            caption: caption,

            location: location,

            hashtags: hashtags,

            privacy: privacy

        }])
        .select();

        if (dbError) {

            console.error(dbError);

            alert("❌ DATABASE ERROR\n\n" + dbError.message);

            return;

        }

        console.log(insertData);

        alert("✅ Postingan berhasil dibuat.");

        window.location.href = "index.html";

    } catch (err) {

        console.error(err);

        alert("❌ SYSTEM ERROR\n\n" + err.message);

    }

}   
