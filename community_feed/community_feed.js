const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", function () {
    filterButtons.forEach((b) => b.classList.remove("active"));
    this.classList.add("active");

    const filterType = this.dataset.filter;
    console.log(`Filtered leaderboard by: ${filterType}`);
  });
});

const menuItems = document.querySelectorAll(".menu-item");
const sections = document.querySelectorAll(".section");

menuItems.forEach((item) => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    menuItems.forEach((m) => m.classList.remove("active"));
    this.classList.add("active");

    const menuText = this.querySelector(".menu-text").textContent;
    console.log(`Navigation: ${menuText}`);
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
        console.log(`Section in view: ${sectionId}`);
      }
    }
  });
}, observerOptions);
sections.forEach((section) => {
  observer.observe(section);
});
