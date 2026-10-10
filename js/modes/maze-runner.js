// ===== Mode: Maze Runner =====
ModeRegistry.register({
  id: "maze-runner",
  name: "Maze Runner",
  desc: "Labirin & target.",
  ready: true,
  config: { stepMs: 150, growOnEat: true, lives: 1, targetSnacks: 5 },

  onStart(ctx) {
    ctx.level = 1;
    ctx.targetSnacks = 5;
    buildMaze(ctx);
  },

  onEat(ctx, kind) {
    if (kind === "snack") {
      ctx.score += CONFIG.SCORE_NORMAL;
      if (ctx.eaten >= ctx.targetSnacks) {
        ctx.exitUnlocked = true;
      }
    }
  },

  spawnSnack(ctx) {
    const s = GameEngine.pickEmptyCell();
    if (s) ctx.spawnSnackAt(s);
  },

  isWin(ctx) {
    if (!ctx.exitUnlocked || !ctx.exit) return false;
    const h = ctx.body[0];
    return h.x === ctx.exit.x && h.y === ctx.exit.y;
  },

  getObjective(ctx) {
    if (!ctx.exitUnlocked) return "🍎 " + ctx.eaten + "/" + ctx.targetSnacks + " snack";
    return "🚪 Menuju pintu keluar!";
  },
});

function buildMaze(ctx) {
  ctx.obstacles = [];
  const cols = ctx.cols, rows = ctx.rows;
  const cx = Math.floor(cols / 2), cy = Math.floor(rows / 2);
  const keepClear = (x, y) => Math.abs(x - cx) < 4 && Math.abs(y - cy) < 3;

  const count = 6 + ctx.level * 2;
  for (let i = 0; i < count; i++) {
    const w = 1 + Math.floor(Math.random() * 3);
    const h = 1 + Math.floor(Math.random() * 2);
    const x0 = 1 + Math.floor(Math.random() * (cols - w - 2));
    const y0 = 1 + Math.floor(Math.random() * (rows - h - 2));
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        if (!keepClear(x, y)) ctx.obstacles.push({ x, y });
      }
    }
  }

  ctx.exit = { x: cols - 2, y: rows - 2 };
  ctx.exitUnlocked = false;
}