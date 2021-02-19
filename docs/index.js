const AUTH_KEY = "auth-key";

const state = {
  user: localStorage.getItem(AUTH_KEY) || null,
  width: 0,
  height: 0,
};

// Auth
function login() {
  state.user = prompt("Enter a nickname:") || null;
  if (state.user) {
    state.user = state.user.trim();
    localStorage.setItem(AUTH_KEY, state.user);
  } else localStorage.removeItem(AUTH_KEY);
}

function logout() {
  state.user = null;
  localStorage.removeItem(AUTH_KEY);
}

const logout_a = document.getElementById("logout");

(function update_login_logout() {
  requestAnimationFrame(update_login_logout);
  if (state.user) {
    logout_a.innerText = "Logout @" + state.user;
  } else {
    logout_a.style.innerText = "";
  }
})();

const ws_url = "ws://localhost:7777/ws";
const ws = new WebSocket(ws_url);
