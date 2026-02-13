const tealPanel = document.getElementById("tealPanel");
const brand = document.getElementById("brand");
const signupForm = document.getElementById("signupForm");
const signinForm = document.getElementById("signinForm");

let isSignup = true;
let busy = false;

function toggleView() {
  if (busy) return;
  busy = true;

  // 1. hide current form
  if (isSignup) {
    signupForm.classList.remove("active");
  } else {
    signinForm.classList.remove("active");
  }

  // 2. hide brand during sweep
  brand.style.opacity = "0";

  // 3.sweep animation
  tealPanel.classList.remove("to-signin", "to-signup");
  void tealPanel.offsetWidth; // force reflow
  tealPanel.classList.add(isSignup ? "to-signin" : "to-signup");

  // 4. At the half swap brand  and show the  new form
  setTimeout(() => {
    if (isSignup) {
      brand.style.right = "auto";
      brand.style.left = "36px";
      signinForm.classList.add("active");
    } else {
      brand.style.left = "auto";
      brand.style.right = "36px";
      signupForm.classList.add("active");
    }
    brand.style.opacity = "1";
    isSignup = !isSignup;
  }, 400);

  // 5. unlock after animation
  setTimeout(() => {
    busy = false;
  }, 850);
}

document.querySelectorAll(".toggle-link").forEach((el) => {
  el.addEventListener("click", toggleView);
});
