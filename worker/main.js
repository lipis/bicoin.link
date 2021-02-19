const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const Redis = require("ioredis");
const uuid = require("uuid");
const body_parser = require("body-parser");

const port = 8080;
const binance_ws_url = "wss://stream.binance.com:9443/ws/btcusdt@aggTrade";
const history_length = 6;

let last_time = 0;
let last_price = 0;

const app = express();
app.set("json spaces", 2);
app.use(express.static("docs"));

const server = http.createServer(app);
server.listen(port, () => console.log("http://localhost:" + port));

const wss_public = new WebSocket.Server({ noServer: true });
const wss_private = new WebSocket.Server({ noServer: true });

server.on("upgrade", function upgrade(req, socket, head) {
  if (req.url === "/ws/public") {
    wss_public.handleUpgrade(req, socket, head, (ws) => {
      wss_public.emit("connection", ws, req);
    });
  } else if (req.url === "/ws/private") {
    wss_private.handleUpgrade(req, socket, head, (ws) => {
      wss_private.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

// # Store
class RedisStore {
  constructor(redis) {
    this.redis = redis;
  }

  async set_ticker(ticker, seconds, price) {
    const json = JSON.stringify({ ticker, seconds, price });
    await this.redis.set("ticker#" + ticker, json);
    await this.redis.zadd("history#" + ticker, seconds, json);
  }

  async get_ticker(ticker) {
    const value = await this.redis.get("ticker#" + ticker);
    return JSON.parse(value);
  }

  async get_history(ticker) {
    return (
      await this.redis.zrange("history#" + ticker, -history_length, -1)
    ).map(JSON.parse);
  }

  async get_bets(ticker, user_id) {
    const key = "bets#" + ticker + "#" + user_id;
    return (await this.redis.zrange(key, 0, -1)).map(JSON.parse);
  }

  async put_bet(ticker, user_id, is_up) {
    const seconds = Math.ceil(last_time);
    const bet = {
      bet_id: uuid.v4(),
      user_id,
      seconds,
      is_up,
      open_price: last_price,
      close_price: null,
      win: null,
    };
    const key = "bets#" + ticker + "#" + user_id;
    await this.redis.zadd(key, seconds, JSON.stringify(bet));
    return bet;
  }
}
const store = new RedisStore(new Redis(process.env.REDIS_URL));

// # REST API
app.get("/rest/ticker/:ticker", async (req, res) => {
  res.json(await store.get_ticker(req.params.ticker));
});

app.get("/rest/history/:ticker", async (req, res) => {
  res.json(await store.get_history(req.params.ticker));
});

app.get("/rest/bets", async (req, res) => {
  const user_id = req.headers["auth-token"];
  if (!user_id) return res.json(null);
  res.json(await store.get_bets(req.params.ticker, user_id));
});

app.post("/rest/bets", body_parser.json(), async (req, res) => {
  const user_id = req.headers["auth-token"];
  if (!user_id) return res.json(null);
  res.json(await store.put_bet(req.params.ticker, user_id, req.body.is_up));
});

// # Public WebSocket API
wss_public.on("connection", function connection(ws) {
  ws.send(JSON.stringify({ tag: "hello", data: "public" }));
});
function wss_public_broadcast(tag, data) {
  for (const ws of wss_public.clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ tag, data }));
    }
  }
}

// # Private WebSocket API
wss_private.on("connection", function connection(ws) {
  ws.send(JSON.stringify({ tag: "hello", data: "todo@private" }));
});
function wss_private_broadcast(user_id, tag, data) {}

// # Binance
(function binance() {
  const ticker = "btcusdt";
  const queue = [];
  (async function process_binance() {
    while (queue.length) {
      const { time, price } = queue.shift();
      if (last_time && Math.floor(last_time) != Math.floor(time)) {
        const seconds = Math.floor(time);
        store.set_ticker(ticker, seconds, last_price);
        wss_public_broadcast("ticker#" + ticker, {
          ticker,
          seconds,
          price: last_price,
        });
      }
      last_time = time;
      last_price = price;
    }
    setTimeout(process_binance, 1); // TODO replace with process.nextTick
  })();
  (async function connect_to_binance() {
    const ws = new WebSocket(binance_ws_url);
    ws.on("close", () => setTimeout(connect_to_binance, 100));
    ws.on("message", (message) => {
      const data = JSON.parse(message);
      const time = data.T / 1000.0;
      const price = parseFloat(data.p);
      queue.push({ time, price });
    });
  })();
})();
