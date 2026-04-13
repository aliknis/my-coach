// ─────────────────────────────────────────────
// CONFIG — replace with your actual credentials
// ─────────────────────────────────────────────
const SUPABASE_URL = "https://lzexnobseviwzzejnlfr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-Rm_n5vgNqqvjLI7olYvUg_CwX80ug0";

const { createClient } = supabase; // from CDN global
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Latest weekly chart payload (for week selector after refresh) */
const weekChartState = { data: { current: {}, last: {} } };
let pageListenersBound = false;

function localDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Compute streak (consecutive distinct dates) from history progress_date */
function computeStreak(historyRows) {
  if (!historyRows.length) return 0;

  const distinct = [
    ...new Set(
      historyRows.map((r) => (r.progress_date ? new Date(r.progress_date + "T00:00:00").toDateString() : null)).filter(Boolean)
    ),
  ].sort((a, b) => new Date(b) - new Date(a));

  if (!distinct.length) return 0;
  let streak = 1;
  for (let i = 0; i < distinct.length - 1; i++) {
    const diff =
      (new Date(distinct[i]) - new Date(distinct[i + 1])) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

/**
 * Build challenge objects from user history.
 * programs.progress_mode: "sessions" (day steps) vs "cumulative_reps" (completed_day_index = running rep total).
 */
function buildChallengesFromHistory(historyRows, programsById) {
  if (!historyRows.length) return [];

  const todayStr = localDateString();

  // Group by program_id, then keep only the latest enrollment_id per program
  const rowsByProgram = new Map();
  historyRows.forEach((r) => {
    const pid = r.program_id;
    if (!rowsByProgram.has(pid)) rowsByProgram.set(pid, []);
    rowsByProgram.get(pid).push(r);
  });

  // For each program, find the max enrollment_id and keep only those rows
  for (const [pid, allRows] of rowsByProgram.entries()) {
    const maxEnrollment = Math.max(...allRows.map((r) => r.enrollment_id ?? 1));
    rowsByProgram.set(pid, allRows.filter((r) => (r.enrollment_id ?? 1) === maxEnrollment));
  }

  const challenges = [];
  for (const [programId, rows] of rowsByProgram.entries()) {
    const program = programsById[programId];
    if (!program) continue;

    const isRepsChallenge = program.progress_mode === "cumulative_reps";

    // Latest progress point for this program.
    const latest = [...rows].sort((a, b) => {
      const diA = a.completed_day_index ?? -1;
      const diB = b.completed_day_index ?? -1;
      if (diB !== diA) return diB - diA;
      return new Date((b.progress_date ?? "1970-01-01") + "T00:00:00") - new Date((a.progress_date ?? "1970-01-01") + "T00:00:00");
    })[0];

    const daysPerWeek = program.days_per_week ?? 1;
    const totalDays = (program.duration_weeks ?? 1) * daysPerWeek;

    const rawIndex = latest.completed_day_index;
    const completedIndex = isRepsChallenge
      ? (rawIndex ?? 0)
      : (rawIndex ?? 1);
    const doneDays = Math.min(
      Math.max(isRepsChallenge ? 0 : 1, completedIndex),
      totalDays
    );
    const pct = Math.min(Math.round((doneDays / totalDays) * 100), 100);

    const computedWeek = Math.ceil(Math.max(1, doneDays) / daysPerWeek);
    const computedDay = doneDays === 0 ? 0 : ((doneDays - 1) % daysPerWeek) + 1;
    const currentWeek = latest.completed_week ?? computedWeek;
    const currentDay = latest.completed_day ?? computedDay;

    const startedAt = rows.reduce((min, r) => {
      const d = r.progress_date ? new Date(r.progress_date + "T00:00:00") : null;
      if (!d) return min;
      return !min || d < min ? d : min;
    }, null);

    let todayReps = 0;
    if (isRepsChallenge) {
      const priorMax = Math.max(
        0,
        ...rows.filter((r) => r.progress_date < todayStr).map((r) => r.completed_day_index ?? 0)
      );
      const todayIdx = rows
        .filter((r) => r.progress_date === todayStr)
        .reduce((m, r) => Math.max(m, r.completed_day_index ?? 0), 0);
      todayReps = Math.max(0, todayIdx - priorMax);
    }

    let milestone = null;
    if (pct >= 100) milestone = { label: "Completed! 🎉", cls: "badge-done" };
    else if (pct >= 75) milestone = { label: "Last Stretch 🔥", cls: "badge-fire" };
    else if (pct >= 50) milestone = { label: "Halfway 💪", cls: "badge-half" };
    else if (pct >= 25) milestone = { label: "Getting There ⚡", cls: "badge-start" };

    challenges.push({
      id: programId,
      programTitle: program.title ?? "Program",
      programGoal: program.goal ?? "",
      programLevel: program.level ?? "",
      currentWeek,
      currentDay,
      totalWeeks: program.duration_weeks ?? "?",
      daysPerWeek,
      pct,
      milestone,
      isActive: pct < 100,
      startedAt: startedAt ? startedAt.toISOString() : null,
      repsChallenge: isRepsChallenge,
      pushupTotal: isRepsChallenge ? doneDays : undefined,
      pushupGoal: isRepsChallenge ? totalDays : undefined,
      todayReps: isRepsChallenge ? todayReps : undefined,
    });
  }

  challenges.sort((a, b) => b.pct - a.pct);
  return challenges;
}

/** Turn a goal ENUM string into a readable label */
function goalLabel(goalStr) {
  const map = {
    lose_weight: "Lose Weight",
    build_muscle: "Build Muscle",
    improve_endurance: "Improve Endurance",
    stay_fit: "Stay Fit",
    maintain: "Maintain",
    performance: "Performance",
  };
  return map[goalStr] ?? goalStr;
}

/** Advance one session for today (upsert by user + program + date).
 *  Returns { error, justCompleted, programTitle, nextIndex, totalDays } */
async function markTodaysSession(userId, programIdStr) {
  const programId = Number(programIdStr);
  const today = localDateString();

  const { data: program, error: programError } = await db
    .from("programs")
    .select("title, duration_weeks, days_per_week, progress_mode")
    .eq("id", programId)
    .single();

  if (programError) return { error: programError };
  if (program?.progress_mode === "cumulative_reps") return { error: null };

  // Get the latest enrollment for this user+program
  const { data: topRows, error: historyErr } = await db
    .from("user_program_progress_history")
    .select("completed_day_index, enrollment_id")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .order("enrollment_id", { ascending: false })
    .order("completed_day_index", { ascending: false })
    .limit(1);

  if (historyErr) return { error: historyErr };

  const daysPerWeek = Math.max(1, program?.days_per_week ?? 1);
  const totalDays = Math.max(1, (program?.duration_weeks ?? 1) * daysPerWeek);
  const latest = topRows?.[0]?.completed_day_index ?? 0;
  const enrollmentId = topRows?.[0]?.enrollment_id ?? 1;

  if (latest >= totalDays) return { error: null };

  const nextIndex = Math.min(latest + 1, totalDays);
  const week = Math.ceil(nextIndex / daysPerWeek);
  const day = ((nextIndex - 1) % daysPerWeek) + 1;

  const { error } = await db.from("user_program_progress_history").upsert(
    {
      user_id: userId,
      program_id: programId,
      enrollment_id: enrollmentId,
      progress_date: today,
      completed_week: week,
      completed_day: day,
      completed_day_index: nextIndex,
      meta: { source: "progress_tracking.mark_session" },
    },
    { onConflict: "user_id,program_id,enrollment_id,progress_date" }
  );

  return {
    error: error ?? null,
    justCompleted: nextIndex >= totalDays,
    programTitle: program?.title ?? "Program",
    nextIndex,
    totalDays,
  };
}

/** Add push-ups for today; cumulative reps stored in user_program_progress_history.completed_day_index.
 *  Returns { error, oldTotal, newTotal, goal } so caller can trigger congrats popup. */
async function addPushupRepsViaHistory(userId, programIdStr, reps) {
  const programId = Number(programIdStr);
  const today = localDateString();

  // ── Prevent negative / zero reps ──
  if (!Number.isFinite(reps) || reps <= 0) {
    return { error: { message: "Reps must be a positive number." } };
  }

  const { data: program, error: programError } = await db
    .from("programs")
    .select("duration_weeks, days_per_week, progress_mode")
    .eq("id", programId)
    .single();
  if (programError) return { error: programError };
  if (program?.progress_mode !== "cumulative_reps") {
    return { error: { message: "This program does not use rep logging." } };
  }

  const daysPerWeek = Math.max(1, program?.days_per_week ?? 1);
  const totalDays = Math.max(1, (program?.duration_weeks ?? 1) * daysPerWeek);

  const { data: rows, error: histErr } = await db
    .from("user_program_progress_history")
    .select("progress_date, completed_day_index, enrollment_id")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .order("progress_date", { ascending: true });
  if (histErr) return { error: histErr };

  const list = rows ?? [];
  // Use the latest enrollment_id
  const enrollmentId = list.length ? Math.max(...list.map((r) => r.enrollment_id ?? 1)) : 1;
  const enrollmentRows = list.filter((r) => (r.enrollment_id ?? 1) === enrollmentId);

  const priorMax = Math.max(
    0,
    ...enrollmentRows.filter((r) => r.progress_date < today).map((r) => r.completed_day_index ?? 0)
  );
  const todayRows = enrollmentRows.filter((r) => r.progress_date === today);
  const todayMax = todayRows.length ? Math.max(...todayRows.map((r) => r.completed_day_index ?? 0)) : 0;
  const base = todayRows.length ? todayMax : priorMax;
  const oldTotal = base;
  const newTotal = Math.min(base + reps, totalDays);

  const week = 1;
  const dayInWeek = Math.max(1, Math.min(newTotal, daysPerWeek));
  const { error } = await db.from("user_program_progress_history").upsert(
    {
      user_id: userId,
      program_id: programId,
      enrollment_id: enrollmentId,
      progress_date: today,
      completed_week: week,
      completed_day: dayInWeek,
      completed_day_index: newTotal,
      meta: { source: "progress_tracking.cumulative_reps" },
    },
    { onConflict: "user_id,program_id,enrollment_id,progress_date" }
  );
  return { error: error ?? null, oldTotal, newTotal, goal: totalDays };
}

/** Restart a completed challenge: create a new enrollment with index 0 */
async function restartChallenge(userId, programIdStr) {
  const programId = Number(programIdStr);
  const today = localDateString();

  // Find the highest enrollment_id for this user+program
  const { data: topRow } = await db
    .from("user_program_progress_history")
    .select("enrollment_id")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .order("enrollment_id", { ascending: false })
    .limit(1);

  const nextEnrollment = (topRow?.[0]?.enrollment_id ?? 0) + 1;

  const { error } = await db.from("user_program_progress_history").insert({
    user_id: userId,
    program_id: programId,
    enrollment_id: nextEnrollment,
    progress_date: today,
    completed_week: 1,
    completed_day: 0,
    completed_day_index: 0,
    meta: { source: "progress_tracking.restart_challenge" },
  });
  return error ?? null;
}

// ─────────────────────────────────────────────
// CONGRATS POPUP
// ─────────────────────────────────────────────
function showCongratsPopup(programTitle, current, total, isReps) {
  const overlay = document.getElementById("congratsOverlay");
  const message = document.getElementById("congratsMessage");
  const detail = document.getElementById("congratsDetail");
  if (!overlay) return;

  message.textContent = `You completed ${programTitle}!`;
  detail.textContent = isReps
    ? `${current} / ${total} reps completed — amazing work!`
    : `${current} / ${total} sessions done — you crushed it!`;

  overlay.classList.add("visible");
  spawnConfetti();
}

function hideCongratsPopup() {
  const overlay = document.getElementById("congratsOverlay");
  if (overlay) overlay.classList.remove("visible");
}

function spawnConfetti() {
  const burst = document.getElementById("confettiBurst");
  if (!burst) return;
  burst.innerHTML = "";
  const colors = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff922b", "#cc5de8", "#20c997", "#f06595"];
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--x", `${(Math.random() - 0.5) * 500}px`);
    piece.style.setProperty("--y", `${-Math.random() * 400 - 100}px`);
    piece.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
    piece.style.setProperty("--d", `${Math.random() * 0.6 + 0.6}s`);
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    burst.appendChild(piece);
  }
}

function bindPageListenersOnce(getUserId) {
  if (pageListenersBound) return;
  pageListenersBound = true;

  const filterHost = document.querySelector("#challenges .filters");
  filterHost?.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filterHost.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    applyChallengeFilter(btn.dataset.filter || "all");
  });

  document.getElementById("challengesList")?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".challenge-complete-btn");
    if (!btn || btn.disabled) return;
    const pid = btn.dataset.programId;
    if (!pid) return;
    btn.disabled = true;
    try {
      const result = await markTodaysSession(getUserId(), pid);
      if (result.error) {
        console.error("Could not save progress:", result.error);
      } else {
        // ── Congrats popup when session-based challenge just completed ──
        if (result.justCompleted) {
          showCongratsPopup(result.programTitle, result.nextIndex, result.totalDays, false);
        }
        await loadAndRender(getUserId());
      }
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("challengesList")?.addEventListener("submit", async (e) => {
    const form = e.target.closest(".pushup-reps-form");
    if (!form) return;
    e.preventDefault();
    const pid = form.dataset.programId;
    const input = form.querySelector('input[name="reps"]');
    const hint = form.querySelector(".reps-form-hint");
    const reps = parseInt(input?.value, 10);
    // ── Prevent negative / zero reps ──
    if (!pid || !Number.isFinite(reps) || reps < 1 || reps > 500) {
      if (hint) hint.textContent = "Enter reps between 1 and 500.";
      return;
    }
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (hint) hint.textContent = "";
    const result = await addPushupRepsViaHistory(getUserId(), pid, reps);
    if (submitBtn) submitBtn.disabled = false;
    if (result.error) {
      if (hint) hint.textContent = result.error.message ?? "Could not save.";
      return;
    }
    // ── Congrats popup: did user just hit or exceed target? ──
    if (result.oldTotal < result.goal && result.newTotal >= result.goal) {
      const title = form.closest(".challenge-card")?.querySelector(".challenge-title")?.textContent || "your challenge";
      showCongratsPopup(title, result.newTotal, result.goal, true);
    }
    input.value = "20";
    await loadAndRender(getUserId());
  });

  // ── Restart Challenge handler ──
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".challenge-restart-btn");
    if (!btn || btn.disabled) return;
    const pid = btn.dataset.programId;
    if (!pid) return;
    btn.disabled = true;
    btn.textContent = "Restarting…";
    const err = await restartChallenge(getUserId(), pid);
    if (err) console.error("Could not restart:", err);
    await loadAndRender(getUserId());
    btn.disabled = false;
  });

  // ── Congrats dismiss ──
  document.getElementById("congratsDismiss")?.addEventListener("click", hideCongratsPopup);
  document.getElementById("congratsOverlay")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) hideCongratsPopup();
  });

  document.getElementById("weekSelector")?.addEventListener("change", (e) => {
    const mode = e.target.value === "last" ? "last" : "current";
    renderChart(weekChartState.data, mode);
  });
}

