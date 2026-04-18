import { supabase } from "./supabase_client.js";

const id = new URLSearchParams(location.search).get("id");
const main = document.getElementById("nutrition-detail");

async function load() {
  if (!id) {
    main.innerHTML = '<div class="error">No nutrition plan selected.</div>';
    return;
  }

  const { data: nutrition, error } = await supabase
    .from("nutrition")
    .select(
      "title, description, goal, dietary_pref, calories_target, protein_g, carbs_g, fats_g, details_html",
    )
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error) {
    console.error("Error fetching nutrition plan:", error);
    main.innerHTML =
      '<div class="error">Error loading nutrition plan. Please try again later.</div>';
    return;
  }

  if (!nutrition) {
    main.innerHTML =
      '<div class="error">Nutrition plan not found or not published.</div>';
    return;
  }

  // Escape HTML to prevent XSS
  const escapeHtml = (str) => {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };

  // Helper function to format enum values
  const fmt = (s) =>
    s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "—";

  // Render nutrition details
  main.innerHTML = `
    <section class="hero">
      <h2>${escapeHtml(nutrition.title)}</h2>
      <div class="program-description">${escapeHtml(nutrition.description || "A nutrition plan tailored to your goals.")}</div>
    </section>

    <section class="content-card">
      <div class="card-badges">
        ${nutrition.goal ? `<span class="badge goal">${fmt(nutrition.goal)}</span>` : ""}
        ${nutrition.dietary_pref ? `<span class="badge goal">${fmt(nutrition.dietary_pref)}</span>` : ""}
        ${nutrition.calories_target ? `<span class="badge goal">${nutrition.calories_target} kcal</span>` : ""}
      </div>
      <br>

      ${nutrition.details_html || '<div class="program-section"><p>No detailed information available for this nutrition plan.</p></div>'}
    </section>
  `;
}

load();

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
}

document
  .getElementById("select-btn")
  .addEventListener("click", () => selectNutrition());
