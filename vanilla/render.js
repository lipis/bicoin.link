const bets_width = 274;
const shift_x = 0 * 240;
const speed_x = 8;

let animated_price = 0;
let price_min = Number.MAX_VALUE;
let price_max = Number.MIN_VALUE;

function render(ctx, width, height, state) {
  render_init(state.history);
  render_history(ctx, width, height, state.history, state.ticker.price);
  render_bets(ctx, width, height, state.bets);
  render_chessboard(ctx, width, height, state.history);
}

function render_init(history) {
  price_min = Number.MAX_VALUE;
  price_max = Number.MIN_VALUE;
  for (const { price } of history) {
    price_min = Math.min(price - 100, price_min);
    price_max = Math.max(price + 100, price_max);
  }
}

function render_chessboard(ctx, width, height, history) {}

function render_history(ctx, width, height, history, current_price) {
  animated_price = animated_price * 0.9 + 0.1 * current_price;

  const dpi = devicePixelRatio;
  const seconds_now = Date.now() / 1000.0;

  ctx.save();
  ctx.beginPath();
  let first_time = true;
  let last_x = 0;
  let last_y = 0;
  for (const { seconds, price } of history) {
    const x = seconds_to_x(seconds, width, seconds_now);
    const y = price_to_y(price, height);
    last_x = x;
    last_y = y;
    if (first_time) {
      ctx.moveTo(x, height);
      first_time = false;
    }
    ctx.lineTo(x, y);
  }
  // ctx.lineTo(width, last_y);
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 2 * dpi;
  const zero_x = seconds_to_x(seconds_now, width, seconds_now);
  ctx.lineTo(zero_x, last_y);
  ctx.stroke();
  ctx.lineTo(zero_x, height);
  ctx.closePath();
  ctx.clip();
  var gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(255, 255, 0, 1)");
  gradient.addColorStop(1, "rgba(255, 255, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function render_bets(ctx, width, height, bets) {
  const dpi = devicePixelRatio;
  ctx.save();
  let y = 48 * dpi;
  for (const bet of bets) {
    const seconds_now = Date.now() / 1000.0;
    const diff = Math.floor(seconds_now - bet.seconds);
    const capped = Math.max(0, Math.min(60, diff));
    ctx.save();
    ctx.translate(8 * dpi, 8 * dpi);
    if (bet.is_up) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.125)";
    } else {
      ctx.fillStyle = "rgba(255, 0, 0, 0.125)";
    }
    ctx.fillRect(0, y, bets_width * dpi, 32 * dpi);
    if (bet.is_up) {
      ctx.fillStyle = "rgba(0, 255, 0, 0.75)";
    } else {
      ctx.fillStyle = "rgba(255, 0, 0, 0.75)";
    }
    ctx.fillRect(0, y, (1 - capped / 60) * bets_width * dpi, 32 * dpi);
    ctx.fillStyle = "white";
    const text = format_date(bet.seconds);
    ctx.fillText(text, 8 * dpi, y + 22 * dpi);
    ctx.fillText("loose :(", 200 * dpi, y + 22 * dpi);
    ctx.restore();
    y += 40 * dpi;
  }
  ctx.restore();
}

function seconds_to_x(seconds, width, seconds_now) {
  return width - (seconds_now - seconds) * speed_x - shift_x * devicePixelRatio;
}

function price_to_y(p, height) {
  return (
    height -
    48 * devicePixelRatio -
    (height - 2 * 48 * devicePixelRatio) *
      ((p - price_min) / (price_max - price_min))
  );
}
