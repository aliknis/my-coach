import { supabase } from "./supabase_client.js";

const id = new URLSearchParams(location.search).get("id");
const main = document.getElementById("program-detail");

async function load() {
  if (!id) {
    main.innerHTML = '<div class="error">No program selected.</div>';
    return;
  }

  const { data: program, error } = await supabase
    .from("programs")
    .select(
      "title, description, goal, level, days_per_week, duration_weeks, details_html",
    )
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error) {
    console.error("Error fetching program:", error);
    main.innerHTML =
      '<div class="error">Error loading program. Please try again later.</div>';
    return;
  }

  if (!program) {
    main.innerHTML =
      '<div class="error">Program not found or not published.</div>';
    return;
  }

  // Escape HTML to prevent XSS
  const escapeHtml = (str) => {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };

  // Render program details
  main.innerHTML = `
               <section class="hero">
                  <h2>${escapeHtml(program.title)}</h2>
                <div class="program-description">${escapeHtml(program.description || "A program tailored to your goals.")}</div>
              </section>

              <section class="content-card">
                  <div class="card-badges">
                    ${program.level ? `<span class="badge goal">${escapeHtml(program.level)}</span>` : ""}
                    ${program.days_per_week ? `<span class="badge level">${program.days_per_week} days/week</span>` : ""}
                    ${program.duration_weeks ? `<span class="badge goal">${program.duration_weeks} weeks</span>` : ""}
                  </div>
                  <br>

                  ${program.details_html || '<div class="program-section"><p>No detailed information available for this program.</p></div>'}
              </section>
            `;
}

load();

async function selectProgram(programId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    alert("You must be logged in.");
    return;
  }

  const program_id =
    programId ?? new URLSearchParams(location.search).get("id");
  const { error: saveError } = await supabase
    .from("users")
    .update({ program_id: program_id })
    .eq("id", user.id);

  if (saveError) {
    console.error("Profile save error:", saveError);
    alert("Failed to save program. Please try again.");
    return;
  }

  console.log("Program selected successfully!");
  alert("Program selected successfully!");
}

document
  .getElementById("select-btn")
  .addEventListener("click", () => selectProgram());
