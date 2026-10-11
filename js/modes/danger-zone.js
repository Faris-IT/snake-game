// ===== Mode: Danger Zone =====
ModeRegistry.register({
  id: "danger-zone",
  name: "Danger Zone",
  desc: "Hindari zona bahaya.",
  ready: true,
  config: { stepMs: 150, growOnEat: true, lives: 3 },

  onStart(ctx) {
    ctx._dzTimer = 0;
    ctx._dzInterval = 8000;      // 8 detik
    ctx._dzWarnDuration = 4000;  // 4 detik peringatan
    ctx._dzActiveZones = [];
    ctx._dzWarningZones = [];
    ctx._dzWarnStarted = 0;
    spawnDangerZone(ctx);
    refreshDangerTiles(ctx);
  },

  onTick(ctx, dt) {
    ctx._dzTimer += dt;
    ctx._dzWarnStarted += dt;

    // Fase peringatan → aktif setelah 2 detik
    if (ctx._dzWarningZones.length && ctx._dzWarnStarted >= ctx._dzWarnDuration) {
      ctx._dzActiveZones = ctx._dzActiveZones.concat(ctx._dzWarningZones);
      ctx._dzWarningZones = [];
      ctx._dzWarnStarted = 0;
      refreshDangerTiles(ctx);
      // Snack & bonus yang berada di zona aktif → pindahkan
      relocateSnackIfDanger(ctx);
      relocateBonusIfDanger(ctx);
    }

    // Spawn zona baru tiap 8 detik
    if (ctx._dzTimer >= ctx._dzInterval) {
      ctx._dzTimer = 0;
      spawnDangerZone(ctx);
      refreshDangerTiles(ctx);
    }
  },

  onAfterMove(ctx) {
    const h = ctx.body[0];
    const hit = ctx._dzActiveZones.some(z => z.x === h.x && z.y === h.y);
    if (hit) {
      ctx.lives--;
      ctx._dzActiveZones = ctx._dzActiveZones.filter(z => !(z.x === h.x && z.y === h.y));
      refreshDangerTiles(ctx);
      if (ctx.lives <= 0) {
        GameEngine.helpers.endGame();
      }
    }
  },

  // Snack selalu di sel aman (bukan zona aktif / warning)
  spawnSnack(ctx) {
    const pos = pickSafeCell(ctx);
    if (pos) ctx.spawnSnackAt(pos);
  },

  isLose(ctx) {
    return ctx.lives <= 0;
  },

  isWin() { return false; },

  getObjective(ctx) {
    return "❤ " + ctx.lives + " · Zona: " + ctx._dzActiveZones.length;
  },
});

// ===== Helper Danger Zone =====

// Apakah sel ini di zona aktif atau warning?
function isCellDanger(ctx, x, y) {
  if (ctx._dzActiveZones.some(z => z.x === x && z.y === y)) return true;
  if (ctx._dzWarningZones.some(z => z.x === x && z.y === y)) return true;
  return false;
}

// Pilih sel acak yang aman (bebas zona bahaya, tubuh, obstacle, snack, bonus)
function pickSafeCell(ctx) {
  const occupied = new Set();
  ctx.body.forEach(s => occupied.add(`${s.x},${s.y}`));
  ctx.obstacles.forEach(o => occupied.add(`${o.x},${o.y}`));
  if (ctx.snack) occupied.add(`${ctx.snack.x},${ctx.snack.y}`);
  if (ctx.bonus) occupied.add(`${ctx.bonus.x},${ctx.bonus.y}`);
  ctx._dzActiveZones.forEach(z => occupied.add(`${z.x},${z.y}`));
  ctx._dzWarningZones.forEach(z => occupied.add(`${z.x},${z.y}`));

  const empty = [];
  for (let y = 0; y < ctx.rows; y++) {
    for (let x = 0; x < ctx.cols; x++) {
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
    }
  }
  if (!empty.length) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

// Jika snack saat ini berada di zona bahaya → pindahkan
function relocateSnackIfDanger(ctx) {
  if (!ctx.snack) return;
  if (isCellDanger(ctx, ctx.snack.x, ctx.snack.y)) {
    const pos = pickSafeCell(ctx);
    if (pos) ctx.spawnSnackAt(pos);
  }
}

// Jika bonus saat ini berada di zona bahaya → pindahkan
function relocateBonusIfDanger(ctx) {
  if (!ctx.bonus) return;
  if (isCellDanger(ctx, ctx.bonus.x, ctx.bonus.y)) {
    const pos = pickSafeCell(ctx);
    if (pos) ctx.bonus = pos;
  }
}

// Spawn zona peringatan baru
function spawnDangerZone(ctx) {
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const cell = GameEngine.pickEmptyCell();
    if (cell) {
      const dupA = ctx._dzActiveZones.some(z => z.x === cell.x && z.y === cell.y);
      const dupW = ctx._dzWarningZones.some(z => z.x === cell.x && z.y === cell.y);
      if (!dupA && !dupW) ctx._dzWarningZones.push(cell);
    }
  }
}

// Sinkronkan tiles untuk renderer
function refreshDangerTiles(ctx) {
  const tiles = [];
  ctx._dzActiveZones.forEach(z => tiles.push({ x: z.x, y: z.y, kind: "danger" }));
  ctx._dzWarningZones.forEach(z => tiles.push({ x: z.x, y: z.y, kind: "warning" }));
  ctx.setTiles(tiles);
}