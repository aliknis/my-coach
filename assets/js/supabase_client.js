import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ========================================
// CONFIGURATION
// ========================================
const SUPABASE_URL = "https://lzexnobseviwzzejnlfr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-Rm_n5vgNqqvjLI7olYvUg_CwX80ug0";
// const SUPABASE_URL = "http://127.0.0.1:54321";
// const SUPABASE_ANON_KEY = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
