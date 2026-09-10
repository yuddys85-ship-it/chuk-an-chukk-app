const sb = window.chukSupabase;

async function loadProfile(){

    if(!sb) return;

    const {data,error} = await sb
        .from("posts")
        .select("*")
        .order("created_at",{ascending:false});

    if(error){
        console.error(error);
        return;
    }

    const posts = data || [];

    document.getElementById("postCount").textContent =
        posts.length;

    const box = document.getElementById("myPosts");

    if(!posts.length){
        box.innerHTML =
            "<p style='padding:20px;text-align:center'>Belum ada postingan.</p>";
        return;
    }

    box.innerHTML = posts.map(post => {

        const media = String(post.media || "");

        if(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(media)){
            return `<video src="${media}" controls></video>`;
        }

        return `<img src="${media}" loading="lazy">`;

    }).join("");
}

function editProfile(){
    alert("🚧 Edit Profil segera tersedia.");
}

document.addEventListener(
    "DOMContentLoaded",
    loadProfile
);
