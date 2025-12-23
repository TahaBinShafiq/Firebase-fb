import { onAuthStateChanged, signOut } from "../auth.js";
import { auth, db } from "../config.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "../fireStore.js";



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
  mediaDropDown?.classList.toggle("show");
};

window.addEventListener("click", function (e) {
  if (!profileIcon?.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove("show");
  }
});

let globalCurrentUserId = null;
async function loadFriendRequests() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    globalCurrentUserId = user.uid;
    const requestContainer = document.getElementById("request-container"); // Apne HTML id ke mutabiq
    requestContainer.innerHTML = "";

    // Query: Wo requests nikaalo jo MUJHE bheji gayi hain
    const q = query(
      collection(db, "friendRequests"),
      where("receiverId", "==", globalCurrentUserId),
      where("status", "==", "pending")
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (requestDoc) => {
      const requestData = requestDoc.data();
      const senderId = requestData.senderId;

      // Sender ki details (Naam/Photo) lene ke liye 'users' collection se fetch karein
      const userRef = doc(db, "users", senderId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const senderInfo = userSnap.data();

        const requestCard = document.createElement("div");
        requestCard.className = "request-card";
        requestCard.innerHTML = `
          <div class="request-info">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHgjCOoJ_d6n-PjKd4FwKzXgXKQ-rK9BYYkg&s" class="friend-img" />
            <p><strong>${senderInfo.fullName}</strong> sent you a friend request.</p>
          </div>
          <div class="request-actions">
            <button class="confirm-btn" onclick="acceptRequest('${requestDoc.id}', '${senderId}')">Confirm</button>
            <button class="delete-btn" onclick="deleteRequest('${requestDoc.id}')">Delete</button>
          </div>
        `;
        requestContainer.appendChild(requestCard);
      }
    });
  });
}

loadFriendRequests();

window.acceptRequest = async (requestId, senderId) => {
  const currentUserId = globalCurrentUserId;

  if(!currentUserId) {
       Toastify({
        text: "User not logged in!",
        duration: 3000,
      }).showToast();
      return;
  }

  console.log(requestId)
  console.log(senderId)
  console.log(currentUserId)
  try {
    // 1. Apni friends list mein dost ko add karein
    await setDoc(doc(db, "users", currentUserId, "friends", senderId), {
      friendId: senderId,
      status: "friend",
      addedAt: serverTimestamp(),
    });

    // 2. Dost ki friends list mein apne aap ko add karein
    await setDoc(doc(db, "users", senderId, "friends", currentUserId), {
      friendId: currentUserId,
      status: "friend",
      addedAt: serverTimestamp(),
    });

    // 3. Friend Request ko delete kar dein (kyunki ab wo dost ban chuke hain)
    await deleteDoc(doc(db, "friendRequests", requestId));
      Toastify({
        text: "Request Accepted 🎉",
        duration: 2000,
      }).showToast();
      
    location.reload(); // UI refresh karne ke liye
  } catch (error) {
    console.error("Accept karne mein masla aya:", error);
  }
};

window.deleteRequest = async (requestId) => {
  try {
    await deleteDoc(doc(db, "friendRequests", requestId));
     Toastify({
        text: "Request Removed",
        duration: 2000,
      }).showToast();
    location.reload();
  } catch (error) {
    console.error("Delete karne mein masla aya:", error);
  }
};

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
