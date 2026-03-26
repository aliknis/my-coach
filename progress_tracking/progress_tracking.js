const filterButtons = document.querySelectorAll(".filter-btn");
const goalCards = document.querySelectorAll(".goal-card");
const weekSelector = document.getElementById("weekSelector");
const bars = document.querySelectorAll(".bar");

function applyGoalFilter(filterValue) {
  goalCards.forEach((card) => {
    const category = card.dataset.category;
    const shouldShow = filterValue === "all" || filterValue === category;
    card.classList.toggle("hidden", !shouldShow);
  });
}

function renderChart(mode) {
  const selectedMode = mode === "last" ? "last" : "current";

  bars.forEach((bar) => {
    const nextHeight = bar.dataset[selectedMode] || bar.dataset.current || "10";
    bar.style.height = `${nextHeight}%`;
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    applyGoalFilter(button.dataset.filter);
  });
});

if (weekSelector) {
  weekSelector.addEventListener("change", (event) => {
    const mode = event.target.value === "last" ? "last" : "current";
    renderChart(mode);
  });
}

renderChart("current");
