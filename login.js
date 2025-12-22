import { createUserWithEmailAndPassword } from "./auth.js";
import { auth, db } from "./config.js";
import { doc, setDoc } from "./fireStore.js";

let passInput = document.getElementById("loginPassword");
let passEye = document.getElementById("eye-img");
let NewPasswordEyeImg = document.getElementById("new-eye-img");
let NewPasswordInp = document.getElementById("NewPasswordInput");

window.passwordTypeChnge = () => {
  if (passInput && passEye) {
    if (passInput.type === "password") {
      passInput.type = "text";
      passEye.src = "https://cdn-icons-png.flaticon.com/512/159/159604.png";
    } else {
      passInput.type = "password";
      passEye.src = "https://cdn-icons-png.flaticon.com/512/709/709612.png";
    }
  }

  if (NewPasswordInp && NewPasswordEyeImg) {
    if (NewPasswordInp.type === "password") {
      NewPasswordInp.type = "text";
      NewPasswordEyeImg.src =
        "https://cdn-icons-png.flaticon.com/512/159/159604.png";
    } else {
      NewPasswordInp.type = "password";
      NewPasswordEyeImg.src =
        "https://cdn-icons-png.flaticon.com/512/709/709612.png";
    }
  }
};

let fullName = document.getElementById("fullName");
let email = document.getElementById("email");
let gender = document.getElementById("gender");
let dateOfBirth = document.getElementById("dateOfBirth");
let loading = false;
let registerBtn = document.getElementById("register");

window.resgisterUser = (event) => {
  event.preventDefault();

  let form = document.getElementById("registerForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  loading = true;

  if (loading === true) {
    registerBtn.innerText = "Creating...";
  }

  createUserWithEmailAndPassword(auth, email.value, NewPasswordInp.value)
    .then((userCredential) => {
      // Signed up
      loading = false;
      if (loading === false) {
        registerBtn.innerHTML = "Register";
      }
      const user = userCredential.user;
      addUserToDb(
        fullName.value,
        email.value,
        gender.value,
        dateOfBirth.value,
        user.uid
      ).then(() => {
        fullName.value = "";
        email.value = "";
        gender.value = "";
        dateOfBirth.value = "";
        NewPasswordInp.value = "";
      });
      Toastify({
        text: "Account Created Successfully!",
        duration: 3000,
      }).showToast();

      console.log("ye woh user he jo auth me save howa he", user);
      // ...
    })
    .catch((error) => {
      loading = false;
      if (loading === false) {
        registerBtn.innerHTML = "Register";
      }
      const errorMessage = error.message;
      Toastify({
        text: error.message,
        duration: 3000,
      }).showToast();
      const errorCode = error.code;
      // ..
    });
};

const addUserToDb = async (name, email, gender, born, userId) => {
  try {
    const docRef = await setDoc(doc(db, "users", userId), {
      fullName: name,
      email: email,
      gender: gender,
      dateOfBirth: born,
      id: userId,
    });
  } catch (e) {
    console.error("Error adding document: ", e);
    Toastify({
      text: e,
      duration: 3000,
    }).showToast();
  }
};

// function loginUser(event) {
//   event.preventDefault();
//   let email = document.getElementById("login-email");

//   let usersFormStorage = JSON.parse(localStorage.getItem("users")) || [];

//   let savedUser = usersFormStorage.find(
//     (element) => element.email === email.value
//   );

//   if (
//     savedUser?.email === email.value &&
//     savedUser?.password === passInput.value
//   ) {
//     if (!Array.isArray(savedUser.friends)) {
//       savedUser.friends = [];
//     }
//     email.value = "";
//     passInput.value = "";
//     localStorage.setItem("loginUser", JSON.stringify(savedUser));
//     window.location.assign("MainPage/index.html");
//   } else {
//     email.value = "";
//     passInput.value = "";
//     let incorrectPass = document.getElementById("incorrect-pass");
//     incorrectPass.style.display = "block";
//     incorrectPass.innerHTML = "Invalid credientials";
//   }
// }
