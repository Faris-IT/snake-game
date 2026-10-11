// ===== Mode: Snack Hunter =====
ModeRegistry.register({
  id: "snack-hunter",
  name: "Snack Hunter",
  desc: "Kumpulkan 20 snack.",
  ready: true,
  config: { stepMs: 140, growOnEat: true, lives: 3, targetSnacks: 20 },

  onStart(ctx) {
    ctx.targetSnacks = 20;
    ctx._shBonusActive = false;
    ctx._shBonusTimer = 0;
    ctx._shBonusAge = 0;
    ctx._shBonusInterval = 8000;
    ctx._shBonusLife = 5000;
  },

  onTick(ctx, dt) {
    if (!ctx._shBonusActive) {
      ctx._shBonusTimer += dt;
      if (ctx._shBonusTimer >= ctx._shBonusInterval) {
        ctx._shBonusTimer = 0;
        ctx.spawnBonusRandom();
        ctx._shBonusActive = true;
        ctx._shBonusAge = 0;
      }
    } else {
      ctx._shBonusAge += dt;
      if (ctx._shBonusAge >= ctx._shBonusLife) {
        ctx.clearBonus();
        ctx._shBonusActive = false;
      }
    }
  },

  onEat(ctx, kind) {
    if (kind === "snack") {
      ctx.score += CONFIG.SCORE_NORMAL;
      ctx.targetSnacks--;
    } else if (kind === "bonus") {
      ctx.score += CONFIG.SCORE_BONUS;
      ctx._shBonusActive = false;
      ctx._shBonusTimer = 0;
    }
  },

  isWin(ctx)  { return ctx.targetSnacks <= 0; },
  isLose(ctx) { return ctx.lives <= 0; },

  onCollision(ctx, type) {
    ctx.lives--;
    if (ctx.lives <= 0) {
      GameEngine.helpers.endGame();
    } else {
      resetSnakeHunter(ctx);
    }
    return true;
  },

  getObjective(ctx) {
    const eatenCount = 20 - ctx.targetSnacks;
    return "🎯 " + eatenCount + "/20 · ❤ " + ctx.lives;
  },
});

function resetSnakeHunter(ctx) {
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