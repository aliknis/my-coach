import { supabase } from "./supabase_client.js";

// Profile menu toggle
const userProfileBtn = document.getElementById("userProfileBtn");
const userProfileMenu = document.getElementById("userProfileMenu");

if (userProfileBtn && userProfileMenu) {
  userProfileBtn.addEventListener("click", () => {
    userProfileMenu.classList.toggle("active");
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !userProfileBtn.contains(e.target) &&
      !userProfileMenu.contains(e.target)
    ) {
      userProfileMenu.classList.remove("active");
    }
  });
}

// Footer links navigation
document.addEventListener("DOMContentLoaded", () => {
  const footerLinks = document.querySelectorAll(".footer-link");
  const pageMap = {
    programs: "#programs",
    nutrition: "#nutrition",
    products: "#products",
    progress: "../progress_tracking/progress_tracking.html",
    community: "../community_feed/community_feed.html",
  };

  footerLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      const destination = pageMap[page];

      // For Progress and Community, always navigate to the page
      if (destination.includes(".html")) {
        window.location.href = destination;
      } else {
        // For Programs, Nutrition, Products, scroll to section
        document
          .querySelector(destination)
          ?.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});
