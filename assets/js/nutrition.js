import { supabase } from "./supabase_client.js";

// ── Auth & profile ────────────────────────────────────────────
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) window.location.replace("../signin/");

const { data: profile } = await supabase
  .from("users")
  .select("fitness_goal, dietary_pref, nutrition_id")
  .eq("id", user.id)
  .single();

if (!profile?.fitness_goal || !profile?.dietary_pref) {
  window.location.href = "../forms/profile/";
}

// ── Fetch nutrition plans ────────────────────────────────────
const { data: nutritionPlans, error } = await supabase
  .from("nutrition")
  .select(
    "id, title, description, goal, dietary_pref, calories_target, protein_g, carbs_g, fats_g",
  )
  .eq("is_published", true)
  .order("goal")
  .order("title");

if (error) {
  ["selected-content", "recommended-content", "all-content"].forEach(
    (id) =>
      (document.getElementById(id).innerHTML =
        '<p class="empty-state">Failed to load nutrition plans.</p>'),
  );
}

// ── Helpers ───────────────────────────────────────────────────
const fmt = (s) =>
  s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "—";

function buildCard(n, selected = false) {
  return `
    <div class="program-card${selected ? " is-selected" : ""}">
      <br>
      <div class="card-badges">
        <span class="badge goal">${fmt(n.goal)}</span>
        <span class="badge goal">${fmt(n.dietary_pref)}</span>
      </div>
      <br>
      <h4>${n.title}</h4>
      <p class="program-description">${n.description ?? "No description provided."}</p>
      <div class="card-meta">
        <div class="meta-item">
          <span class="meta-label">Calories</span>
          <span class="meta-value">${n.calories_target ?? "—"}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Protein</span>
          <span class="meta-value">${n.protein_g ? n.protein_g + "g" : "—"}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Carbs</span>
          <span class="meta-value">${n.carbs_g ? n.carbs_g + "g" : "—"}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Fats</span>
          <span class="meta-value">${n.fats_g ? n.fats_g + "g" : "—"}</span>
        </div>
      </div>
      <br>

      <div class="program-actions">
          <a class="btn-learn-more" href="details?id=${n.id}">Learn More</a>
          <button class="btn-select" data-id="${n.id}">Select Nutrition Plan</button>
      </div>
      <br>
    </div>`;
}

function fill(id, items, empty) {
  document.getElementById(id).innerHTML = items.length
    ? items.map((n) => buildCard(n)).join("")
    : `<p class="empty-state">${empty}</p>`;
}

// ── Render ────────────────────────────────────────────────────
const list = nutritionPlans ?? [];

// Your nutrition plan (single card, marked selected)
const yours = list.find((n) => n.id === profile?.nutrition_id) ?? null;
document.getElementById("selected-content").innerHTML = yours
  ? buildCard(yours, true)
  : '<p class="empty-state">No nutrition plan selected yet. Browse plans and pick one.</p>';

// Recommended — same goal + dietary preference, exclude selected
fill(
  "recommended-content",
  list.filter(
    (n) =>
      n.goal === profile.fitness_goal &&
      n.dietary_pref === profile.dietary_pref,
  ),
  "No matching nutrition plans found for your goal and dietary preference.",
);

// All nutrition plans — flat grid, badges already show goal/dietary preference
fill("all-content", list, "No nutrition plans available.");

// ── Select Nutrition Plan ────────────────────────────────────
async function selectNutrition(nutritionId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    alert("You must be logged in.");
    return;
  }

  const nutrition_id =
    nutritionId ?? new URLSearchParams(location.search).get("id");
  const { error: saveError } = await supabase
    .from("users")
    .update({ nutrition_id: nutrition_id })
    .eq("id", user.id);

  if (saveError) {
    console.error("Profile save error:", saveError);
    alert("Failed to save nutrition plan. Please try again.");
    return;
  }

  console.log("Nutrition plan selected successfully!");
  alert("Nutrition plan selected successfully!");
  window.location.reload(); // Refresh to update the selected plan
}

// Attach event listeners to all "Select Nutrition Plan" buttons
document.querySelectorAll(".btn-select").forEach((btn) => {
  btn.addEventListener("click", () => {
    const nutritionId = btn.dataset.id;
    selectNutrition(nutritionId);
  });
});
