import { onAuthStateChanged, signOut } from "../auth.js";
import { auth, db } from "../config.js";

function checkCurrentUser() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      console.log("ye woh user he jo is waqt login he", user);
      let userName = document.getElementById("userName");
      userName.innerHTML = user.displayName;
    } else {
      Toastify({
        text: "Logout Successfully!",
        duration: 3000,
      }).showToast();
      window.location.assign("../index.html");
    }
  });
}
checkCurrentUser();


const dropdown = document.getElementById("dropdown");
const mediaDropDown = document.getElementById("dropdown-2");
const profileIcon = document.getElementById("profile-icon");

window.toggleDropdown = () => {
  dropdown.classList.toggle("show");
  mediaDropDown.classList.toggle("show");
};

window.addEventListener("click", function (e) {
  if (!profileIcon?.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove("show");
  }
});



























window.logoutUser = () => {
  signOut(auth)
    .then(() => {
      console.log("user logout ho chuka he ");
      Toastify({
        text: "Logout Successfully!",
        duration: 3000,
      }).showToast();
      window.location.assign("../index.html");
    })
    .catch((error) => {
      // An error happened.
    });
};
