const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const Redis = require("ioredis");

const port = 8080;
const BINANCE_URL = "wss://stream.binance.com:9443/ws/btcusdt@aggTrade";

const redis = new Redis(process.env.REDIS_URL);

const app = express();
app.use(express.static("docs"));

const server = http.createServer(app);
server.listen(port, () => console.log("http://localhost:" + port));

app.get("/api", (req, res) => res.json("api"));

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

wss.on("connection", function connection(ws) {
  ws.send("hello");
});

(function binance() {
  const ws = new WebSocket(BINANCE_URL);
  ws.on("close", () => setTimeout(binance, 100));
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    const time = data.T / 1000.0;
    const price = parseFloat(data.p);
    console.log(time, price);
  });
})();
