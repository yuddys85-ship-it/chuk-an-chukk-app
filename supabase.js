/* =====================================
   CHUK AN CHUKK
   SUPABASE.JS v2
===================================== */

const SUPABASE_URL =
    "https://aoaqvbrxgtfuvyiscpic.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_Yjdm78LEqtijgVfB160byA_RHsml_Ga";

/* =====================================
   CREATE SUPABASE CLIENT
===================================== */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

/* =====================================
   GLOBAL ACCESS
===================================== */

window.chukSupabase = supabaseClient;

/* =====================================
   CONNECTION CHECK
===================================== */

console.log("✅ CHUK AN CHUKK");
console.log("✅ Supabase Client Ready");
console.log("✅ Database:", SUPABASE_URL);
console.log("✅ Storage Ready:", !!supabaseClient.storage);
