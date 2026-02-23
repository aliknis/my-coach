import { supabase } from "./supabase_client.js";
// Simple connection test
const { data, error } = await supabase.from("account").select("*").limit(1);

if (error) {
  console.log(":( Connection to server failed:", error.message);
} else {
  console.log(":) Connected to server! Data:", data);
}
