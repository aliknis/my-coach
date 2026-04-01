import { supabase } from "./supabase_client.js";

const TEST_LOGIN_KEY = "mycoach_test_login";

async function updateBackButtons() {
  const [{ data: userData }, { data: sessionData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);

  const isLoggedIn =
    sessionStorage.getItem(TEST_LOGIN_KEY) === "true" ||
    !!userData.user ||
    !!sessionData.session;

  const buttons = document.querySelectorAll("[data-back-button]");
  buttons.forEach((button) => {
    if (!(button instanceof HTMLAnchorElement)) return;

    if (isLoggedIn) {
      button.href = "../home/main_page.html";
      button.textContent = "Go to Dashboard";
      button.classList.remove("signin");
      button.classList.add("signup");
    } else {
      button.href = "../welcome_page/welcome_page.html";
      button.textContent = "Back to Main Page";
      button.classList.remove("signup");
      button.classList.add("signin");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateBackButtons().catch((error) => {
    console.error("Failed to update support buttons:", error);
  });

  supabase.auth.onAuthStateChange(() => {
    updateBackButtons().catch((error) => {
      console.error("Failed to refresh support buttons:", error);
    });
  });
});
