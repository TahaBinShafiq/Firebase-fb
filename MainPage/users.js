import { onAuthStateChanged, signOut } from "../auth.js";
import { auth, db } from "../config.js";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "../fireStore.js";

const showUserCon = document.getElementById("allUsersCon");

const dropdown = document.getElementById("dropdown");
const mediaDropDown = document.getElementById("dropdown-2");
const profileIcon = document.getElementById("profile-icon");

window.toggleDropdown = () => {
  dropdown.classList.toggle("show");
  mediaDropDown?.classList.toggle("show");
};

window.addEventListener("click", function (e) {
  if (!profileIcon?.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove("show");
  }
});

async function checkCurrentUserAndLoadUsers() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.assign("../index.html");
      return;
    }

    const currentUserId = user.uid;
    document.getElementById("userName").innerHTML = user.displayName;

    try {
      // 1. Fetch Sent Requests (Jo maine bheji hain)
      const sentQuery = query(
        collection(db, "friendRequests"),
        where("senderId", "==", currentUserId)
      );
      const sentSnap = await getDocs(sentQuery);
      const sentToIDs = new Set();
      sentSnap.forEach((doc) => sentToIDs.add(doc.data().receiverId));

      // 2. Fetch Received Requests (Jo mujhe aayi hain)
      const receivedQuery = query(
        collection(db, "friendRequests"),
        where("receiverId", "==", currentUserId)
      );
      const receivedSnap = await getDocs(receivedQuery);
      const receivedFromIDs = new Set();
      receivedSnap.forEach((doc) => receivedFromIDs.add(doc.data().senderId));

      // 3. NEW: Fetch Already Friends (Jo pehle se dost hain unhe hatane ke liye)
      const friendsQuery = collection(db, "users", currentUserId, "friends");
      const friendsSnap = await getDocs(friendsQuery);
      const alreadyFriendsIDs = new Set();
      friendsSnap.forEach((doc) => alreadyFriendsIDs.add(doc.data().friendId));

      // 4. Fetch All Users
      const querySnapshot = await getDocs(collection(db, "users"));
      showUserCon.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const targetUserId = doc.id;
        const userData = doc.data();

        // LOGIC: Sirf unhe dikhao jo:
        // - Main khud nahi hoon
        // - Maine unhe request nahi bheji (!sentToIDs)
        // - Unhone mujhe request nahi bheji (!receivedFromIDs)
        // - Wo mere dost nahi hain (!alreadyFriendsIDs)
        if (
          targetUserId !== currentUserId &&
          !sentToIDs.has(targetUserId) &&
          !receivedFromIDs.has(targetUserId) &&
          !alreadyFriendsIDs.has(targetUserId)
        ) {
          const card = document.createElement("div");
          card.className = "friend-card";
          card.innerHTML = `
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHgjCOoJ_d6n-PjKd4FwKzXgXKQ-rK9BYYkg&s" class="friend-img" />
            <h3>${userData.fullName}</h3>
            <button class="add-btn" id="btn-${targetUserId}">Add friend</button>
          `;
          showUserCon.appendChild(card);

          const addBtn = card.querySelector(".add-btn");
          addBtn.addEventListener("click", () =>
            sendFriendRequest(currentUserId, targetUserId, addBtn)
          );
        }
      });
    } catch (error) {
      console.error("Error loading users:", error);
    }
  });
}
checkCurrentUserAndLoadUsers();

async function sendFriendRequest(senderId, receiverId, button) {
  const requestId = `${senderId}_${receiverId}`;

  try {
    button.innerText = "Sending...";
    button.disabled = true;

    await setDoc(doc(db, "friendRequests", requestId), {
      senderId: senderId,
      receiverId: receiverId,
      status: "pending",
      timestamp: serverTimestamp(),
    });

    button.innerText = "Request Sent";
    button.style.backgroundColor = "gray";
    button.style.color = "white";
    console.log("Request sent successfully!");
  } catch (error) {
    console.error("Error sending request:", error);
    button.innerText = "Add friend";
    button.disabled = false;
  }
}

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
