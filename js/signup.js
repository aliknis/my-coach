import { supabase } from "./supabase_client.js";

async function signup() {
  const nameInput = document.getElementById("signupName");
  const emailInput = document.getElementById("signupEmail");
  const passwordInput = document.getElementById("signupPassword");

  console.log("name: ", nameInput.value);
  console.log("email: ", emailInput.value);
  console.log("password: ", passwordInput.value);

  const { data, error } = await supabase.auth.signUp({
    name: nameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
  });

  if (error) {
    console.log(":( signup error", error.message);
  } else {
    console.log(":) signUp sucessfull", data);
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
