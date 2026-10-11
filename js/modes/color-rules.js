// ===== Mode: Color Rules =====
ModeRegistry.register({
  id: "color-rules",
  name: "Color Rules",
  desc: "Aturan warna berganti.",
  ready: true,
  config: { stepMs: 150, growOnEat: true, lives: 3, targetSnacks: 15 },

  onStart(ctx) {
    ctx.targetSnacks = 15;
    ctx._crTimer = 0;
    ctx._crInterval = 10000;  // 10 detik
    ctx._crSafe = "green";
    ctx._crForbidden = "red";
    ctx._crMap = [];
    generateColorMap(ctx);
    refreshColorTiles(ctx);
  },

  onTick(ctx, dt) {
    ctx._crTimer += dt;
    if (ctx._crTimer >= ctx._crInterval) {
      ctx._crTimer = 0;
      // Tukar safe ↔ forbidden
      const tmp = ctx._crSafe;
      ctx._crSafe = ctx._crForbidden;
      ctx._crForbidden = tmp;
      refreshColorTiles(ctx);
    }
  },

  onAfterMove(ctx) {
    const h = ctx.body[0];
    const tile = ctx._crMap.find(t => t.x === h.x && t.y === h.y);
    if (tile && tile.color === ctx._crForbidden) {
      ctx.lives--;
      if (ctx.lives <= 0) GameEngine.helpers.endGame();
    }
  },

  onEat(ctx, kind) {
    if (kind === "snack") ctx.score += CONFIG.SCORE_NORMAL;
  },

  isLose(ctx) { return ctx.lives <= 0; },
  isWin(ctx)  { return ctx.eaten >= ctx.targetSnacks; },

  getObjective(ctx) {
    const safe = ctx._crSafe === "green" ? "🟢" : "🔵";
    const forb = ctx._crForbidden === "red" ? "🔴" : "🟣";
    return "🎯 " + ctx.eaten + "/15 · ❤ " + ctx.lives + " · Aman " + safe + " · Bahaya " + forb;
  },
});

function generateColorMap(ctx) {
  const colors = ["red", "blue"];
  ctx._crMap = [];
  const cx = Math.floor(ctx.cols / 2);
  const cy = Math.floor(ctx.rows / 2);
  for (let y = 0; y < ctx.rows; y++) {
    for (let x = 0; x < ctx.cols; x++) {
      // Hindari sel dekat start ular
      if (Math.abs(x - cx) < 3 && Math.abs(y - cy) < 2) continue;
      if (Math.random() < 0.30) {
        ctx._crMap.push({ x, y, color: colors[Math.floor(Math.random() * colors.length)] });
      }
    }
  }
}

function refreshColorTiles(ctx) {
  const tiles = [];
  for (const t of ctx._crMap) {
    if (t.color === ctx._crForbidden) {
      // Warna terlarang: merah jika forbidden=red, ungu jika forbidden=blue
      const kind = ctx._crForbidden === "red" ? "danger" : "purple";
      tiles.push({ x: t.x, y: t.y, kind });
    } else {
      // Warna aman: hijau jika safe=green, biru jika safe=blue
      const kind = ctx._crSafe === "green" ? "green" : "blue";
      tiles.push({ x: t.x, y: t.y, kind });
    }
  }
  ctx.setTiles(tiles);
}