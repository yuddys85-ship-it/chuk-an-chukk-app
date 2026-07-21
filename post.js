async function uploadPost() {

    if (!selectedFile) {
        alert("❌ Silakan pilih foto atau video terlebih dahulu.");
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
            .upload(uploadName, selectedFile, {
                cacheControl: "3600",
                upsert: true
            });

        if (uploadError) {
            console.error(uploadError);
            alert("❌ STORAGE ERROR\n\n" + JSON.stringify(uploadError, null, 2));
            return;
        }

        console.log("Storage OK", uploadData);

        // ==========================
        // Ambil Public URL
        // ==========================

        const { data: publicUrlData } = supabase
            .storage
            .from("posts")
            .getPublicUrl(uploadName);

        const mediaUrl = publicUrlData.publicUrl;

        console.log("Media URL :", mediaUrl);

        // ==========================
        // Simpan Database
        // ==========================

        const { data: dbData, error: dbError } = await supabase
            .from("posts")
            .insert([{
                media: mediaUrl,
                caption: caption
            }])
            .select();

        if (dbError) {
            console.error(dbError);
            alert("❌ DATABASE ERROR\n\n" + JSON.stringify(dbError, null, 2));
            return;
        }

        console.log("Database OK", dbData);

        alert("✅ Postingan berhasil dibuat!");

        window.location.href = "index.html";

    } catch (err) {

        console.error(err);

        alert("❌ SYSTEM ERROR\n\n" + err.message);

    }

}