// ─────────────────────────────────────────────
// RENDER — Stats Cards
// ─────────────────────────────────────────────
function renderStats({ streak, activeCount, workoutsThisMonth, user, nutrition }) {
  document.getElementById("statStreak").textContent = `${streak} days`;
  document.getElementById("statActivePrograms").textContent =
    `${activeCount} active program${activeCount !== 1 ? "s" : ""}`;
  document.getElementById("statWorkouts").textContent = workoutsThisMonth;

  const kgLost =
    user?.starting_weight && user?.current_weight
      ? (user.starting_weight - user.current_weight).toFixed(1)
      : null;
  document.getElementById("statKgLost").textContent = kgLost !== null ? `${kgLost} kg` : "—";
  document.getElementById("statWeightRange").textContent =
    user?.starting_weight && user?.current_weight
      ? `${user.starting_weight} kg → ${user.current_weight} kg`
      : "No weight data";

  if (nutrition?.logged && nutrition?.target) {
    const score = Math.round((nutrition.logged / nutrition.target) * 100);
    document.getElementById("statNutrition").textContent = `${score}%`;
    document.getElementById("statProtein").textContent =
      `${nutrition.logged}g / ${nutrition.target}g protein`;
  } else {
    document.getElementById("statNutrition").textContent = "—";
    document.getElementById("statProtein").textContent = "No nutrition log today";
  }
}

