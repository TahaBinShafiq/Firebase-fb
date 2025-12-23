import { onAuthStateChanged, signOut } from "../auth.js";
import { auth, db } from "../config.js";
import { collection, doc, getDoc, getDocs } from "../fireStore.js";






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



function loadMyFriends() {
  // Parameter yahan se aayega
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const currentUserId = user.uid;
      const friendsCon = document.getElementById("friends-container");
      friendsCon.innerHTML = "Loading friends..."; // Loading state

      try {
        const friendsRef = collection(db, "users", currentUserId, "friends");
        const querySnapshot = await getDocs(friendsRef);

        if (querySnapshot.empty) {
          friendsCon.innerHTML = "No friends found.";
          return;
        }

        let html = ""; // Loop ke bahar string banayein

        // Saare friends ki details fetch karne ke liye
        for (const friendDoc of querySnapshot.docs) {
          const friendId = friendDoc.data().friendId;
          const userRef = doc(db, "users", friendId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            html += `
                            <div class="friend-card">
                                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHgjCOoJ_d6n-PjKd4FwKzXgXKQ-rK9BYYkg&s" class="friend-img" />
                                <h3>${data.fullName}</h3>
                                
                            </div>
                        `;
          }
        }
        friendsCon.innerHTML = html; // Aik hi baar mein render karein
      } catch (error) {
        console.error("Error loading friends:", error);
        friendsCon.innerHTML = "Error loading friends.";
      }
    } else {
      window.location.assign("../index.html");
    }
  });
}

// Function ko call karein
loadMyFriends();

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
