import { supabase } from "./supabase_client.js";

const PLACEHOLDER_AVATAR = "../../assets/images/user.png";

const periodRpcMap = {
  weekly: "week",
  monthly: "month",
  "all-time": "all-time",
};

let currentLeaderboardFilter = "weekly";

async function requireAuth() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    window.location.replace("../signin/");
    return null;
  }
  return user;
}

function utcToday() {
  return new Date().toISOString().slice(0, 10);
}

function difficultyLabel(d) {
  const map = { easy: "Easy", medium: "Medium", hard: "Hard" };
  return map[d] || d;
}

function difficultyEmoji(d) {
  const map = { easy: "🌱", medium: "⚡", hard: "🔥" };
  return map[d] || "💪";
}

async function ensureChallenges(dateStr) {
  const { error } = await supabase.rpc("ensure_community_daily_challenges", {
    p_date: dateStr,
  });
  if (error) console.error("ensure_community_daily_challenges", error);
  return !error;
}

async function fetchTodaysChallenges(dateStr) {
  const { data, error } = await supabase
    .from("community_daily_challenges")
    .select("id,difficulty,points,title,description,challenge_date")
    .eq("challenge_date", dateStr)
    .order("difficulty", { ascending: true });
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

async function fetchMyCompletionIds() {
  const { data, error } = await supabase
    .from("user_challenge_completions")
    .select("challenge_id");
  if (error) {
    console.error(error);
    return new Set();
  }
  return new Set((data || []).map((r) => r.challenge_id));
}

async function completeChallenge(challengeId, userId) {
  const { error } = await supabase.from("user_challenge_completions").insert({
    challenge_id: challengeId,
    user_id: userId,
  });
  return error;
}

async function fetchLeaderboard(periodKey) {
  const rpcPeriod = periodRpcMap[periodKey] || "week";
  const { data, error } = await supabase.rpc("get_community_leaderboard", {
    p_period: rpcPeriod,
  });
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

async function fetchCommunityStats() {
  const { data, error } = await supabase.rpc("get_community_stats");
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

async function fetchAchievements() {
  const { data, error } = await supabase.rpc(
    "get_recent_community_achievements",
    { p_limit: 6 },
  );
  if (error) {
    console.error(error);
    return [];
  }
  return data || [];
}

async function fetchMyStats() {
  const { data, error } = await supabase.rpc("get_my_community_stats");
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

function formatNumber(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return Number(n).toLocaleString();
}

function renderCommunityStats(stats) {
  const grid = document.getElementById("communityStatsGrid");
  if (!grid) return;
  if (!stats) {
    grid.innerHTML =
      '<p class="community-msg">Could not load community stats.</p>';
    return;
  }
  grid.innerHTML = `
    <div class="stat-box">
      <div class="stat-number">${formatNumber(stats.total_members)}</div>
      <div class="stat-label">Total Members</div>
      <div class="stat-icon">👥</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${formatNumber(stats.challenges_completed)}</div>
      <div class="stat-label">Challenges Completed</div>
      <div class="stat-icon">✅</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${formatNumber(stats.active_this_week)}</div>
      <div class="stat-label">Active This Week</div>
      <div class="stat-icon">📈</div>
    </div>
    <div class="stat-box">
      <div class="stat-number">${formatNumber(stats.points_distributed)}</div>
      <div class="stat-label">Points Distributed</div>
      <div class="stat-icon">🎯</div>
    </div>
  `;
}

function renderQuickStats(myStats, leaderboardFilter) {
  const rankEl = document.getElementById("yourRankValue");
  const ptsEl = document.getElementById("yourPointsValue");
  const weekEl = document.getElementById("weekPointsValue");
  const streakEl = document.getElementById("streakValue");
  if (!myStats || !myStats.logged_in) {
    if (rankEl) rankEl.textContent = "—";
    if (ptsEl) ptsEl.textContent = "—";
    if (weekEl) weekEl.textContent = "—";
    if (streakEl) streakEl.textContent = "—";
    return;
  }
  let rank = myStats.rank_week;
  if (leaderboardFilter === "monthly") rank = myStats.rank_month;
  if (leaderboardFilter === "all-time") rank = myStats.rank_all;
  if (rankEl) rankEl.textContent = rank != null ? `#${rank}` : "—";
  if (ptsEl) ptsEl.textContent = `${formatNumber(myStats.points_all)} pts`;
  if (weekEl) weekEl.textContent = `${formatNumber(myStats.points_week)} pts`;
  if (streakEl) {
    const s = myStats.streak ?? 0;
    streakEl.textContent = s === 1 ? "1 day" : `${formatNumber(s)} days`;
  }
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatRelativeTime(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function renderAchievements(rows) {
  const grid = document.getElementById("achievementsGrid");
  if (!grid) return;
  if (!rows.length) {
    grid.innerHTML =
      '<p class="community-msg">No completions yet. Finish a daily challenge to show up here.</p>';
    return;
  }
  grid.innerHTML = rows
    .map((r) => {
      const when = formatRelativeTime(r.completed_at);
      return `
      <div class="achievement-card">
        <div class="achievement-icon">🏅</div>
        <h3>${escapeHtml(r.display_name)}</h3>
        <p>${escapeHtml(r.challenge_title)} · +${r.points_earned} pts</p>
        <span class="time">${when}</span>
      </div>`;
    })
    .join("");
}

function avatarSrc(url) {
  return url && String(url).trim() ? url : PLACEHOLDER_AVATAR;
}

// function badgeForPosition(pos) {
//   if (pos === 1) return '<p class="rank-badge pro">Pro</p>';
//   if (pos === 2) return '<p class="rank-badge coach">Coach</p>';
//   return '<p class="rank-badge">Member</p>';
// }

function renderLeaderboard(rows, currentUserId) {
  const top3 = document.getElementById("leaderboardTop3");
  const list = document.getElementById("leaderboardList");
  if (!top3 || !list) return;

  const maxPts = rows.length
    ? Math.max(...rows.map((r) => Number(r.total_points) || 0), 1)
    : 1;

  const podiumOrder = [1, 0, 2];
  const top = podiumOrder.map((i) => rows[i]).filter(Boolean);

  if (!top.length) {
    top3.innerHTML =
      '<p class="community-msg">No points in this period yet. Complete a daily challenge to appear on the board.</p>';
    list.innerHTML = "";
    return;
  }

  top3.innerHTML = top
    .map((r) => {
      const visualPos = rows.indexOf(r) + 1;
      const pts = Number(r.total_points) || 0;
      const pct = Math.round((pts / maxPts) * 100);
      const cardClass =
        visualPos === 1 ? "rank-1" : visualPos === 2 ? "rank-2" : "rank-3";
      
      const initials = (r.display_name || "M").charAt(0).toUpperCase();

      return `
      <div class="rank-card ${cardClass}${r.user_id === currentUserId ? " is-you" : ""}">
        <div class="rank-position">${visualPos}</div>
        <div class="user-initials-avatar">${initials}</div>
        <h3>${escapeHtml(r.display_name)}</h3>
        <span class="rank-points">${formatNumber(pts)} pts</span>
        <div class="rank-bar"><div class="rank-fill" style="width:${pct}%"></div></div>
      </div>`;
    })
    .join("");

  const rest = rows.slice(3);
  list.innerHTML = rest.length
    ? rest
      .map((r) => {
        const you = r.user_id === currentUserId ? " is-you" : "";
        return `
    <div class="leaderboard-item${you}">
      <span class="position">${r.rank}</span>
      <div class="user-initials-avatar small">${(r.display_name || "M").charAt(0).toUpperCase()}</div>
      <div class="item-info">
        <h4>${escapeHtml(r.display_name)}${r.user_id === currentUserId ? " (you)" : ""}</h4>
      </div>
      <span class="points">${formatNumber(r.total_points)} pts</span>
    </div>`;
      })
      .join("")
    : "";
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: type === "success" ? "#22c55e" : "#ef4444",
    color: "white",
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    zIndex: "9999",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function renderChallenges(challenges, completionIds, user, reload) {
  const el = document.getElementById("dailyChallengesList");
  if (!el) return;
  if (!challenges.length) {
    el.innerHTML =
      '<p class="community-msg">No challenges for today (UTC). Check back later.</p>';
    return;
  }
  el.innerHTML = challenges
    .map((c) => {
      const done = completionIds.has(c.id);
      const emoji = difficultyEmoji(c.difficulty);
      const desc =
        c.description && String(c.description).trim()
          ? `<p class="challenge-description">${escapeHtml(c.description)}</p>`
          : "";
      return `
      <div class="challenge-item${done ? " completed" : ""}" data-challenge-id="${c.id}">
        <h4>${emoji} ${escapeHtml(difficultyLabel(c.difficulty))} · ${c.points} pts</h4>
        <p class="challenge-description">${escapeHtml(c.title)}</p>
        ${desc}
        <div class="challenge-meta">
          <span>${c.points} pts</span>
          <span>UTC ${escapeHtml(c.challenge_date)}</span>
        </div>
        <div class="challenge-actions">
          <button type="button" class="challenge-btn complete-btn" data-complete="${c.id}" ${done || !user ? "disabled" : ""
        }>${done ? "Completed" : "Mark as done"}</button>
        </div>
      </div>`;
    })
    .join("");

  el.querySelectorAll("[data-complete]").forEach((btn) => {
    if (btn.disabled) return;
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-complete");
      btn.disabled = true;
      const err = await completeChallenge(id, user.id);
      if (err) {
        console.error(err);
        const msg =
          err.code === "23505"
            ? "You already completed this challenge."
            : err.message || "Could not save completion";
        showToast(msg, "error");
        btn.disabled = false;
        return;
      }
      showToast("Challenge completed!");
      await reload();
    });
  });
}

function setLeaderboardTitle(filter) {
  const h2 = document.getElementById("leaderboardSectionTitle");
  if (!h2) return;
  const titles = {
    weekly: "🏆 Weekly Leaderboard",
    monthly: "🏆 Monthly Leaderboard",
    "all-time": "🏆 All-Time Leaderboard",
  };
  h2.textContent = titles[filter] || titles.weekly;
}

async function loadAll(user) {
  const today = utcToday();
  await ensureChallenges(today);

  const [challenges, myStats, stats, achievements, leaderboard, completionIds] =
    await Promise.all([
      fetchTodaysChallenges(today),
      fetchMyStats(),
      fetchCommunityStats(),
      fetchAchievements(),
      fetchLeaderboard(currentLeaderboardFilter),
      user ? fetchMyCompletionIds() : Promise.resolve(new Set()),
    ]);

  renderCommunityStats(stats);
  renderQuickStats(myStats, currentLeaderboardFilter);
  renderAchievements(achievements);
  renderLeaderboard(leaderboard, user?.id);
  renderChallenges(challenges, completionIds, user, () => loadAll(user));
}

function wireLeaderboardFilters(user) {
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", async function () {
      filterButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      currentLeaderboardFilter = this.dataset.filter || "weekly";
      setLeaderboardTitle(currentLeaderboardFilter);
      const rows = await fetchLeaderboard(currentLeaderboardFilter);
      renderLeaderboard(rows, user?.id);
      const myStats = await fetchMyStats();
      renderQuickStats(myStats, currentLeaderboardFilter);
    });
  });
}

function wireSidebarNav() {
  const menuItems = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".section");

  menuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      menuItems.forEach((m) => m.classList.remove("active"));
      this.classList.add("active");
      const sectionId = this.dataset.section;
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  const observerOptions = {
    root: null,
    rootMargin: "-50% 0px -50% 0px",
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        const activeItem = document.querySelector(
          `[data-section="${sectionId}"]`,
        );
        if (activeItem) {
          menuItems.forEach((item) => item.classList.remove("active"));
          activeItem.classList.add("active");
        }
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

function wireProfileMenu() {
  const userProfileBtn = document.getElementById("userProfileBtn");
  const userProfileMenu = document.getElementById("userProfileMenu");

  if (userProfileBtn && userProfileMenu) {
    userProfileBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      userProfileMenu.classList.toggle("active");
    });

    document.addEventListener("click", (event) => {
      if (
        !userProfileBtn.contains(event.target) &&
        !userProfileMenu.contains(event.target)
      ) {
        userProfileMenu.classList.remove("active");
      }
    });
  }
}

const user = await requireAuth();
if (user) {
  setLeaderboardTitle(currentLeaderboardFilter);
  wireLeaderboardFilters(user);
  wireSidebarNav();
  wireProfileMenu();
  await loadAll(user);
}
