import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dhffwkiqfsbsjqmcivqf.supabase.co";
const supabaseKey = "sb_publishable_SlgVJl5Wb6rtCiUSVUDaqg_Y2JgJzNr";

export const supabase = createClient(supabaseUrl, supabaseKey);
