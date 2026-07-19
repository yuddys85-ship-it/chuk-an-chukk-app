import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://aoaqvbrxgtfuvyiscpic.supabase.co";

const supabaseKey = "PASTE_KEY_MU";

export const supabase = createClient(supabaseUrl, supabaseKey);
