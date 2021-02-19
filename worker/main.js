const express = require("express");
const http = require("http");
const WS = require("ws");
const Redis = require("ioredis");

const port = 8080;

const redis = new Redis(process.env.REDIS_URL);

const app = express();
app.use(express.static("docs"));

const server = http.createServer(app);
server.listen(port, () => console.log("http://localhost:" + port));

// HTTP API
app.get("/api", (req, res) => res.json("api"));

// Route WebSockets
const wss = new WS.Server({ noServer: true });
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
