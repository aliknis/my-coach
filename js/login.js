import { supabase } from "./supabase_client.js";

async function login() {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const msgBox = document.getElementById("loginMsgBox");

  console.log("email: ", emailInput.value);
  console.log("password: ", passwordInput.value);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });

  if (error) {
    console.log(":( login error", error.message);
    msgBox.textContent = ":( login error" + error.message;
  } else {
    console.log(":) login successfull", data);
    msgBox.textContent = ":) login successful" + data;

    window.location.replace("../");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("loginBtn");

  if (button) {
    button.addEventListener("click", () => {
      console.log("login clicked!");
      login();
    });
  }
});
