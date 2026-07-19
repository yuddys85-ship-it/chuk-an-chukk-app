async function uploadPost(){

    if(!selectedFile){

        alert("Silakan pilih foto atau video.");
        return;

    }

    try{

        const caption = document.getElementById("caption").value.trim();
        const location = document.getElementById("location").value.trim();
        const hashtags = document.getElementById("hashtags").value.trim();
        const privacy = document.getElementById("privacy").value;

        const extension = selectedFile.name.split(".").pop();
        const uploadName = Date.now() + "." + extension;

        alert("⏳ Sedang mengupload...");

        // ==========================
        // Upload ke Storage
        // ==========================

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from("posts")
            .upload(uploadName, selectedFile, {
                cacheControl: "3600",
                upsert: false
            });

        if(uploadError){

            console.error("UPLOAD ERROR :", uploadError);

            alert("❌ Upload gagal\n\n" + uploadError.message);

            return;

        }

        console.log("UPLOAD BERHASIL :", uploadData);

        // ==========================
        // Ambil Public URL
        // ==========================

        const { data: publicData } = supabase
            .storage
            .from("posts")
            .getPublicUrl(uploadName);

        const mediaUrl = publicData.publicUrl;

        // ==========================
        // Simpan ke Database
        // ==========================

        const { data: insertData, error: dbError } = await supabase
            .from("posts")
            .insert([{
                media: mediaUrl,
                caption: caption,
                location: location,
                hashtags: hashtags,
                privacy: privacy
            }])
            .select();

        if(dbError){

            console.error("DATABASE ERROR :", dbError);

            alert("❌ Database gagal\n\n" + dbError.message);

            return;

        }

        console.log("DATABASE BERHASIL :", insertData);

        alert("✅ Postingan berhasil dibuat.");

        window.location.href = "index.html";

    }catch(err){

        console.error("SYSTEM ERROR :", err);

        alert("❌ " + err.message);

    }

}
