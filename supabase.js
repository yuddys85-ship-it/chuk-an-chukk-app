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

console.log("✅ Supabase Connected");
