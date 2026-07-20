async function uploadPost() {

    if (!selectedFile) {
        alert("Silakan pilih foto atau video.");
        return;
    }

    try {

        const caption = document.getElementById("caption").value.trim();

        const extension = selectedFile.name.split(".").pop();
        const uploadName = Date.now() + "." + extension;

        alert("⏳ Sedang upload...");

        // ==========================
        // Upload ke Storage
        // ==========================

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from("posts")
            .upload(uploadName, selectedFile);

        if (uploadError) {
            alert("❌ STORAGE ERROR\n\n" + uploadError.message);
            console.log(uploadError);
            return;
        }

        console.log("Storage OK", uploadData);

        // ==========================
        // Ambil URL
        // ==========================

        const { data } = supabase
            .storage
            .from("posts")
            .getPublicUrl(uploadName);

        const mediaUrl = data.publicUrl;

        alert("✅ Upload Storage Berhasil");

        // ==========================
        // Simpan Database
        // ==========================

        const { data: dbData, error: dbError } = await supabase
            .from("posts")
            .insert([
                {
                    media: mediaUrl,
                    caption: caption
                }
            ])
            .select();

        if (dbError) {
            alert("❌ DATABASE ERROR\n\n" + dbError.message);
            console.log(dbError);
            return;
        }

        console.log("Database OK", dbData);

        alert("✅ POST BERHASIL");

        window.location.href = "index.html";

    } catch (err) {

        console.log(err);

        alert("❌ SYSTEM ERROR\n\n" + err.message);

    }

}
