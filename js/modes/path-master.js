// ===== Mode: Path Master =====
ModeRegistry.register({
  id: "path-master",
  name: "Path Master",
  desc: "Checkpoint berurutan.",
  ready: true,
  config: { stepMs: 150, growOnEat: true, lives: 3, targetCheckpoints: 5 },

  onStart(ctx) {
    ctx.level = 1;
    ctx.checkpoints = [];
    ctx.checkpointIndex = 0;
    ctx.totalCheckpoints = 5;
    buildPathMasterLevel(ctx);
  },

  onTick(ctx) {
    const h = ctx.body[0];

    // Cek checkpoint berikutnya
    const cp = ctx.checkpoints[ctx.checkpointIndex];
    if (cp && !ctx.exitUnlocked && h.x === cp.x && h.y === cp.y) {
      ctx.checkpointIndex++;
      ctx.score += 50;
      if (ctx.onScoreChange) ctx.onScoreChange(ctx.score);

      if (ctx.checkpointIndex >= ctx.checkpoints.length) {
        // Semua checkpoint terkumpul → exit terbuka di posisi checkpoint terakhir
        ctx.exit = cp;
        ctx.exitUnlocked = true;
      } else {
        // Tampilkan checkpoint berikutnya di slot exit
        ctx.exit = ctx.checkpoints[ctx.checkpointIndex];
        ctx.exitUnlocked = false;
        // Beri snack baru agar progres tetap jalan
        const s = GameEngine.pickEmptyCell();
        if (s) ctx.spawnSnackAt(s);
      }
    }

    // Cek exit terbuka → naik level
    if (ctx.exitUnlocked && ctx.exit && h.x === ctx.exit.x && h.y === ctx.exit.y) {
      ctx.level++;
      ctx.score += 100;
      if (ctx.onScoreChange) ctx.onScoreChange(ctx.score);
      buildPathMasterLevel(ctx);
    }
  },

  onEat(ctx, kind) {
    if (kind === "snack") ctx.score += CONFIG.SCORE_NORMAL;
  },

  spawnSnack(ctx) {
    const s = GameEngine.pickEmptyCell();
    if (s) ctx.spawnSnackAt(s);
  },

  onCollision(ctx, type) {
    ctx.lives--;
    if (ctx.lives <= 0) {
      GameEngine.helpers.endGame();
    } else {
      resetSnakePathMaster(ctx);
    }
    return true;
  },

  isLose(ctx) { return ctx.lives <= 0; },

  getObjective(ctx) {
    const total = ctx.checkpoints.length;
    const done = ctx.checkpointIndex;
    const goal = ctx.exitUnlocked
      ? "🚪 Menuju exit!"
      : "CP " + (done + 1) + "/" + total;
    return "Lv " + ctx.level + " · " + goal + " · ❤ " + ctx.lives;
  },
});

// ===== Helper Path Master =====
function buildPathMasterLevel(ctx) {
  ctx.obstacles = [];
  ctx.exit = null;
  ctx.exitUnlocked = false;

  const cx = Math.floor(ctx.cols / 2);
  const cy = Math.floor(ctx.rows / 2);
  const keepClear = (x, y) => Math.abs(x - cx) < 3 && Math.abs(y - cy) < 2;

  // Rintangan naik sesuai level
  const wallCount = 3 + ctx.level * 2;
  let placed = 0;
  let guard = 0;
  while (placed < wallCount && guard < 200) {
    guard++;
    const w = 1 + Math.floor(Math.random() * 2);
    const h = 1 + Math.floor(Math.random() * 2);
    const x0 = 2 + Math.floor(Math.random() * (ctx.cols - w - 4));
    const y0 = 2 + Math.floor(Math.random() * (ctx.rows - h - 4));
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

  // Buat 5 checkpoint acak (hindari rintangan)
  ctx.checkpoints = [];
  ctx.checkpointIndex = 0;
  let cpGuard = 0;
  while (ctx.checkpoints.length < ctx.totalCheckpoints && cpGuard < 400) {
    cpGuard++;
    const c = GameEngine.pickEmptyCell();
    if (!c) break;
    if (ctx.obstacles.some(o => o.x === c.x && o.y === c.y)) continue;
    // Jaga jarak antar checkpoint minimal 4 sel
    const tooClose = ctx.checkpoints.some(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y) < 4);
    if (tooClose) continue;
    ctx.checkpoints.push(c);
  }

  // Snack awal
  const s = GameEngine.pickEmptyCell();
  if (s) ctx.spawnSnackAt(s);

  // Tampilkan checkpoint pertama di slot exit (kotak abu-abu)
  if (ctx.checkpoints[0]) {
    ctx.exit = ctx.checkpoints[0];
    ctx.exitUnlocked = false;
  }
}

function resetSnakePathMaster(ctx) {
  const cx = Math.floor(ctx.cols / 2);
  const cy = Math.floor(ctx.rows / 2);
  ctx.body = [];
  for (let i = 0; i < CONFIG.START_LENGTH; i++) {
    ctx.body.push({ x: cx - i, y: cy });
  }
  ctx.dir = "right";
  ctx.nextDir = "right";
  ctx.snack = null;
  const sp = GameEngine.pickEmptyCell();
  if (sp) ctx.snack = sp;
  Input.clear();
}