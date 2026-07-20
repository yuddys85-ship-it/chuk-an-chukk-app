async function uploadPost(){

    if(!selectedFile){

        alert("Silakan pilih foto atau video.");
        return;

    }

    try{

        const caption =
        document.getElementById("caption").value.trim();

        const extension =
        selectedFile.name.split(".").pop();

        const uploadName =
        Date.now() + "." + extension;

        alert("⏳ Sedang mengupload...");

        // ==========================
        // Upload ke Storage
        // ==========================

        const { data: uploadData, error: uploadError } =
        await supabase
        .storage
        .from("posts")
        .upload(uploadName, selectedFile, {
            cacheControl: "3600",
            upsert: false
        });

        if(uploadError){

            console.error(uploadError);

            alert("UPLOAD ERROR\n\n" +
            JSON.stringify(uploadError,null,2));

            return;

        }

        console.log(uploadData);

        // ==========================
        // Public URL
        // ==========================

        const { data: publicData } =
        supabase
        .storage
        .from("posts")
        .getPublicUrl(uploadName);

        const mediaUrl =
        publicData.publicUrl;

        // ==========================
        // Simpan Database
        // ==========================

        const { data: insertData, error: dbError } =
        await supabase
        .from("posts")
        .insert([{

            media: mediaUrl,

            caption: caption

        }])
        .select();

        if(dbError){

            console.error(dbError);

            alert("DATABASE ERROR\n\n" +
            JSON.stringify(dbError,null,2));

            return;

        }

        console.log(insertData);

        alert("✅ Postingan berhasil dibuat.");

        window.location.href =
        "index.html";

    }catch(err){

        console.error(err);

        alert("SYSTEM ERROR\n\n" + err.message);

    }

}
