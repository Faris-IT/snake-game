// ===== Mode: Portal Snack (4 pasang portal) =====
ModeRegistry.register({
  id: "portal-snack",
  name: "Portal Snack",
  desc: "8 portal, teleportasi chaos.",
  ready: true,
  config: { stepMs: 150, growOnEat: true, lives: 1, targetSnacks: 15 },

  onStart(ctx) {
    ctx.targetSnacks = 15;
    ctx._psMoveTimer = 0;
    ctx._psMoveInterval = 15000;
    ctx._psWarnDuration = 2000;
    ctx._psWarnTimer = 0;
    ctx._psWarning = false;
    buildPortalPairs(ctx);
  },

  onTick(ctx, dt) {
    ctx._psMoveTimer += dt;

    if (!ctx._psWarning && ctx._psMoveTimer >= ctx._psMoveInterval - ctx._psWarnDuration) {
      ctx._psWarning = true;
      ctx._psWarnTimer = 0;
    }
    if (ctx._psWarning) {
      ctx._psWarnTimer += dt;
      if (ctx._psWarnTimer >= ctx._psWarnDuration) {
        buildPortalPairs(ctx);
        ctx._psWarning = false;
        ctx._psWarnTimer = 0;
        ctx._psMoveTimer = 0;
      }
    }
  },

  onEat(ctx, kind) {
    if (kind === "snack") ctx.score += CONFIG.SCORE_NORMAL;
  },

  onAfterMove(ctx, newHead) {
    for (const p of ctx.portals) {
      if (p.a.x === newHead.x && p.a.y === newHead.y) {
        if (portalTargetFree(ctx, p.b, p)) {
          ctx.body[0] = { x: p.b.x, y: p.b.y };
        }
        return;
      }
      if (p.b.x === newHead.x && p.b.y === newHead.y) {
        if (portalTargetFree(ctx, p.a, p)) {
          ctx.body[0] = { x: p.a.x, y: p.a.y };
        }
        return;
      }
    }
  },

  isWin(ctx) { return ctx.eaten >= ctx.targetSnacks; },

  getObjective(ctx) {
    const blink = ctx._psWarning ? " ⚡" : "";
    const left = Math.max(0, Math.ceil((ctx._psMoveInterval - ctx._psMoveTimer) / 1000));
    return "🌀 " + ctx.eaten + "/" + ctx.targetSnacks +
           " · Pindah " + left + "s" + blink;
  },
});

// ===== Helper Portal Snack =====
// excludePair: pasangan portal yang SEDANG dipakai (agar tidak dianggap "terisi")
function portalTargetFree(ctx, pos, excludePair) {
  if (pos.x < 0 || pos.y < 0 || pos.x >= ctx.cols || pos.y >= ctx.rows) return false;
  if (ctx.obstacles.some(o => o.x === pos.x && o.y === pos.y)) return false;

  // Cek portal LAIN (bukan pasangan dirinya sendiri)
  for (const p of ctx.portals) {
    if (p === excludePair) continue;
    if ((p.a.x === pos.x && p.a.y === pos.y) ||
        (p.b.x === pos.x && p.b.y === pos.y)) return false;
  }

  // Cek badan ular (bukan head yang sedang berpindah)
  for (let i = 1; i < ctx.body.length; i++) {
    if (ctx.body[i].x === pos.x && ctx.body[i].y === pos.y) return false;
  }
  return true;
}

function buildPortalPairs(ctx) {
  const PAIR_COUNT = 4;
  const cells = [];
  const occupied = new Set();
  ctx.body.forEach(s => occupied.add(`${s.x},${s.y}`));
  const cx = Math.floor(ctx.cols / 2);
  const cy = Math.floor(ctx.rows / 2);

  for (let y = 1; y < ctx.rows - 1; y++) {
    for (let x = 1; x < ctx.cols - 1; x++) {
      if (Math.abs(x - cx) < 5 && Math.abs(y - cy) < 3) continue;
      if (occupied.has(`${x},${y}`)) continue;
      cells.push({ x, y });
    }
  }
  if (cells.length < PAIR_COUNT * 2) {
    ctx.portals = [];
    return;
  }

  const picked = [];
  const usedKeys = new Set();
  let guard = 0;
  let minDist = 3;
  while (picked.length < PAIR_COUNT * 2 && guard < 800) {
    guard++;
    const c = cells[Math.floor(Math.random() * cells.length)];
    const key = `${c.x},${c.y}`;
    if (usedKeys.has(key)) continue;
    const tooClose = picked.some(p => Math.abs(p.x - c.x) + Math.abs(p.y - c.y) < minDist);
    if (tooClose) {
      if (guard > 400) minDist = 2;
      if (guard > 600) minDist = 1;
      continue;
    }
    usedKeys.add(key);
    picked.push(c);
  }
  if (picked.length < PAIR_COUNT * 2) {
    ctx.portals = [];
    return;
  }

  const pairs = [];
  for (let i = 0; i < PAIR_COUNT; i++) {
    pairs.push({ a: picked[i * 2], b: picked[i * 2 + 1] });
  }
  ctx.portals = pairs;
}