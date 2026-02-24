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

async function signin() {
  const emailInput = document.getElementById("signinEmail");
  const passwordInput = document.getElementById("signinPassword");
  const msgBox = document.getElementById("signinMsgBox");

  console.log("email: ", emailInput.value);
  console.log("password: ", passwordInput.value);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  });

  if (error) {
    console.log(":( signin error", error.message);
    msgBox.textContent = ":( signin error" + error.message;
  } else {
    console.log(":) signin successfull", data);
    msgBox.textContent = ":) signin successful" + data;

    window.location.replace("../../home");
  }
}

async function signout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log(":( signout error", error.message);
  } else {
    console.log(":) signout successfull");
    window.location.replace("../../");
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
