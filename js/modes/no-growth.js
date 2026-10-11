// ===== Mode: No Growth =====
ModeRegistry.register({
  id: "no-growth",
  name: "No Growth",
  desc: "Tanpa tumbuh panjang.",
  ready: true,
  config: { stepMs: 130, growOnEat: false, lives: 1 },

  onStart(ctx) {
    // Rintangan tetap — 8 blok kecil tersebar
    ctx.obstacles = [];
    const cx = Math.floor(ctx.cols / 2);
    const cy = Math.floor(ctx.rows / 2);
    const keepClear = (x, y) => Math.abs(x - cx) < 4 && Math.abs(y - cy) < 3;

    let placed = 0;
    let guard = 0;
    while (placed < 8 && guard < 200) {
      guard++;
      const w = 1 + Math.floor(Math.random() * 2);
      const h = 1 + Math.floor(Math.random() * 2);
      const x0 = 2 + Math.floor(Math.random() * (ctx.cols - w - 4));
      const y0 = 2 + Math.floor(Math.random() * (ctx.rows - h - 4));
      // Hindari overlap dengan rintangan lama
      let overlap = false;
      for (let y = y0; y < y0 + h; y++) {
        for (let x = x0; x < x0 + w; x++) {
          if (keepClear(x, y)) { overlap = true; break; }
          if (ctx.obstacles.some(o => o.x === x && o.y === y)) { overlap = true; break; }
        }
        if (overlap) break;
      }
      if (overlap) continue;
      for (let y = y0; y < y0 + h; y++) {
        for (let x = x0; x < x0 + w; x++) {
          ctx.obstacles.push({ x, y });
        }
      }
      placed++;
    }
  },

  onEat(ctx, kind) {
    if (kind === "snack") {
      ctx.score += CONFIG.SCORE_NORMAL;
      // Speed up tiap 10 snack
      if (ctx.eaten % 10 === 0) {
        ctx.stepMs = Math.max(ctx.minStepMs, ctx.stepMs - 10);
      }
    }
  },

  spawnSnack(ctx) {
    // Snack harus di sel kosong (bukan rintangan, tubuh)
    const s = GameEngine.pickEmptyCell();
    if (s) ctx.spawnSnackAt(s);
  },

  getObjective() {
    return "Kumpulkan snack, hindari rintangan";
  },
});