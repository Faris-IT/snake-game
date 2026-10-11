// ===== Mode: Mystery Snack (variasi efek lengkap) =====
ModeRegistry.register({
  id: "mystery-snack",
  name: "Mystery Snack",
  desc: "Efek acak & kombinasi.",
  ready: true,
  config: { stepMs: 150, growOnEat: true, lives: 1, durationMs: 90000 },

  onStart(ctx) {
    ctx._msTimer = 0;
    ctx._msInterval = 5000;      // spawn mystery snack tiap 5 detik
    ctx._msActiveEffects = [];   // array { kind, remaining }
    ctx._msBaseStepMs = 150;
    ctx._msShield = false;
    ctx._msFreeze = false;
    ctx._msFreezeTimer = 0;
    ctx._msReverse = false;
    ctx._msBlind = false;
    ctx._msLastPick = "";
    ctx._blindOverlay = false;
  },

  onTick(ctx, dt) {
    // Freeze: dunia berhenti
    if (ctx._msFreeze) {
      ctx._msFreezeTimer -= dt;
      if (ctx._msFreezeTimer <= 0) {
        ctx._msFreeze = false;
        ctx._msLastPick = "Waktu lanjut";
      }
      return;
    }

    // Spawn mystery snack berkala
    if (!ctx.bonus) {
      ctx._msTimer += dt;
      if (ctx._msTimer >= ctx._msInterval) {
        ctx._msTimer = 0;
        ctx.spawnBonusRandom();
      }
    }

    // Update durasi efek aktif
    for (let i = ctx._msActiveEffects.length - 1; i >= 0; i--) {
      const e = ctx._msActiveEffects[i];
      e.remaining -= dt;
      if (e.remaining <= 0) {
        if (e.kind === "slow")    ctx.stepMs = ctx._msBaseStepMs;
        if (e.kind === "speed")   ctx.stepMs = ctx._msBaseStepMs;
        if (e.kind === "shield")  ctx._msShield = false;
        if (e.kind === "reverse") ctx._msReverse = false;
        if (e.kind === "blind")   ctx._msBlind = false;
        ctx._msActiveEffects.splice(i, 1);
      }
    }

    // Sinkron blind overlay ke renderer
    ctx._blindOverlay = ctx._msBlind;
  },

  onEat(ctx, kind) {
    if (kind === "snack") {
      ctx.score += CONFIG.SCORE_NORMAL;
    } else if (kind === "bonus") {
      triggerMystery(ctx);
    }
  },

  onCollision(ctx, type) {
    if (ctx._msShield) {
      ctx._msShield = false;
      ctx._msActiveEffects = ctx._msActiveEffects.filter(e => e.kind !== "shield");
      ctx._msLastPick = "🛡 Shield menyerap!";
      resetSnakeMystery(ctx);
      return true;
    }
    return false;
  },

  isLose(ctx) {
    return ctx.elapsedMs >= 90000;
  },

  getObjective(ctx) {
    const left = Math.max(0, 90 - Math.floor(ctx.elapsedMs / 1000));
    const effects = ctx._msActiveEffects.map(e => {
      const sec = Math.ceil(e.remaining / 1000);
      return effectLabel(e.kind) + " " + sec + "s";
    }).join(" · ");
    const line = effects ? " · " + effects : (ctx._msLastPick ? " · " + ctx._msLastPick : "");
    return "⏱ " + left + "s" + line;
  },
});

// ===== Tabel Efek =====
const MYSTERY_EFFECTS = [
  { kind: "points",   weight: 20, duration: 0,    rare: false },
  { kind: "shrink",   weight: 12, duration: 0,    rare: false },
  { kind: "slow",     weight: 10, duration: 5000, rare: false },
  { kind: "speed",    weight: 8,  duration: 5000, rare: false },
  { kind: "shield",   weight: 8,  duration: 8000, rare: false },
  { kind: "reverse",  weight: 6,  duration: 4000, rare: false },
  { kind: "blind",    weight: 6,  duration: 3000, rare: false },
  { kind: "jackpot",  weight: 3,  duration: 0,    rare: true  },
  { kind: "freeze",   weight: 3,  duration: 3000, rare: true  },
  { kind: "teleport", weight: 3,  duration: 0,    rare: true  },
];

function pickWeighted(list) {
  const total = list.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of list) {
    r -= e.weight;
    if (r <= 0) return e;
  }
  return list[0];
}

function triggerMystery(ctx) {
  const isCombo = Math.random() < 0.25;
  if (isCombo) {
    const e1 = pickWeighted(MYSTERY_EFFECTS);
    let e2 = pickWeighted(MYSTERY_EFFECTS);
    let guard = 0;
    while (e2.kind === e1.kind && guard < 10) {
      e2 = pickWeighted(MYSTERY_EFFECTS);
      guard++;
    }
    applyMysteryEffect(ctx, e1);
    applyMysteryEffect(ctx, e2);
    ctx._msLastPick = "✨ " + effectLabel(e1.kind) + " + " + effectLabel(e2.kind);
  } else {
    const e = pickWeighted(MYSTERY_EFFECTS);
    applyMysteryEffect(ctx, e);
    ctx._msLastPick = effectLabel(e.kind);
  }
  if (ctx.onScoreChange) ctx.onScoreChange(ctx.score);
}

function applyMysteryEffect(ctx, effect) {
  switch (effect.kind) {
    case "points": {
      const bonus = 20 + Math.floor(Math.random() * 30);
      ctx.score += bonus;
      break;
    }
    case "jackpot": {
      ctx.score += 100;
      break;
    }
    case "shrink": {
      while (ctx.body.length > 3 && Math.random() < 0.5) ctx.body.pop();
      break;
    }
    case "slow": {
      ctx.stepMs = 220;
      addEffect(ctx, "slow", effect.duration);
      break;
    }
    case "speed": {
      ctx.stepMs = 90;
      addEffect(ctx, "speed", effect.duration);
      break;
    }
    case "shield": {
      ctx._msShield = true;
      addEffect(ctx, "shield", effect.duration);
      break;
    }
    case "reverse": {
      ctx._msReverse = true;
      window._mufaReverseInput = true;
      addEffect(ctx, "reverse", effect.duration);
      break;
    }
    case "blind": {
      ctx._msBlind = true;
      addEffect(ctx, "blind", effect.duration);
      break;
    }
    case "freeze": {
      ctx._msFreeze = true;
      ctx._msFreezeTimer = effect.duration;
      break;
    }
    case "teleport": {
      const target = GameEngine.pickEmptyCell();
      if (target) {
        ctx.body[0] = { x: target.x, y: target.y };
      }
      break;
    }
  }
}

function addEffect(ctx, kind, duration) {
  const existing = ctx._msActiveEffects.find(e => e.kind === kind);
  if (existing) existing.remaining = duration;
  else ctx._msActiveEffects.push({ kind, remaining: duration });
}

function effectLabel(kind) {
  return ({
    points:   "💎",
    jackpot:  "💰",
    shrink:   "✂",
    slow:     "🐢",
    speed:    "⚡",
    shield:   "🛡",
    reverse:  "🔄",
    blind:    "🌑",
    freeze:   "❄",
    teleport: "🌌",
  })[kind] || kind;
}

function resetSnakeMystery(ctx) {
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