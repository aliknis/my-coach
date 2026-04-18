import { supabase } from "./supabase_client.js";

// ── Auth & profile ────────────────────────────────────────────
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) window.location.replace("../signin/");

const { data: profile } = await supabase
  .from("users")
  .select("fitness_goal, fitness_level, program_id")
  .eq("id", user.id)
  .single();

if (!profile?.fitness_goal || !profile?.fitness_level) {
  window.location.href = "../forms/profile/";
}

// ── Fetch programs ────────────────────────────────────────────
const { data: programs, error } = await supabase
  .from("programs") // Changed back to "programs" table
  .select("id, title, description, goal, level, days_per_week, duration_weeks")
  .eq("is_published", true)
  .order("goal")
  .order("title");

if (error) {
  ["selected-content", "recommended-content", "all-content"].forEach(
    (id) =>
      (document.getElementById(id).innerHTML =
        '<p class="empty-state">Failed to load programs.</p>'),
  );
}

// ── Helpers ───────────────────────────────────────────────────
const fmt = (s) =>
  s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "—";

function buildCard(p, selected = false) {
  return `
    <div class="program-card${selected ? " is-selected" : ""}">
      <br>
      <div class="card-badges">
        <span class="badge goal">${fmt(p.goal)}</span>
        <span class="badge level">${fmt(p.level)}</span>
      </div>
      <br>
      <h4>${p.title}</h4>
      <p class="program-description">${p.description ?? "No description provided."}</p>
      <div class="card-meta">
        <div class="meta-item">
          <span class="meta-label">Days/Week</span>
          <span class="meta-value">${p.days_per_week ?? "—"}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Duration</span>
          <span class="meta-value">${p.duration_weeks ? p.duration_weeks + " wks" : "—"}</span>
        </div>
      </div>
      <br>

      <div class="program-actions">
          <a class="btn-learn-more" href="details?id=${p.id}">Learn More</a>
          <button class="btn-select" data-id="${p.id}">Select Program</button>
      </div>
      <br>
    </div>`;
}

function fill(id, items, empty) {
  document.getElementById(id).innerHTML = items.length
    ? items.map((p) => buildCard(p)).join("")
    : `<p class="empty-state">${empty}</p>`;
}

// ── Render ────────────────────────────────────────────────────
const list = programs ?? [];

// Your program (single card, marked selected)
const yours = list.find((p) => p.id === profile?.program_id) ?? null;
document.getElementById("selected-content").innerHTML = yours
  ? buildCard(yours, true)
  : '<p class="empty-state">No program selected yet. Browse programs and pick one.</p>';

// Recommended — same goal + level, exclude selected
fill(
  "recommended-content",
  list.filter(
    (p) => p.goal === profile.fitness_goal && p.level === profile.fitness_level,
  ),
  "No matching programs found for your goal and level.",
);

// All programs — flat grid, badges already show goal/level
fill("all-content", list, "No programs available.");

// ── Select Program ────────────────────────────────────────────
async function selectProgram(programId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    alert("You must be logged in.");
    return;
  }

  const id = programId ?? new URLSearchParams(location.search).get("id");
  const { error: saveError } = await supabase
    .from("users")
    .update({ program_id: id })
    .eq("id", user.id);

  if (saveError) {
    console.error("Profile save error:", saveError);
    alert("Failed to save program. Please try again.");
    return;
  }

  console.log("Program selected successfully!");
  alert("Program selected successfully!");
  window.location.reload(); // Refresh to update the selected program
}

// Attach event listeners to all "Select Program" buttons
document.querySelectorAll(".btn-select").forEach((btn) => {
  btn.addEventListener("click", () => {
    const programId = btn.dataset.id;
    selectProgram(programId);
  });
});
