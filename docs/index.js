const TOKEN = "auth_token";
const public_ws_url = "ws://localhost:8080/ws/public";
const private_ws_url = "ws://localhost:8080/ws/private";
const binance_ws_url = "wss://stream.binance.com:9443/ws/btcusdt@aggTrade";
const reconnect_timeout_ms = 1000;

const state = {
  token: localStorage.getItem(TOKEN) || null,
  width: 0,
  height: 0,
  history: [],
  ticker: { ticker: "btcusdt", seconds: 0, price: 0 },
};
let public_ws = null;
let private_ws = null;

reconnect_public_ws();
reconnect_private_ws();

// # Auth
function login() {
  state.token = prompt("Enter a nickname:") || null;
  if (state.token) {
    state.token = state.token.trim();
    localStorage.setItem(TOKEN, state.token);
  } else localStorage.removeItem(TOKEN);
  reconnect_private_ws();
}

function logout() {
  state.token = null;
  localStorage.removeItem(TOKEN);
  reconnect_private_ws();
}

const ticker_el = document.getElementById("ticker");
const login_el = document.getElementById("login");
const logout_el = document.getElementById("logout");
let last_ticker_value = null;

(function mirror() {
  if (state.token) {
    login_el.style.display = "none";
    logout_el.style.display = "block";
    logout_el.innerText = "Logout @" + state.token;
  } else {
    login_el.style.display = "block";
    logout_el.style.display = "none";
    logout_el.style.innerText = "";
  }

  {
    // Ticker
    const date = new Date(state.ticker.seconds * 1000)
      .toJSON()
      .replace(".000", "")
      .replace("T", " ")
      .replace("Z", "");
    let price_str = state.ticker.price.toString();
    while (price_str.length < 9) price_str = price_str + "0";
    const ticker_value = `${date} &nbsp; 1 BTC = <span style="color: white">${price_str}</span> USDT`;
    if (ticker_value != last_ticker_value) ticker_el.innerHTML = ticker_value;
    last_ticker_value = ticker_value;
  }
  JSON.stringify(state.ticker);
  requestAnimationFrame(mirror);
})();

// # WebSocket
function reconnect_public_ws() {
  if (public_ws) public_ws.close();
  public_ws = new WebSocket(public_ws_url);
  public_ws.onclose = () =>
    setTimeout(reconnect_public_ws, reconnect_timeout_ms);
  public_ws.onerror = (error) => {
    console.error(error);
    setTimeout(reconnect_public_ws, reconnect_timeout_ms);
  };
  public_ws.onmessage = (message) => {
    const { tag, data } = JSON.parse(message.data);
    on_public(tag, data);
  };
}

function reconnect_private_ws() {
  if (private_ws) private_ws.close();
  private = null;
  if (!state.token) return;
  private_ws = new WebSocket(private_ws_url);
  private_ws.onclose = () =>
    setTimeout(reconnect_private_ws, reconnect_timeout_ms);
  private_ws.onerror = (error) => {
    console.error(error);
    setTimeout(reconnect_private_ws, reconnect_timeout_ms);
  };
  private_ws.onmessage = (message) => {
    const { tag, data } = JSON.parse(message.data);
    on_private(tag, data);
  };
}

function on_public(tag, data) {
  if (tag == "ticker#btcusdt") state.ticker = data;
}

function on_private(tag, data) {
  console.log("on_private", tag, data);
}
