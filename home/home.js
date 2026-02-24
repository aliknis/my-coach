import { supabase } from "../assets/js/supabase_client.js";
// Simple connection test
const { data, error } = await supabase.auth.getUser();

if (error) {
  console.log(":( No signin:", error.message);
  window.location.replace("../signin");
} else {
  console.log(":) signin successful:", data);
}
