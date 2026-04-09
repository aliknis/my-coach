import { supabase } from "../../assets/js/supabase_client.js";
// Simple connection test
const { data, error } = await supabase.auth.getUser();

if (error) {
  console.log("Not Logged In:", error.message);
  window.location.replace("../signin");
} else {
  console.log("Sign in Successful:", data);
}

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
    programs: "../programs",
    nutrition: "../nutrition",
    products: "../products",
    community: "../community/",
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
