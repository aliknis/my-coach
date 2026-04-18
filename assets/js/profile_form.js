import { supabase } from "./supabase_client.js";

const form = document.getElementById("fitnessForm");
const results = document.getElementById("results");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  results.classList.remove("hidden");
  results.innerHTML = `<div class="spinner"></div>Saving profile...`;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    results.innerHTML = `<p class="error">You must be logged in.</p>`;
    return;
  }

  // Build profile object using exact column names from schema
  const profile = {
    date_of_birth: document.getElementById("dob").value,
    height_cm: parseFloat(document.getElementById("height").value),
    current_weight: parseFloat(document.getElementById("weight").value),
    fitness_goal: document.getElementById("goal").value,
    fitness_level: document.getElementById("level").value,
    days_per_week: parseInt(document.getElementById("training_days").value, 10),
    dietary_pref: form.querySelector('input[name="diet"]:checked').value,
  };

  const { error: saveError } = await supabase
    .from("users")
    .update(profile)
    .eq("id", user.id);

  if (saveError) {
    console.error("Profile save error:", saveError);
    results.innerHTML = `<p class="error">Failed to save profile. Please try again.</p>`;
    return;
  }

  results.innerHTML = `
    <div class="success-message">Profile updated</div>
    <div class="button-group" style="display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: center;">
      <a href="../../programs" class="btn-secondary" >Browse Programs</a>
      <a href="../../nutrition" class="btn-secondary" ;">Browse Nutrition Plans</a>
    </div>
  `;
});
