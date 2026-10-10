// ===== Mode: Snack Hunter =====
ModeRegistry.register({
  id: "snack-hunter",
  name: "Snack Hunter",
  desc: "Kumpulkan 20 snack.",
  ready: true,
  config: { stepMs: 140, growOnEat: true, lives: 3, targetSnacks: 20 },

  onStart(ctx) {
    ctx.targetSnacks = 20;
    ctx._bonusActive = false;
    ctx._bonusTimer = 0;
    ctx._bonusAge = 0;
    ctx._bonusInterval = 8000;
    ctx._bonusLife = 5000;
  },

  onTick(ctx, dt) {
    if (!ctx._bonusActive) {
      ctx._bonusTimer += dt;
      if (ctx._bonusTimer >= ctx._bonusInterval) {
        ctx._bonusTimer = 0;
        ctx.spawnBonusRandom();
        ctx._bonusActive = true;
        ctx._bonusAge = 0;
      }
    } else {
      ctx._bonusAge += dt;
      if (ctx._bonusAge >= ctx._bonusLife) {
        ctx.clearBonus();
        ctx._bonusActive = false;
      }
    }
  },

  onEat(ctx, kind) {
    if (kind === "snack") {
      ctx.score += CONFIG.SCORE_NORMAL;
      ctx.targetSnacks--;
    } else if (kind === "bonus") {
      ctx.score += CONFIG.SCORE_BONUS;
      ctx._bonusActive = false;
      ctx._bonusTimer = 0;
    }
  },

  isWin(ctx) {
    return ctx.targetSnacks <= 0;
  },

  isLose(ctx) {
    return ctx.lives <= 0;
  },

  onCollision(ctx, type) {
    ctx.lives--;
    if (ctx.lives <= 0) {
      GameEngine.helpers.endGame();
    } else {
      resetSnake(ctx);
    }
    return true; // hentikan tick, kita sudah handle
  },

  getObjective(ctx) {
    const eatenCount = 20 - ctx.targetSnacks;
    return "🎯 " + eatenCount + "/20 · ❤ " + ctx.lives;
  },
});

function resetSnake(ctx) {
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