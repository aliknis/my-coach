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
const userProfileBtn = document.getElementById("userProfileBtn");
const userProfileMenu = document.getElementById("userProfileMenu");
const signoutBtn = document.getElementById("signoutBtn");

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

sections.forEach((section) => {
  observer.observe(section);
});

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

if (signoutBtn) {
  signoutBtn.addEventListener("click", () => {
    window.location.href = "../signin/";
  });
}
