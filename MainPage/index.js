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

document.getElementById("mini-chat-window").addEventListener("click", (e) => {
  e.stopPropagation();
});
document.addEventListener("click", () => {
  messengerPopup.style.display = "none";
  closeChatWindow();
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
let messageUnsubscribe = null;

window.checkRoom = async (friendId, friendName) => {
  console.log(friendName);
  const userId = auth.currentUser.uid;
  const userDetails = { [userId]: true, [friendId]: true };
  let roomId = null;

  // Existing Room Check 
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

  messengerPopup.style.display = "none";
  const chatWin = document.getElementById("mini-chat-window");
  chatWin.classList.remove("hidden");
  chatWin.classList.add("flex");

  console.log(friendName);
  document.getElementById("chat-friend-name").innerText = friendName;
  document.getElementById("chat-friend-img").src =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHgjCOoJ_d6n-PjKd4FwKzXgXKQ-rK9BYYkg&s";

  activeRoomId = roomId;
  getRealTimeData(roomId);
};



window.closeChatWindow = () => {
  document.getElementById("mini-chat-window").classList.add("hidden");
  activeRoomId = null;
};



function getRealTimeData(roomId) {
  if (messageUnsubscribe) messageUnsubscribe();

  const q = query(
    collection(db, "chatrooms", roomId, "messeges"),
    orderBy("createdAt", "asc")
  );

  messageUnsubscribe = onSnapshot(q, (querySnapshot) => {
    const messagesCon = document.getElementById("message-con");
    if (!messagesCon) return;

    messagesCon.innerHTML = "";

    querySnapshot.forEach((doc) => {
      const { msg, userId } = doc.data();

      const isMe = userId === auth.currentUser.uid;

      messagesCon.innerHTML += `
        <li class="flex ${isMe ? "justify-end" : "justify-start"} mb-2">
          <div class="
            max-w-[65%]
            px-4 py-2
            text-sm
            rounded-2xl
            ${isMe 
              ? "bg-blue-600 text-white rounded-br-none" 
              : "bg-gray-200 text-gray-900 rounded-bl-none"}
          ">
            ${msg}
          </div>
        </li>
      `;
    });

    messagesCon.scrollTop = messagesCon.scrollHeight;
  });
}



document.getElementById("send-btn").addEventListener("click", async () => {
  if (!activeRoomId) return;

  let messageText = document.getElementById("message-text");
  if (messageText.value.trim() === "") return;

  try {
    await addDoc(collection(db, "chatrooms", activeRoomId, "messeges"), {
      createdAt: serverTimestamp(),
      msg: messageText.value,
      userId: auth.currentUser.uid,
    });

    messageText.value = ""; 
  } catch (e) {
    console.error("Error sending message: ", e);
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
      
    });
};
