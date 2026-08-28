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
            alt="Preview"
            style="
                width:100%;
                max-height:350px;
                object-fit:cover;
                border-radius:12px;
            "
        >`;

    } else {

        preview.outerHTML = `
        <video
            id="preview"
            controls
            style="
                width:100%;
                max-height:350px;
                border-radius:12px;
            "
        >
            <source src="${url}" type="${selectedFile.type}">
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

        // Pastikan client tersedia
        const sb = window.chukSupabase;

        if (!sb) {

            alert("❌ Supabase Client belum siap.");

            console.error(
                "window.chukSupabase tidak ditemukan"
            );

            return;
        }

        if (!sb.storage) {

            alert("❌ Supabase Storage tidak tersedia.");

            console.error(
                "sb.storage tidak ditemukan",
                sb
            );

            return;
        }

        const caption =
            document.getElementById("caption").value.trim();

        const location =
            document.getElementById("location").value.trim();

        const hashtags =
            document.getElementById("hashtags").value.trim();

        const privacy =
            document.getElementById("privacy").value;

        // ==========================
        // Nama file
        // ==========================

        const extension =
            selectedFile.name
                .split(".")
                .pop()
                .toLowerCase();

        const uploadName =
            Date.now() + "_" +
            Math.random()
                .toString(36)
                .substring(2, 8) +
            "." +
            extension;

        alert("⏳ Upload foto ke Storage...");

        console.log("📁 File:", selectedFile.name);
        console.log("📦 Bucket: posts");
        console.log("📤 Upload:", uploadName);

        // ==========================
        // Upload Storage
        // ==========================

        const {
            data: uploadData,
            error: uploadError
        } = await sb.storage
            .from("posts")
            .upload(
                uploadName,
                selectedFile,
                {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: selectedFile.type
                }
            );

        if (uploadError) {

            console.error(
                "❌ STORAGE ERROR:",
                uploadError
            );

            alert(
                "❌ STORAGE ERROR\n\n" +
                uploadError.message
            );

            return;
        }

        console.log(
            "✅ Storage upload:",
            uploadData
        );

        // ==========================
        // Public URL
        // ==========================

        const {
            data: publicData
        } = sb.storage
            .from("posts")
            .getPublicUrl(uploadName);

        if (!publicData || !publicData.publicUrl) {

            alert(
                "❌ Public URL gagal dibuat."
            );

            return;
        }

        const mediaUrl =
            publicData.publicUrl;

        console.log(
            "🌐 Media URL:",
            mediaUrl
        );

        // ==========================
        // Insert Database
        // ==========================

        const {
            data: insertData,
            error: dbError
        } = await sb
            .from("posts")
            .insert([
                {
                    media: mediaUrl,
                    caption: caption,
                    location: location,
                    hashtags: hashtags,
                    privacy: privacy
                }
            ])
            .select();

        if (dbError) {

            console.error(
                "❌ DATABASE ERROR:",
                dbError
            );

            alert(
                "❌ DATABASE ERROR\n\n" +
                dbError.message
            );

            return;
        }

        console.log(
            "✅ Database:",
            insertData
        );

        alert(
            "✅ Postingan berhasil dibuat!"
        );

        window.location.href =
            "index.html";

    } catch (err) {

        console.error(
            "❌ SYSTEM ERROR:",
            err
        );

        alert(
            "❌ SYSTEM ERROR\n\n" +
            err.message
        );
    }
}
