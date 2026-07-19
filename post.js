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

        // Upload ke Storage
        const { error: uploadError } = await supabase
            .storage
            .from("posts")
            .upload(uploadName, selectedFile,{
                cacheControl:"3600",
                upsert:false
            });

        if(uploadError){

            console.error(uploadError);

            alert("❌ Upload Storage gagal");

            return;

        }

        // Ambil URL Public
        const { data: publicData } = supabase
            .storage
            .from("posts")
            .getPublicUrl(uploadName);

        const mediaUrl = publicData.publicUrl;

        // Simpan Database
        const { error: dbError } = await supabase
            .from("posts")
            .insert([{

                media: mediaUrl,

                caption: caption,

                location: location,

                hashtags: hashtags,

                privacy: privacy

            }]);

        if(dbError){

            console.error(dbError);

            alert("❌ Gagal menyimpan database");

            return;

        }

        alert("✅ Postingan berhasil dibuat");

        window.location.replace("index.html");

    }catch(err){

        console.error(err);

        alert("❌ Terjadi kesalahan");

    }

}
