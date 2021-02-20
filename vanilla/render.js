const bets_width = 274;

function render_history(ctx, width, height, history) {
  ctx.save();
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
