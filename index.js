import { supabase } from "./assets/js/supabase_client.js";
// Simple connection test
const { data, error } = await supabase.auth.getUser();

if (error) {
  console.log("Not Logged In:", error.message);
} else {
  console.log("Sign in Successful:", data);
  window.location.replace("home");
}

// Footer links navigation
const footerLinks = document.querySelectorAll(".footer-link");
const pageMap = {
  programs: "home#programs",
  nutrition: "home#nutrition",
  products: "home#products",
  progress: "home/progress_tracking/progress_tracking.html",
  community: "home/community_feed/community_feed.html",
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
      window.location.href = "signin";
    }
  });
});
