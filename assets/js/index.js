import { supabase } from "./supabase_client.js";
// Simple connection test
const { data, error } = await supabase.auth.getUser();

if (error) {
  console.log(":( No signin:", error.message);
} else {
  console.log(":) signin successful:", data);
  window.location.replace("../home/main_page.html");
}

// Footer links navigation
const footerLinks = document.querySelectorAll(".footer-link");
const pageMap = {
  programs: "../p_p/personalized-programs.html",
  nutrition: "../nutrition/nutrition-guidance.html",
  products: "../products/products.html",
  progress: "../progress_tracking/progress_tracking.html",
  community: "../community_feed/community_feed.html",
};

footerLinks.forEach((link) => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const page = link.getAttribute("data-page");
    const destination = pageMap[page];

    // Check if user is logged in
    const { data: session } = await supabase.auth.getSession();

    if (session?.session) {
      // User is logged in, navigate directly
      window.location.href = destination;
    } else {
      // User is not logged in, redirect to login
      window.location.href = "../signin/index.html";
    }
  });
});
