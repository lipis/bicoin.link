const TOKEN = "token";

const state = {
  token: localStorage.getItem(TOKEN) || null,
  width: 0,
  height: 0,
};

// Auth
function login() {
  state.token = prompt("Enter a nickname:") || null;
  if (state.token) {
    state.token = state.token.trim();
    localStorage.setItem(TOKEN, state.token);
  } else localStorage.removeItem(TOKEN);
}

function logout() {
  state.token = null;
  localStorage.removeItem(TOKEN);
}

const logout_a = document.getElementById("logout");

(function update_login_logout() {
  requestAnimationFrame(update_login_logout);
  if (state.token) {
    logout_a.innerText = "Logout @" + state.token;
  } else {
    logout_a.style.innerText = "";
  }
})();

const ws_url = "ws://localhost:7777/ws";
const ws = new WebSocket(ws_url);
