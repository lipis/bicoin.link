const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const Redis = require("ioredis");

const port = 8080;
const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/btcusdt@aggTrade";

const redis = new Redis(process.env.REDIS_URL);

const app = express();
app.set("json spaces", 2);
app.use(express.static("docs"));

const server = http.createServer(app);
server.listen(port, () => console.log("http://localhost:" + port));

const wss = new WebSocket.Server({ noServer: true });
server.on("upgrade", function upgrade(req, socket, head) {
  if (req.url === "/ws") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

// REST API
app.get("/rest/ticker/btcusdt", async (req, res) => {
  const json = JSON.parse(await redis.get("ticker#btcusdt"));
  res.json(json);
});

// WebSocket API
wss.on("connection", function connection(ws) {
  ws.send(JSON.stringify("hello"));
});

// Binance
(function binance() {
  const queue = [];
  let last_time = 0;
  let last_price = 0;
  (async function process_binance() {
    const tick = queue.shift();
    if (tick) {
      const { time, price } = tick;
      if (last_time && Math.floor(last_time) != Math.floor(time)) {
        const seconds = Math.floor(time);
        const json = JSON.stringify({ seconds, last_price });
        await redis.set("ticker#btcusdt", json);
      }
      last_time = time;
      last_price = price;
    }
    setTimeout(process_binance); // TODO replace with process.nextTick
  })();
  (async function connect_to_binance() {
    const ws = new WebSocket(BINANCE_WS_URL);
    ws.on("close", () => setTimeout(connect_to_binance, 100));
    ws.on("message", (message) => {
      const data = JSON.parse(message);
      const time = data.T / 1000.0;
      const price = parseFloat(data.p);
      queue.push({ time, price });
    });
  })();
})();
