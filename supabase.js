/* =====================================
   CHUK AN CHUKK
   SUPABASE.JS
===================================== */

const SUPABASE_URL =
"https://aoaqvbrxgtfuvyiscpic.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_Yjdm78LEqtijgVfB160byA_RHsml_Ga";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// ==========================
// DEBUG
// ==========================

console.log("✅ Supabase Connected");
console.log("window.supabase =", window.supabase);
console.log("supabase =", supabase);
console.log("storage =", supabase.storage);

window.supabaseClient = supabase;