// ─────────────────────────────────────────────
// RENDER — Challenges (= Goals) — all in one list
// ─────────────────────────────────────────────
function renderChallenges(challenges) {
  const list = document.getElementById("challengesList");
  list.innerHTML = "";

  if (!challenges.length) {
    list.innerHTML = `<p class="empty-state">No programs enrolled yet. Browse programs to start a challenge!</p>`;
    return;
  }

  challenges.forEach((ch) => {
    const isCompleted = ch.pct >= 100;
    const safeLevel = ch.programLevel ?? "";
    const level =
      safeLevel.length > 0
        ? safeLevel.charAt(0).toUpperCase() + safeLevel.slice(1)
        : "";
    const goal = goalLabel(ch.programGoal);
    const goalKey = String(ch.programGoal ?? "");

    const tagsHtml = ch.repsChallenge
      ? `<span class="challenge-tag">${goal || "Challenge"}</span><span class="challenge-tag">${ch.pushupGoal ?? 1000} total reps</span><span class="challenge-tag">Log any amount</span>`
      : `<span class="challenge-tag">${level}</span><span class="challenge-tag">${goal}</span><span class="challenge-tag">${ch.totalWeeks}w · ${ch.daysPerWeek}d/wk</span>`;

    const metaHtml = ch.repsChallenge
      ? `<span>${ch.pushupTotal ?? 0} / ${ch.pushupGoal ?? 0} reps</span><span>Today: ${ch.todayReps ?? 0}</span><span>Left: ${Math.max(0, (ch.pushupGoal ?? 0) - (ch.pushupTotal ?? 0))}</span>`
      : `<span>Week ${ch.currentWeek} / ${ch.totalWeeks}</span><span>Day ${ch.currentDay} / ${ch.daysPerWeek}</span><span>Started ${
          ch.startedAt
            ? new Date(ch.startedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : "—"
        }</span>`;

    let actionsHtml;
    if (isCompleted) {
      actionsHtml = `<div class="challenge-actions">
          <button type="button" class="challenge-restart-btn"
            data-program-id="${ch.id}">
            🔄 Restart Challenge
          </button>
        </div>`;
    } else if (ch.repsChallenge) {
      actionsHtml = `<form class="pushup-reps-form challenge-actions" data-program-id="${ch.id}" autocomplete="off">
          <div class="reps-input-row">
            <label class="sr-only" for="pushup-reps-${ch.id}">Reps to add</label>
            <input type="number" id="pushup-reps-${ch.id}" name="reps" min="1" max="500" step="1" value="20" required />
            <button type="submit" class="reps-add-btn">Add reps</button>
          </div>
          <p class="reps-form-hint" aria-live="polite"></p>
        </form>`;
    } else {
      actionsHtml = `<div class="challenge-actions">
          <button type="button" class="challenge-complete-btn"
            data-program-id="${ch.id}">
            Mark today's session done
          </button>
        </div>`;
    }

    list.insertAdjacentHTML(
      "beforeend",
      `<article class="challenge-card ${isCompleted ? "challenge-done" : ""}"
               data-goal="${goalKey}" data-status="${isCompleted ? "completed" : "active"}">
        <div class="challenge-header">
          <div class="challenge-title-group">
            <h4 class="challenge-title">${ch.programTitle}</h4>
            <div class="challenge-tags">
              ${tagsHtml}
            </div>
          </div>
          ${ch.milestone ? `<span class="challenge-badge ${ch.milestone.cls}">${ch.milestone.label}</span>` : ""}
        </div>

        <div class="challenge-progress">
          <div class="challenge-track">
            <div class="challenge-fill" style="width: ${ch.pct}%"></div>
          </div>
          <span class="challenge-pct">${ch.pct}%</span>
        </div>

        <div class="challenge-meta">
          ${metaHtml}
        </div>

        <div class="challenge-milestones">
          ${[25, 50, 75, 100].map((m) =>
            `<div class="milestone-pip ${ch.pct >= m ? "reached" : ""}" title="${m}%">
              <span class="pip-dot"></span>
              <span class="pip-label">${m}%</span>
            </div>`
          ).join("")}
        </div>

        ${actionsHtml}
      </article>`
    );
  });
}

