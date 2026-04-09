import { supabase } from "./supabase_client.js";
// Simple connection test
const { data, error } = await supabase.auth.getUser();

if (error) {
  console.log("Not Logged In:", error.message);
} else {
  console.log(":) signin successful:", data);
  window.location.replace("pages/dashboard/");
}

// Footer links navigation
const footerLinks = document.querySelectorAll(".footer-link");
const pageMap = {
  programs: "pages/programs/",
  nutrition: "pages/nutrition/",
  products: "pages//products/",
  progress: "pages/progress_tracking/",
  community: "pages/community/",
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
      window.location.href = "pages/signin/index.html";
    }
  });
});
