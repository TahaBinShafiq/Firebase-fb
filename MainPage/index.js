import { onAuthStateChanged, signOut } from "../auth.js";
import { auth, db } from "../config.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  serverTimestamp,
  addDoc,
  orderBy,
  onSnapshot,
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
  mediaDropDown.classList.toggle("show");
};

window.addEventListener("click", function (e) {
  if (!profileIcon?.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove("show");
  }
});


let messengerPopup = document.getElementById("messenger");
let msgIcon = document.getElementById("msg-icon");

// toggle on icon click
msgIcon.addEventListener("click", (e) => {
  e.stopPropagation(); // taake document click na chale
  if (messengerPopup.style.display === "block") {
    messengerPopup.style.display = "none";
  } else {
    messengerPopup.style.display = "block";
  }
  loadPopupChats();
});

// popup ke andar click par close na ho
messengerPopup.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", () => {
  messengerPopup.style.display = "none";
});

async function loadPopupChats() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const currentUserId = user.uid;
    const chatsListCon = document.getElementById("chats-list");
    chatsListCon.innerHTML = "<p class='p-4 text-sm'>Loading Chats...</p>";

    try {
      const friendsRef = collection(db, "users", currentUserId, "friends");
      const snap = await getDocs(friendsRef);

      if (snap.empty) {
        chatsListCon.innerHTML = "<p class='p-4 text-sm'>No Chats yet.</p>";
        return;
      }

      let html = "";

      for (const friendDoc of snap.docs) {
        const friendId = friendDoc.data().friendId;
        const userRef = doc(db, "users", friendId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log(data);

          html += `
<div class="flex items-center gap-3 p-3 mx-2 hover:bg-gray-100 rounded-lg cursor-pointer transition"
     onclick="checkRoom('${data.id}', '${data.fullName}')">
     
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHgjCOoJ_d6n-PjKd4FwKzXgXKQ-rK9BYYkg&s"
         class="w-14 h-14 rounded-full object-cover">

    <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-gray-900 truncate">${data.fullName}</h3>
        <p class="text-sm text-gray-500 truncate">Messages and calls are secured wit... ·</p>
    </div>
</div>
`;
        }
      }
      chatsListCon.innerHTML = html;
    } catch (error) {
      console.error("Popup error:", error);
      chatsListCon.innerHTML = "Error loading chats.";
    }
  });
}

let activeRoomId = null;

window.checkRoom = async (friendId, friendName) => {
  console.log(friendName)
  const userId = auth.currentUser.uid;
  const userDetails = { [userId]: true, [friendId]: true };
  let roomId = null;

  // 1. Existing Room Check (Sir wala logic)
  const q = query(
    collection(db, "chatrooms"),
    where(`userDetails.${userId}`, "==", true),
    where(`userDetails.${friendId}`, "==", true)
  );
  const snap = await getDocs(q);
  snap.forEach((doc) => (roomId = doc.id));

  if (!roomId) {
    const docRef = await addDoc(collection(db, "chatrooms"), {
      userDetails,
      createdAt: serverTimestamp(),
    });
    roomId = docRef.id;
  }

  // 2. Popups Switch Karein
  messengerPopup.style.display = "none" // Chat list band
  const chatWin = document.getElementById("mini-chat-window");
  chatWin.classList.remove("hidden"); // Chat window open
  chatWin.classList.add("flex");

  console.log(friendName)
  // 3. Header Update Karein
  document.getElementById("chat-friend-name").innerText = friendName;
  document.getElementById("chat-friend-img").src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHgjCOoJ_d6n-PjKd4FwKzXgXKQ-rK9BYYkg&s"

  // 4. Messages Load Karein (Real-time)
  loadMessages(roomId);
  activeRoomId = roomId;
};

// Window close karne ka function
window.closeChatWindow = () => {
  document.getElementById("mini-chat-window").classList.add("hidden");
  activeRoomId = null;
};

function loadMessages(roomId) {
  const msgDisplay = document.getElementById("messages-display");
  const q = query(
    collection(db, "chatrooms", roomId, "messages"),
    orderBy("createdAt", "asc")
  );

  // Real-time listener
  onSnapshot(q, (snapshot) => {
    msgDisplay.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const isMe = data.senderId === auth.currentUser.uid;

      const msgTag = document.createElement("div");
      msgTag.className = isMe
        ? "bg-blue-500 text-white self-end px-3 py-1 rounded-lg max-w-[80%] text-sm"
        : "bg-gray-200 text-black self-start px-3 py-1 rounded-lg max-w-[80%] text-sm";

      msgTag.innerText = data.text;
      msgDisplay.appendChild(msgTag);
    });
    // Scroll to bottom
    msgDisplay.scrollTop = msgDisplay.scrollHeight;
  });
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