// ─────────────────────────────────────────────
// FILTER — by program goal or completed status
// ─────────────────────────────────────────────
function applyChallengeFilter(filterValue) {
  const key = filterValue || "all";
  document.querySelectorAll(".challenge-card").forEach((card) => {
    const g = card.dataset.goal ?? "";
    const status = card.dataset.status ?? "active";
    let match;
    if (key === "all") {
      match = true; // show everything
    } else if (key === "completed") {
      match = status === "completed";
    } else {
      match = g === key;
    }
    card.classList.toggle("hidden", !match);
  });
}

// ─────────────────────────────────────────────
// RENDER — Weekly Chart
// ─────────────────────────────────────────────
function renderChart(weeklyData, mode = "current") {
  const bars = document.querySelectorAll("#weeklyChart .bar");
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  bars.forEach((bar, i) => {
    const value = weeklyData[mode]?.[days[i]] ?? 0;
    bar.style.removeProperty("width");
    bar.style.removeProperty("--bar-size");
    bar.classList.remove("bar-empty");
    bar.style.height = `${Math.max(value, 5)}%`;
    bar.setAttribute("title", `${days[i]}: ${value} min`);
  });
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
async function loadAndRender(userId) {
  const { data: userProfile } = await db
    .from("users")
    .select("starting_weight, current_weight, fitness_goal, fitness_level")
    .eq("id", userId)
    .single();

  // Progress history (timeline) per program.
  let historyRows = [];
  const { data: loadedHistoryRows, error: historyError } = await db
    .from("user_program_progress_history")
    .select("id, program_id, enrollment_id, progress_date, completed_week, completed_day, completed_day_index")
    .eq("user_id", userId)
    .order("progress_date", { ascending: true });

  if (historyError) {
    console.error("Failed to load progress history:", historyError);
    historyRows = [];
  } else {
    historyRows = loadedHistoryRows ?? [];
  }

  const programIds = [...new Set((historyRows ?? []).map((r) => r.program_id).filter(Boolean))];

  let programsRows = [];
  if (programIds.length) {
    const { data: pRows, error: programsError } = await db
      .from("programs")
      .select("id, title, goal, level, duration_weeks, days_per_week, progress_mode")
      .in("id", programIds);
    if (programsError) {
      console.error("Failed to load programs:", programsError);
      programsRows = [];
    } else {
      programsRows = pRows ?? [];
    }
  }

  const programsById = programsRows.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const today = localDateString();
  const { data: nutritionLog } = await db
    .from("nutrition")
    .select("protein_g")
    .eq("user_id", userId)
    .eq("type", "log")
    .eq("log_date", today)
    .single();

  const { data: nutritionPlan } = await db
    .from("nutrition")
    .select("protein_g")
    .is("user_id", null)
    .eq("type", "plan")
    .eq("is_published", true)
    .eq("goal", userProfile?.fitness_goal ?? "maintain")
    .limit(1)
    .single();

  const all = historyRows ?? [];
  const now  = new Date();

  const streak = computeStreak(all);
  const challenges = buildChallengesFromHistory(all, programsById);

  const activeCount = challenges.filter((c) => c.isActive).length;

  // "Workouts completed": count progress points recorded in the current month.
  const workoutsThisMonth = all.filter((r) => {
    if (!r.progress_date) return false;
    const d = new Date(r.progress_date + "T00:00:00");
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const nutrition = {
    logged: nutritionLog?.protein_g ?? null,
    target: nutritionPlan?.protein_g ?? null,
  };

  // Weekly chart
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);
  startOfLastWeek.setHours(0, 0, 0, 0);

  const weeklyData = { current: {}, last: {} };
  dayNames.forEach((d) => {
    weeklyData.current[d] = 0;
    weeklyData.last[d] = 0;
  });
  all.forEach((r) => {
    if (!r.progress_date) return;
    const d = new Date(r.progress_date + "T00:00:00");
    const dayName = dayNames[d.getDay()];
    const diffSOW = d - startOfWeek;
    const diffSOLW = d - startOfLastWeek;
    if (diffSOW >= 0 && diffSOW < 7 * 86400000) {
      weeklyData.current[dayName] = Math.min((weeklyData.current[dayName] || 0) + 60, 100);
    } else if (diffSOLW >= 0 && diffSOLW < 7 * 86400000) {
      weeklyData.last[dayName] = Math.min((weeklyData.last[dayName] || 0) + 60, 100);
    }
  });

  weekChartState.data = weeklyData;

  renderStats({ streak, activeCount, workoutsThisMonth, user: userProfile, nutrition });
  renderChallenges(challenges);

  const activeFilter =
    document.querySelector("#challenges .filter-btn.active")?.dataset.filter || "all";
  applyChallengeFilter(activeFilter);

  const weekSel = document.getElementById("weekSelector");
  renderChart(weeklyData, weekSel?.value === "last" ? "last" : "current");
}

async function init() {
  const { data: { user: authUser } } = await db.auth.getUser();
  if (!authUser) {
    console.warn("No user logged in.");
    return;
  }

  const userId = authUser.id;
  bindPageListenersOnce(() => userId);
  await loadAndRender(userId);
}

init();