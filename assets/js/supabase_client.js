import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ========================================
// CONFIGURATION
// ========================================
const SUPABASE_URL = "https://lzexnobseviwzzejnlfr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-Rm_n5vgNqqvjLI7olYvUg_CwX80ug0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
