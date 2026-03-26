import { supabase } from "./supabase_client.js";

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.textContent = message;

  const isSuccess = type === "success";

  Object.assign(toast.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%) translateY(-8px)",
    background: isSuccess ? "#22c55e" : "#ef4444",
    color: "white",
    padding: "10px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    zIndex: "9999",
    opacity: "0",
    transition: "opacity 0.25s ease, transform 0.25s ease",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  });

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%) translateY(0)";
    });
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(-8px)";
    setTimeout(() => toast.remove(), 250);
  }, 3000);
}

async function signup(name, email, password) {
  name ??= document.getElementById("signupName").value;
  email ??= document.getElementById("signupEmail").value;
  password ??= document.getElementById("signupPassword").value;

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: { name }, // stored in auth.users.raw_user_meta_data
    },
  });

  if (error) {
    console.log("Sign up error", error.message);
    showToast(`Sign up error: ${error.message}`, "error");
  } else {
    console.log("Sign up sucessfull", data);
    signin(email, password);
  }
}

async function signin(email, password) {
  email ??= document.getElementById("signinEmail").value;
  password ??= document.getElementById("signinPassword").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.log("Sign in error", error.message);
    showToast(`Sign in error: ${error.message}`, "error");
  } else {
    console.log("Sign in successfull", data);
    window.location.replace("../home");
  }
}

async function signout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log("Sign out error", error.message);
    showToast("Sign out error" + error.message, "error");
  } else {
    console.log("Sign out Successfull");
    window.location.replace("../");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const password = document.getElementById("signupPassword");
  const confirm = document.getElementById("confirmSignupPassword");

  if (confirm && password) {
    confirm.addEventListener("input", () => {
      if (confirm.value !== password.value) {
        confirm.setCustomValidity("Passwords do not match");
      } else {
        confirm.setCustomValidity(""); // clears the error
      }
    });
  }

  const form = document.getElementById("signupForm");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("Sign up form submitted!");
      signup();
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signinForm");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("Sign in form submitted!");
      signin();
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("signoutBtn");

  if (button) {
    button.addEventListener("click", () => {
      console.log("Sign out clicked!");
      signout();
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("testHomeBtn");

  if (button) {
    button.addEventListener("click", () => {
      console.log("test home clicked!");
      window.location.replace("../home");
    });
  }
});
