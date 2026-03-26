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

  console.log("name: ", name);
  console.log("email: ", email);
  console.log("password: ", password);

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: { name }, // stored in auth.users.raw_user_meta_data
    },
  });

  if (error) {
    console.log(":( signup error", error.message);
    showToast(`:( Sign up error: ${error.message}`, "error");
  } else {
    console.log(":) signUp sucessfull", data);
    signin(email, password);
  }
}

async function signin(email, password) {
  email ??= document.getElementById("signinEmail").value;
  password ??= document.getElementById("signinPassword").value;

  console.log("email: ", email);
  console.log("password: ", password);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.log(":( signin error", error.message);
    showToast(`:( Sign in error: ${error.message}`, "error");
  } else {
    console.log(":) signin successfull", data);
    window.location.replace("../home");
  }
}

async function signout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log(":( signout error", error.message);
    showToast(":( signout error" + error.message, "error");
  } else {
    console.log(":) signout successfull");
    window.location.replace("../");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("signupBtn");

  if (button) {
    button.addEventListener("click", () => {
      console.log("Sign up clicked!");
      signup();
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("signinBtn");

  if (button) {
    button.addEventListener("click", () => {
      console.log("signin clicked!");
      signin();
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("signoutBtn");

  if (button) {
    button.addEventListener("click", () => {
      console.log("signout clicked!");
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
