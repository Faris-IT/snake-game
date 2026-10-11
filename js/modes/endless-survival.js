// ===== Mode: Endless Survival =====
ModeRegistry.register({
  id: "endless-survival",
  name: "Endless Survival",
  desc: "Bertahan hidup.",
  ready: true,
  config: { stepMs: 140, growOnEat: true, lives: 1 },

  onStart(ctx) {
    ctx._esSpawnTimer = 0;
    ctx._esSpawnInterval = 12000; // 12 detik
    ctx._esSpeedUpTimer = 0;
    ctx._esSpeedUpInterval = 8000; // 8 detik
    ctx._esWave = 0;
    ctx.obstacles = [];
  },

  onTick(ctx, dt) {
    // Spawn obstacle baru berkala
    ctx._esSpawnTimer += dt;
    if (ctx._esSpawnTimer >= ctx._esSpawnInterval) {
      ctx._esSpawnTimer = 0;
      ctx._esWave++;
      spawnEndlessObstacle(ctx);
    }

    // Speed up bertahap
    ctx._esSpeedUpTimer += dt;
    if (ctx._esSpeedUpTimer >= ctx._esSpeedUpInterval) {
      ctx._esSpeedUpTimer = 0;
      ctx.stepMs = Math.max(ctx.minStepMs, ctx.stepMs - 5);
    }
  },

  onEat(ctx, kind) {
    if (kind === "snack") ctx.score += CONFIG.SCORE_NORMAL;
  },

  spawnSnack(ctx) {
    const s = GameEngine.pickEmptyCell();
    if (s) ctx.spawnSnackAt(s);
  },

  getObjective(ctx) {
    return "🌊 Wave " + ctx._esWave + " · Obstacle: " + ctx.obstacles.length;
  },
});

// ===== Helper Endless Survival =====
function spawnEndlessObstacle(ctx) {
  // Tambah 1-3 blok rintangan
  const count = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    let placed = false;
    let guard = 0;
    while (!placed && guard < 30) {
      guard++;
      const c = GameEngine.pickEmptyCell();
      if (!c) return;
      // Jangan spawn terlalu dekat dengan head
      const h = ctx.body[0];
      if (Math.abs(h.x - c.x) + Math.abs(h.y - c.y) < 4) continue;
      // Jangan spawn terlalu dekat dinding (opsional)
      if (c.x < 1 || c.y < 1 || c.x >= ctx.cols - 1 || c.y >= ctx.rows - 1) continue;
      ctx.obstacles.push(c);
      placed = true;
    }
  }
}