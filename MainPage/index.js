import { onAuthStateChanged, signOut } from "../auth.js";
import { auth } from "../config.js";

checkUserLogin();

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

// function addUserName() {
//     let loggedInUser = JSON.parse(localStorage.getItem("loginUser"));
//     let userName = document.getElementById("userName")
//     userName.innerHTML = loggedInUser.fullName
// }

// addUserName()
export function checkUserLogin() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Login user:", user.uid);
        resolve(user);
      } else {
        Swal.fire({
          title: "Please Login",
          icon: "warning",
          confirmButtonText: "Login Now",
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
        }).then(() => {
          window.location.replace("../index.html");
        });
      }
    });
  });
}

window.addEventListener("DOMContentLoaded", checkUserLogin);

window.logoutUser = () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
    });

  window.location.assign("../index.html");
};

const loggedInUser = JSON.parse(localStorage.getItem("loginUser")) || [];
const users = JSON.parse(localStorage.getItem("users")) || [];
let inputPost = document.getElementById("post-input");

function createdPost() {
  let publishedPostBtn = document.getElementById("published-post");
  if (!inputPost.value.trim()) {
    Swal.fire("Please write something before posting.");
    return;
  }
  let owner = JSON.parse(localStorage.getItem("loginUser"));

  delete owner.password;

  let post = {
    content: inputPost.value,
    owner: owner,
    time: Date.now(),
  };

  let freshOwner = JSON.parse(localStorage.getItem("loginUser"));
  if (!Array.isArray(freshOwner.myPosts)) {
    freshOwner.myPosts = [];
  }
  freshOwner.myPosts.push(post);

  console.log(freshOwner);
  localStorage.setItem("loginUser", JSON.stringify(freshOwner));

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let userIndex = users.findIndex((u) => u.email === freshOwner.email);
  if (userIndex !== -1) {
    users[userIndex] = freshOwner;
    localStorage.setItem("users", JSON.stringify(users));
  }
  inputPost.value = "";

  if (document.getElementById("posts-feed-container")) {
    showPost();
  }

  if (document.getElementById("newsfeed-container")) {
    document.getElementById("newsfeed-container").innerHTML = "";
    showNewsFeed();
  }
}

function showPost() {
  let user = JSON.parse(localStorage.getItem("loginUser"));
  let postFeedContainer = document.getElementById("posts-feed-container");
  postFeedContainer.innerHTML = "";
  user.myPosts.reverse().map((post) => {
    console.log(user.myPosts);
    postFeedContainer.innerHTML += ` <div class="post-box">
                <div class="post-header">
                    <div class="profile-img">
                    </div>
                    <div class="user-info">
                        <h4>${post.owner.fullName}</h4>
                        <span>${new Date(post.time).toLocaleString()}</span>
                    </div>
                </div>

                <div class="post-content">
                    ${post.content}
                </div>

               <div class="post-actions">
                    <button><svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" fill="none"
                            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                        </svg>
                        Like</button>
                    <button><svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" fill="none"
                            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                        </svg>
                        Comment</button>
                    <button><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                            height="20px" width="20px" version="1.1" id="_x32_" viewBox="0 0 512 512"
                            xml:space="preserve" >
                            <style type="text/css">
                                .st0 {
            
                                    fill:grey;
                                }
                            </style>
                            <g>
                                <path class="st0"
                                    d="M512,230.431L283.498,44.621v94.807C60.776,141.244-21.842,307.324,4.826,467.379   c48.696-99.493,149.915-138.677,278.672-143.14v92.003L512,230.431z" />
                            </g>
                        </svg> Share</button>
                </div>
                </div>
            </div> `;
  });
}

function showNewsFeed() {
  let users = JSON.parse(localStorage.getItem("users"));
  let allPosts = [];
  users.forEach((user) => {
    if (Array.isArray(user.myPosts)) {
      user.myPosts.forEach((post) => {
        allPosts.push(post);
      });
    }
  });
  allPosts.sort(() => Math.random() - 0.5);
  allPosts.map((post) => {
    document.getElementById(
      "newsfeed-container"
    ).innerHTML += `<div class="post-box">
                <div class="post-header">
                    <div class="profile-img">
                    </div>
                    <div class="user-info">
                        <h4>${post.owner.fullName}</h4>
                        <span>${new Date(post.time).toLocaleString()}</span>
                    </div>
                </div>

                <div class="post-content">
                    ${post.content}
                </div>

               <div class="post-actions">
                    <button><svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" fill="none"
                            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                        </svg>
                        Like</button>
                    <button><svg xmlns="http://www.w3.org/2000/svg" height="20px" width="20px" fill="none"
                            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                        </svg>
                        Comment</button>
                    <button><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                            height="20px" width="20px" version="1.1" id="_x32_" viewBox="0 0 512 512"
                            xml:space="preserve">
                            <style type="text/css">
                                .st0 {
                                    fill:grey;
                                }
                            </style>
                            <g>
                                <path class="st0"
                                    d="M512,230.431L283.498,44.621v94.807C60.776,141.244-21.842,307.324,4.826,467.379   c48.696-99.493,149.915-138.677,278.672-143.14v92.003L512,230.431z" />
                            </g>
                        </svg> Share</button>
                </div>
                </div>
            </div>`;
  });
}

showNewsFeed();
